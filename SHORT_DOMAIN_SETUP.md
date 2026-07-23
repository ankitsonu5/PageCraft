# Custom Short Domain Setup Guide for PageCraft

This guide details how to configure custom short domains (e.g. `ag.fm`, `ag.link`, `kym.fm`) with PageCraft for zero-code-change domain integration.

---

## 1. Domain Configuration Hierarchy

PageCraft dynamically generates URLs via `getCleanCampaignUrl(slug, customDomain)` using a strict 4-level fallback hierarchy:

1. **Page/Project Custom Domain**: Stored in PostgreSQL `Page.customDomain` or `Project.customDomain` (e.g. `ag.fm` or `kym.fm`).
2. **Global Environment Base URL**: Set via `publicBaseUrl` in `apps/frontend/src/environments/environment.prod.ts` or `process.env.PUBLIC_BASE_URL`.
3. **Dynamic Browser Origin**: Automatically detects current host (e.g. `https://page.ashwingane.com` or custom proxy origin).
4. **API Base URL Fallback**: Strips `/api` suffix from `environment.apiUrl`.

---

## 2. Required DNS Records

When purchasing a new short domain (e.g., `ag.fm`, `ag.link`, `kym.fm`), configure DNS records in your domain registrar or Cloudflare:

| Record Type | Name / Host | Target / Value | TTL | Proxy Status |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `@` (root) | `page.ashwingane.com` | Auto | Proxied (Orange Cloud) |
| **CNAME** | `www` | `page.ashwingane.com` | Auto | Proxied (Orange Cloud) |

---

## 3. Cloudflare Worker Setup

To route traffic from your short domain directly to PageCraft with full SSL/TLS and canonical header support:

1. Log into your **Cloudflare Dashboard**.
2. Go to **Workers & Pages** -> **Create Worker**.
3. Deploy the following worker code (already included in `cloudflare-worker.js`):

```javascript
const PAGECRAFT_ORIGIN = "https://page.ashwingane.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Forward request to PageCraft origin preserving Host header
    const targetUrl = `${PAGECRAFT_ORIGIN}${url.pathname}${url.search}`;

    return fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        "X-Forwarded-Host": url.host,
        "X-Forwarded-Proto": url.protocol.replace(":", ""),
      },
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    });
  },
};
```

4. Attach Custom Domains in Worker settings:
   - `ag.fm/*`
   - `ag.link/*`
   - `kym.fm/*`

---

## 4. HTTPS & SSL/TLS Requirements

- **SSL Mode**: Set Cloudflare SSL/TLS encryption mode to **Full (strict)**.
- **Edge Certificates**: Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.
- **HSTS**: Enable HTTP Strict Transport Security (HSTS) for maximum security.

---

## 5. Zero-Code Domain Assignment in PageCraft

Once the DNS / Cloudflare Worker is active, no code changes or redeployments are needed!

To assign a custom domain to any campaign page:
1. Open the page settings in PageCraft Builder or Admin Panel.
2. Enter the purchased short domain in the **Custom Domain** field (e.g. `ag.fm` or `ag.link`).
3. Click **Save Settings** & **Publish Page**.
4. The system automatically updates:
   - Live URL display
   - Copy link button
   - QR code image
   - Open Graph `og:url` meta tags
   - `<link rel="canonical">` link header
