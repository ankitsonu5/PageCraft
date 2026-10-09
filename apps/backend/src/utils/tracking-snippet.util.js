/**
 * Server-side Google Tag Manager injection.
 *
 * The Angular shell (index.html) is served for every public route. Injecting
 * GTM here — instead of from the page viewer after the API call — puts the
 * official snippet in the raw HTML so Tag Assistant / Google's install checks
 * detect it on every URL, and it loads exactly once per document.
 */
const fs = require("fs");

const GTM_ID_RE = /^GTM-[A-Z0-9]{4,12}$/;

function getGlobalGtmId() {
  const id = String(process.env.GTM_ID || "")
    .trim()
    .toUpperCase();
  return GTM_ID_RE.test(id) ? id : null;
}

function buildHeadSnippet(gtmId) {
  return `<!-- Google Tag Manager -->
<script>window.__PC_GTM_ID=${JSON.stringify(gtmId)};
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});</script>
<!-- End Google Tag Manager -->`;
}

function buildBodySnippet(gtmId) {
  return `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
}

/** Inject GTM as high in <head> as possible and right after <body>. */
function injectTracking(html, gtmId) {
  if (!gtmId) return html;
  return html
    .replace(/<head([^>]*)>/i, (m) => `${m}\n${buildHeadSnippet(gtmId)}`)
    .replace(/<body([^>]*)>/i, (m) => `${m}\n${buildBodySnippet(gtmId)}`);
}

let cache = { mtimeMs: 0, raw: "" };

function readIndex(indexPath) {
  const { mtimeMs } = fs.statSync(indexPath);
  if (cache.mtimeMs !== mtimeMs) {
    cache = { mtimeMs, raw: fs.readFileSync(indexPath, "utf8") };
  }
  return cache.raw;
}

/**
 * index.html with the global GTM snippet and (for release pages) server-rendered
 * <title> + SEO / Open Graph tags, so crawlers and Tag Assistant see them
 * without running JavaScript.
 */
function renderIndexHtml(indexPath, { gtmId = null, title = null, headTags = "" } = {}) {
  let html = injectTracking(readIndex(indexPath), gtmId);
  if (title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${title}</title>`);
  }
  if (headTags) {
    html = html.replace(/<\/head>/i, () => `${headTags}\n</head>`);
  }
  return html;
}

module.exports = { getGlobalGtmId, injectTracking, renderIndexHtml };
