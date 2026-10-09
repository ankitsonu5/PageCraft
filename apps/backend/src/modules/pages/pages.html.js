/**
 * Serves the Angular index.html for every non-API route with:
 *   - the global GTM container (AGL Admin → Settings → Tracking & Analytics)
 *   - for release URLs (/:slug): <title>, meta description, canonical and
 *     Open Graph / Twitter tags, so social crawlers get the right preview.
 */
const path = require("path");
const { renderIndexHtml } = require("../../utils/tracking-snippet.util");
const {
  buildSeo,
  buildSeoHeadTags,
  escapeHtml,
} = require("../../utils/seo.util");
const { getTrackingSettings, buildTrackingConfig } = require("../settings/settings.service");
const { findPublicPage, requestOrigin } = require("./pages.public.router");
const { RESERVED_SLUGS } = require("./pages.service");

const SLUG_PATH_RE = /^\/([a-z0-9_-]+)\/?$/i;
const SEO_CACHE_TTL_MS = 30 * 1000;
const SEO_CACHE_MAX = 500;
const seoCache = new Map(); // key: origin|slug → { at, value }

function clearPageHtmlCache() {
  seoCache.clear();
}

/** SEO + page tracking flags for a release URL (/:slug), or null for other routes. */
async function getPageInfoForPath(req) {
  const m = SLUG_PATH_RE.exec(req.path);
  if (!m) return null;
  const slug = m[1].toLowerCase();
  if (RESERVED_SLUGS.includes(slug)) return null;

  const origin = requestOrigin(req);
  const key = `${origin}|${slug}`;
  const hit = seoCache.get(key);
  if (hit && Date.now() - hit.at < SEO_CACHE_TTL_MS) return hit.value;

  const page = await findPublicPage(slug);
  const value = page
    ? {
        seo: buildSeo(page, origin),
        trackingPage: { trackingOverride: page.trackingOverride, gtmId: page.gtmId },
      }
    : null;
  if (seoCache.size >= SEO_CACHE_MAX)
    seoCache.delete(seoCache.keys().next().value);
  seoCache.set(key, { at: Date.now(), value });
  return value;
}

function createIndexHandler(publicDir) {
  const indexPath = path.join(publicDir, "index.html");
  return async (req, res) => {
    let gtmId = null;
    let seo = null;
    try {
      const [global, info] = await Promise.all([
        getTrackingSettings(),
        getPageInfoForPath(req),
      ]);
      seo = info?.seo || null;
      // Release pages honour "Override Global Tracking"; all other routes use the global container
      gtmId = buildTrackingConfig(global, info?.trackingPage || {}).gtmIds[0] || null;
    } catch (err) {
      // Never fail the page because tracking/SEO lookup failed
      console.error("[IndexHtml]", err.message);
    }
    res.set("Cache-Control", "no-cache");
    res.type("html").send(
      renderIndexHtml(indexPath, {
        gtmId,
        title: seo ? escapeHtml(seo.title) : null,
        headTags: seo ? buildSeoHeadTags(seo) : "",
      }),
    );
  };
}

module.exports = { createIndexHandler, clearPageHtmlCache };
