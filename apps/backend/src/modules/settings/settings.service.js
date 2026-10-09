const prisma = require("../../lib/prisma");

const SETTINGS_ID = "global";
const CACHE_TTL_MS = 60 * 1000;

// Accepted formats per tracking ID. Anything else is rejected so IDs can be
// safely interpolated into tag snippets.
const ID_FORMATS = {
  gtmId: /^GTM-[A-Z0-9]{4,12}$/,
  ga4MeasurementId: /^G-[A-Z0-9]{4,16}$/,
  googleAdsId: /^AW-\d{6,14}$/,
  googleAdsConversionLabel: /^[A-Za-z0-9_-]{4,64}$/,
  metaPixelId: /^\d{6,20}$/,
  tiktokPixelId: /^[A-Z0-9]{8,32}$/,
  snapchatPixelId: /^[a-f0-9-]{8,64}$/i,
};
const UPPERCASE_FIELDS = new Set([
  "gtmId",
  "ga4MeasurementId",
  "googleAdsId",
  "tiktokPixelId",
]);

const EMPTY_SETTINGS = {
  id: SETTINGS_ID,
  gtmId: null,
  ga4MeasurementId: null,
  googleAdsId: null,
  googleAdsConversionLabel: null,
  metaPixelId: null,
  tiktokPixelId: null,
  snapchatPixelId: null,
  googleTagsViaGtm: false,
};

let cache = { at: 0, value: null };

function normalizeId(field, value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  let v = String(value).trim();
  if (!v) return null;
  if (UPPERCASE_FIELDS.has(field)) v = v.toUpperCase();
  const re = ID_FORMATS[field];
  if (re && !re.test(v)) {
    throw { status: 400, message: `Invalid ${field}: "${v}"` };
  }
  return v;
}

/** Global tracking settings (cached). GTM_ID env var is a fallback for GTM only. */
async function getTrackingSettings({ fresh = false } = {}) {
  if (!fresh && cache.value && Date.now() - cache.at < CACHE_TTL_MS)
    return cache.value;
  let row = null;
  try {
    row = await prisma.trackingSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
  } catch (err) {
    // Table may not exist yet (migration not applied) — fall back to env only
    console.error("[TrackingSettings] read failed:", err.message);
  }
  const value = { ...EMPTY_SETTINGS, ...(row || {}) };
  if (!value.gtmId) {
    const envGtm = String(process.env.GTM_ID || "")
      .trim()
      .toUpperCase();
    if (ID_FORMATS.gtmId.test(envGtm)) value.gtmId = envGtm;
  }
  cache = { at: Date.now(), value };
  return value;
}

async function updateTrackingSettings(body = {}) {
  const data = {};
  for (const field of Object.keys(ID_FORMATS)) {
    const v = normalizeId(field, body[field]);
    if (v !== undefined) data[field] = v;
  }
  if (body.googleTagsViaGtm !== undefined) {
    data.googleTagsViaGtm = Boolean(body.googleTagsViaGtm);
  }
  await prisma.trackingSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
  cache = { at: 0, value: null };
  return getTrackingSettings({ fresh: true });
}

function clearTrackingSettingsCache() {
  cache = { at: 0, value: null };
}

/**
 * Effective tracking config for a page.
 *
 * Default: the page uses Global AGL Tracking only (page-level IDs are ignored).
 * With page.trackingOverride = true, each page-level ID that is filled in
 * replaces the global one; empty page fields still fall back to global.
 *
 * ga4Ids / googleAdsIds are the IDs the browser must load directly via
 * gtag.js. When the global GA4/Ads tags live inside the global GTM container
 * (googleTagsViaGtm), they are left out so nothing is counted twice.
 */
function buildTrackingConfig(global, page = {}) {
  const override = page.trackingOverride === true;
  const clean = (v) => (v ? String(v).trim() : "");
  const pick = (pageVal, globalVal) =>
    (override && clean(pageVal)) || clean(globalVal) || null;
  const list = (v) => (v ? [v] : []);

  const gtmId = pick(page.gtmId, global.gtmId);
  const ga4 = pick(page.ga4MeasurementId, global.ga4MeasurementId);
  const ads = pick(page.googleAdsId, global.googleAdsId);
  // Global GA4/Ads are inside GTM only if this page actually uses the global container
  const viaGtm = Boolean(global.googleTagsViaGtm && global.gtmId && gtmId === clean(global.gtmId));
  const direct = (id, globalId) => (id && !(viaGtm && id === clean(globalId)) ? [id] : []);

  return {
    usingOverride: override,
    gtmIds: list(gtmId),
    ga4Ids: direct(ga4, global.ga4MeasurementId),
    googleAdsIds: direct(ads, global.googleAdsId),
    googleAdsConversionLabel:
      ads && ads === clean(global.googleAdsId) ? global.googleAdsConversionLabel || null : null,
    metaPixelIds: list(pick(page.fbPixelId, global.metaPixelId || page.project?.metaPixelId)),
    tiktokPixelIds: list(pick(page.tiktokPixelId, global.tiktokPixelId)),
    snapchatPixelIds: list(pick(page.snapchatPixelId, global.snapchatPixelId)),
    googleTagsViaGtm: viaGtm,
    // GTM container rendered into this page's HTML by the server
    serverGtmId: gtmId,
  };
}

module.exports = {
  getTrackingSettings,
  updateTrackingSettings,
  clearTrackingSettingsCache,
  buildTrackingConfig,
  ID_FORMATS,
};
