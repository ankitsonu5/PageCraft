import { environment } from "../../../environments/environment";

export function sanitizeSlug(rawSlug: string): string {
  if (!rawSlug) return "";
  return String(rawSlug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCleanCampaignUrl(slug: string, customDomain?: string | null): string {
  if (!slug) return "";
  const cleanSlug = sanitizeSlug(slug);

  // 1. Custom domain mapping if configured
  if (customDomain && customDomain.trim()) {
    const domain = customDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${domain}/${cleanSlug}`;
  }

  // 2. PUBLIC_BASE_URL if configured in environment
  if (environment.publicBaseUrl && environment.publicBaseUrl.trim()) {
    const base = environment.publicBaseUrl.trim().replace(/\/$/, "");
    return `${base}/${cleanSlug}`;
  }

  // 3. Dynamic browser origin
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return `${window.location.origin}/${cleanSlug}`;
  }

  // 4. API base URL fallback
  const base = environment.apiUrl.replace(/\/api$/, "");
  return `${base}/${cleanSlug}`;
}
