/**
 * Streaming platform for a link, used as the `platform` parameter of
 * `streaming_click`. Detected from the destination host first (so links in any
 * section type are covered), then from the button's data-platform attribute.
 * Returns null for non-streaming links (socials, privacy policy, …).
 */
const HOST_RULES: [RegExp, string][] = [
  [/(^|\.)music\.youtube\.com$/, "youtube_music"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(open\.spotify\.com|spotify\.com|spotify\.link)$/, "spotify"],
  [/(^|\.)podcasts\.apple\.com$/, "apple_podcasts"],
  [
    /(^|\.)(music\.apple\.com|itunes\.apple\.com|geo\.music\.apple\.com)$/,
    "apple_music",
  ],
  [/(^|\.)music\.amazon\.[a-z.]+$/, "amazon_music"],
  [/(^|\.)jiosaavn\.com$/, "jiosaavn"],
  [/(^|\.)gaana\.com$/, "gaana"],
  [/(^|\.)deezer\.(com|page\.link)$/, "deezer"],
  [/(^|\.)soundcloud\.com$/, "soundcloud"],
  [/(^|\.)tidal\.com$/, "tidal"],
  [/(^|\.)iheart\.com$/, "iheart"],
  [/(^|\.)pandora\.com$/, "pandora"],
  [/(^|\.)audiomack\.com$/, "audiomack"],
  [/(^|\.)boomplay\.com$/, "boomplay"],
  [/(^|\.)player\.fm$/, "player_fm"],
  [/(^|\.)wynk\.in$/, "wynk"],
  [/(^|\.)anghami\.com$/, "anghami"],
];

// data-platform values used by the builder → canonical names
const ALIASES: Record<string, string> = {
  apple: "apple_music",
  amazon: "amazon_music",
  sc: "soundcloud",
  saavn: "jiosaavn",
};

export function detectStreamingPlatform(
  href: string,
  dataPlatform?: string,
): string | null {
  let host = "";
  try {
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    host = u.hostname.toLowerCase();
  } catch {
    return null;
  }
  // Amazon Music links also live under amazon.<tld>/music/...
  if (/(^|\.)amazon\.[a-z.]+$/.test(host) && /\/music\//.test(href)) {
    return "amazon_music";
  }
  for (const [re, name] of HOST_RULES) {
    if (re.test(host)) return name;
  }
  if (dataPlatform) {
    const p = dataPlatform.toLowerCase();
    return ALIASES[p] || p;
  }
  return null;
}
