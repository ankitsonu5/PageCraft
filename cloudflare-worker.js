/**
 * Cloudflare Worker — ashwingane.com
 *
 * Logic:
 *   1. WordPress paths (admin, assets, known pages) → pass to WordPress origin
 *   2. Everything else → proxy to PageCraft at page.ashwingane.com/:slug
 *
 * Deploy: Cloudflare Dashboard → Workers & Pages → Create Worker → paste this
 */

// Paths that always go to WordPress
const WORDPRESS_PREFIXES = [
  "/wp-", // /wp-admin, /wp-content, /wp-json, /wp-login.php
  "/feed",
  "/sitemap",
  "/xmlrpc",
  "/favicon",
  "/.well-known",
];

// Exact paths that are WordPress pages (add more as needed)
const WORDPRESS_EXACT_PATHS = new Set([
  "/",
  "/about",
  "/about-ashwin",
  "/music",
  "/tour",
  "/tour-dates",
  "/contact",
  "/blog",
  "/shop",
  "/videos",
  "/gallery",
  "/press",
]);

const PAGECRAFT_ORIGIN = "https://page.ashwingane.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. WordPress prefix paths — pass through
    if (WORDPRESS_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return fetch(request);
    }

    // 2. Known WordPress exact pages — pass through
    if (
      WORDPRESS_EXACT_PATHS.has(path) ||
      WORDPRESS_EXACT_PATHS.has(path.replace(/\/$/, ""))
    ) {
      return fetch(request);
    }

    // 3. Multi-segment paths like /blog/post-name — pass through to WordPress
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 1) {
      return fetch(request);
    }

    // 4. Single-segment path → try PageCraft
    const pagecraftUrl = `${PAGECRAFT_ORIGIN}${path}${url.search}`;

    const pagecraftResponse = await fetch(pagecraftUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        "X-Forwarded-Host": url.host,
        "X-Forwarded-Proto": url.protocol.replace(":", ""),
      },
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
    });

    // If PageCraft returns a real page (not Angular 404 shell), serve it
    // PageCraft's Angular SPA returns 200 even for unknown slugs,
    // so we trust the response and serve it directly.
    return new Response(pagecraftResponse.body, {
      status: pagecraftResponse.status,
      headers: pagecraftResponse.headers,
    });
  },
};
