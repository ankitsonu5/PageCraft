import { environment } from "../../../environments/environment";

export function getCleanCampaignUrl(slug: string, customDomain?: string | null): string {
  if (!slug) return "";
  const cleanSlug = String(slug).trim().toLowerCase();

  // If a custom short domain is mapped (Phase 6), use it
  if (customDomain && customDomain.trim()) {
    const domain = customDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${domain}/${cleanSlug}`;
  }

  // Use current browser origin if in browser, or fallback to environment URL
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return `${window.location.origin}/${cleanSlug}`;
  }

  const base = environment.apiUrl.replace(/\/api$/, "");
  return `${base}/${cleanSlug}`;
}
