/**
 * Release info + SEO defaults. Mirrors apps/backend/src/utils/seo.util.js,
 * which applies the same defaults on the live page — keep the two in sync.
 *
 *   Title:       [Track Name] – [Artist Name] | Listen Now
 *   Description: Listen to [Track Name] by [Artist Name] on Spotify, Apple Music,
 *                YouTube Music, Amazon Music and more.
 */
interface SectionLike {
  type: string;
  data: Record<string, unknown>;
}

const RELEASE_SECTION_TYPES = ["smart-link", "pre-save", "podcast-smart-link"];

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const cut = (t: string, n: number) =>
  t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;

export function getReleaseInfo(
  sections: SectionLike[],
  page: { title?: string; artistName?: string; campaignType?: string },
) {
  const release = sections.find((s) => RELEASE_SECTION_TYPES.includes(s.type));
  const d = release?.data || {};
  const isPodcast = release
    ? release.type === "podcast-smart-link"
    : page.campaignType === "podcast";
  const isPreSave = release
    ? release.type === "pre-save"
    : page.campaignType === "presave";

  let trackName = str(d["title"]) || str(page.title);
  let artistName =
    str(page.artistName) || str(d["artist"]) || (isPodcast ? str(d["hostName"]) : "");
  if (artistName && trackName.toLowerCase().startsWith(`${artistName.toLowerCase()} - `)) {
    trackName = trackName.slice(artistName.length + 3).trim();
  } else if (!artistName && !isPodcast) {
    const m = /^(.+?)\s+[-–—]\s+(.+)$/.exec(trackName);
    if (m) {
      artistName = m[1].trim();
      trackName = m[2].trim();
    }
  }
  return {
    trackName,
    artistName,
    artwork: str(d["coverUrl"]) || str(d["artworkUrl"]),
    isPodcast,
    isPreSave,
  };
}

export function getSeoDefaults(r: ReturnType<typeof getReleaseInfo>) {
  const by = r.artistName ? ` by ${r.artistName}` : "";
  const title = cut(
    `${r.trackName}${r.artistName ? ` – ${r.artistName}` : ""} | ${r.isPreSave ? "Pre-Save Now" : "Listen Now"}`,
    70,
  );
  const description = cut(
    r.isPreSave
      ? `Pre-save ${r.trackName}${by} on Spotify, Apple Music, Amazon Music and more.`
      : r.isPodcast
        ? `Listen to ${r.trackName}${by} on Spotify, Apple Podcasts, YouTube and more.`
        : `Listen to ${r.trackName}${by} on Spotify, Apple Music, YouTube Music, Amazon Music and more.`,
    160,
  );
  return { title, description };
}
