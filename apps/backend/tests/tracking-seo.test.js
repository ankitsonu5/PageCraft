const { buildTrackingConfig } = require("../src/modules/settings/settings.service");
const { buildSeo, buildSeoHeadTags } = require("../src/utils/seo.util");
const { serializeSections, withSections } = require("../src/utils/sections.util");

const smartLink = (data) => JSON.stringify([{ id: "s1", type: "smart-link", data }]);

describe("buildTrackingConfig", () => {
  const global = { gtmId: "GTM-AAA111", ga4MeasurementId: "G-GLOBAL1", googleAdsId: "AW-11082888576", metaPixelId: "111111", googleAdsConversionLabel: "Lbl123", googleTagsViaGtm: false };

  it("every page uses Global AGL Tracking by default — page-level IDs are ignored", () => {
    const c = buildTrackingConfig(global, { gtmId: "GTM-OLD999", googleAdsId: "AW-999999", fbPixelId: "222222" });
    expect(c.usingOverride).toBe(false);
    expect(c.gtmIds).toEqual(["GTM-AAA111"]);
    expect(c.ga4Ids).toEqual(["G-GLOBAL1"]);
    expect(c.googleAdsIds).toEqual(["AW-11082888576"]);
    expect(c.metaPixelIds).toEqual(["111111"]);
    expect(c.googleAdsConversionLabel).toBe("Lbl123");
  });

  it("Override Global Tracking: filled page IDs replace global, empty ones fall back", () => {
    const c = buildTrackingConfig(global, { trackingOverride: true, googleAdsId: "AW-999999", gtmId: "  " });
    expect(c.usingOverride).toBe(true);
    expect(c.googleAdsIds).toEqual(["AW-999999"]);
    expect(c.googleAdsConversionLabel).toBeNull(); // label belongs to the global Ads account
    expect(c.gtmIds).toEqual(["GTM-AAA111"]);
    expect(c.ga4Ids).toEqual(["G-GLOBAL1"]);
  });

  it("GA4/Ads managed inside GTM are not loaded again directly (no double counting)", () => {
    const c = buildTrackingConfig({ ...global, googleTagsViaGtm: true }, {});
    expect(c.googleTagsViaGtm).toBe(true);
    expect(c.gtmIds).toEqual(["GTM-AAA111"]);
    expect(c.ga4Ids).toEqual([]);
    expect(c.googleAdsIds).toEqual([]);
  });

  it("a page overriding the GTM container loads global GA4/Ads directly", () => {
    const c = buildTrackingConfig({ ...global, googleTagsViaGtm: true }, { trackingOverride: true, gtmId: "GTM-CAMP01" });
    expect(c.gtmIds).toEqual(["GTM-CAMP01"]);
    expect(c.ga4Ids).toEqual(["G-GLOBAL1"]);
  });
});

describe("buildSeo", () => {
  const page = { slug: "heartbeat", title: "Heartbeat page", artistName: "Ashwin Gane", campaignType: "song", sections: smartLink({ title: "Heartbeat", releaseType: "single", coverUrl: "/uploads/cover.jpg" }) };

  it("auto-generates the agreed defaults from track / artist / release data", () => {
    const seo = buildSeo(page, "https://agl.sh");
    expect(seo.title).toBe("Heartbeat – Ashwin Gane | Listen Now");
    expect(seo.description).toBe("Listen to Heartbeat by Ashwin Gane on Spotify, Apple Music, YouTube Music, Amazon Music and more.");
    expect(seo.ogTitle).toBe(seo.title);
    expect(seo.image).toBe("https://agl.sh/uploads/cover.jpg");
    expect(seo.url).toBe("https://agl.sh/heartbeat");
    expect(seo.release).toMatchObject({ trackName: "Heartbeat", artistName: "Ashwin Gane", releaseType: "Single" });
  });

  it("live DND data (empty artist, 'Artist - Track' title, campaignType podcast) → correct release info", () => {
    const dnd = { slug: "dnd", title: "DND", artistName: null, campaignType: "podcast", sections: smartLink({ title: "Ashwin Gane - DND", artist: "", releaseType: "single", coverUrl: "/uploads/dnd.webp" }) };
    const seo = buildSeo(dnd, "https://agl.sh");
    expect(seo.release).toMatchObject({ trackName: "DND", artistName: "Ashwin Gane", releaseType: "Single", isPodcast: false });
    expect(seo.title).toBe("DND – Ashwin Gane | Listen Now");
    expect(seo.description).toBe("Listen to DND by Ashwin Gane on Spotify, Apple Music, YouTube Music, Amazon Music and more.");
  });

  it("manual values win over defaults; custom domain drives the canonical URL", () => {
    const seo = buildSeo({ ...page, metaTitle: "Custom", ogDescription: "Share me", ogImage: "https://cdn.x/og.png", customDomain: "ag.fm" }, "https://agl.sh");
    expect(seo.title).toBe("Custom");
    expect(seo.ogTitle).toBe("Custom");
    expect(seo.ogDescription).toBe("Share me");
    expect(seo.image).toBe("https://cdn.x/og.png");
    expect(seo.url).toBe("https://ag.fm/heartbeat");
  });

  it("escapes HTML in head tags", () => {
    const tags = buildSeoHeadTags(buildSeo({ ...page, metaDescription: '"><script>alert(1)</script>' }, "https://agl.sh"));
    expect(tags).not.toContain("<script>");
    expect(tags).toContain("&lt;script&gt;");
  });
});

describe("sections serialization", () => {
  it("stores arrays as JSON strings and returns arrays", () => {
    const arr = [{ id: "a", type: "hero", data: {} }];
    expect(serializeSections(arr)).toBe(JSON.stringify(arr));
    expect(withSections({ sections: JSON.stringify(arr) }).sections).toEqual(arr);
    expect(withSections({ sections: "not json" }).sections).toEqual([]);
  });

  it("rejects non-array sections", () => {
    expect(() => serializeSections({ a: 1 })).toThrow();
  });
});
