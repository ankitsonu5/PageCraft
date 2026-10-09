/**
 * SEO & social-share fields for a page. Manually entered values win; empty
 * fields fall back to defaults generated from the track / artist / release data.
 */

const { parseSections } = require("./sections.util");

const RELEASE_SECTION_TYPES = ["smart-link", "pre-save", "podcast-smart-link"];


const clean = (v) => (typeof v === "string" ? v.trim() : "");
const truncate = (s, max) =>
  s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;

const RELEASE_TYPE_LABELS = { ep: "EP", lp: "LP" };

/** "single" → "Single", "ep" → "EP" (display form used in events). */
function formatReleaseType(v) {
  const t = clean(v).replace(/[_-]+/g, " ");
  if (!t) return "";
  if (RELEASE_TYPE_LABELS[t.toLowerCase()]) return RELEASE_TYPE_LABELS[t.toLowerCase()];
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Release info (track, artist, type, artwork) from page fields + its release
 * section. When the artist field is empty and the title reads
 * "Artist - Track" (e.g. "Ashwin Gane - DND"), the two are split.
 */
function getReleaseInfo(page) {
  const sections = parseSections(page.sections);
  const release = sections.find((s) => RELEASE_SECTION_TYPES.includes(s?.type));
  const d = release?.data || {};
  // The section type decides podcast vs music; campaignType defaults to
  // "podcast" in the database, so it is only trusted when there is no section.
  const isPodcast = release
    ? release.type === "podcast-smart-link"
    : page.campaignType === "podcast";
  const isPreSave = release ? release.type === "pre-save" : page.campaignType === "presave";

  let trackName = clean(d.title) || clean(page.title);
  let artistName =
    clean(page.artistName) || clean(d.artist) || (isPodcast ? clean(d.hostName) : "");
  if (artistName && trackName.toLowerCase().startsWith(`${artistName.toLowerCase()} - `)) {
    trackName = trackName.slice(artistName.length + 3).trim();
  } else if (!artistName) {
    const m = /^(.+?)\s+[-–—]\s+(.+)$/.exec(trackName);
    if (m && !isPodcast) [, artistName, trackName] = m.map((x) => x.trim());
  }

  return {
    trackName,
    artistName,
    releaseType: formatReleaseType(d.releaseType) || (isPodcast ? "Podcast" : "Single"),
    artwork: clean(d.coverUrl) || clean(d.artworkUrl) || clean(page.coverImage),
    isPodcast,
    isPreSave,
  };
}

function absoluteUrl(url, origin) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/") && origin) return `${origin}${url}`;
  return "";
}

/**
 * @param page   Page row (with sections)
 * @param origin Public origin of the page, e.g. https://agl.sh
 */
function buildSeo(page, origin = "") {
  const r = getReleaseInfo(page);
  const byArtist = r.artistName ? ` by ${r.artistName}` : "";

  // Defaults agreed with Kyyba:
  //   [Track Name] – [Artist Name] | Listen Now
  //   Listen to [Track Name] by [Artist Name] on Spotify, Apple Music, YouTube Music, Amazon Music and more.
  const defaultTitle = truncate(
    `${r.trackName}${r.artistName ? ` – ${r.artistName}` : ""} | ${r.isPreSave ? "Pre-Save Now" : "Listen Now"}`,
    70,
  );
  const defaultDescription = truncate(
    r.isPreSave
      ? `Pre-save ${r.trackName}${byArtist} on Spotify, Apple Music, Amazon Music and more.`
      : r.isPodcast
        ? `Listen to ${r.trackName}${byArtist} on Spotify, Apple Podcasts, YouTube and more.`
        : `Listen to ${r.trackName}${byArtist} on Spotify, Apple Music, YouTube Music, Amazon Music and more.`,
    160,
  );

  const title = clean(page.metaTitle) || defaultTitle;
  const description = clean(page.metaDescription) || defaultDescription;
  const base = page.customDomain
    ? `https://${String(page.customDomain)
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "")}`
    : origin;

  return {
    title,
    description,
    ogTitle: clean(page.ogTitle) || title,
    ogDescription: clean(page.ogDescription) || description,
    image: absoluteUrl(clean(page.ogImage) || r.artwork, origin),
    url: base ? `${base}/${page.slug}` : "",
    defaults: { title: defaultTitle, description: defaultDescription },
    release: r,
  };
}

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** <head> tags for crawlers (Google, WhatsApp, Facebook, X) that don't run JavaScript. */
function buildSeoHeadTags(seo) {
  const tags = [
    `<meta name="description" content="${escapeHtml(seo.description)}">`,
    seo.url && `<link rel="canonical" href="${escapeHtml(seo.url)}">`,
    `<meta property="og:type" content="${seo.release.isPodcast ? "website" : "music.song"}">`,
    `<meta property="og:title" content="${escapeHtml(seo.ogTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.ogDescription)}">`,
    seo.url && `<meta property="og:url" content="${escapeHtml(seo.url)}">`,
    seo.image &&
      `<meta property="og:image" content="${escapeHtml(seo.image)}">`,
    `<meta name="twitter:card" content="${seo.image ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${escapeHtml(seo.ogTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(seo.ogDescription)}">`,
    seo.image &&
      `<meta name="twitter:image" content="${escapeHtml(seo.image)}">`,
  ];
  return tags.filter(Boolean).join("\n");
}

module.exports = { buildSeo, buildSeoHeadTags, getReleaseInfo, formatReleaseType, escapeHtml };
