const { buildTrackingConfig } = require("../src/modules/settings/settings.service");
const { buildSeo, buildSeoHeadTags } = require("../src/utils/seo.util");
const { serializeSections, withSections } = require("../src/utils/sections.util");

const smartLink = (data) => JSON.stringify([{ id: "s1", type: "smart-link", data }]);

describe("buildTrackingConfig", () => {
  const global = { gtmId: "GTM-AAA111", ga4MeasurementId: "G-GLOBAL1", googleAdsId: "AW-1111111", metaPixelId: "111111", googleTagsViaGtm: true };

  it("applies global IDs to a page with no tracking of its own", () => {
    const c = buildTrackingConfig(global, {});
    expect(c.gtmIds).toEqual(["GTM-AAA111"]);
    expect(c.ga4Ids).toEqual(["G-GLOBAL1"]);
    expect(c.googleAdsIds).toEqual(["AW-1111111"]);
    expect(c.googleTagsViaGtm).toBe(true);
    expect(c.serverGtmId).toBe("GTM-AAA111");
  });

  it("adds page-level IDs and never duplicates an ID set at both levels", () => {
    const c = buildTrackingConfig(global, { gtmId: "GTM-AAA111", ga4MeasurementId: "G-CAMPAIGN", fbPixelId: "111111", project: { metaPixelId: "222222" } });
    expect(c.gtmIds).toEqual(["GTM-AAA111"]);
    expect(c.ga4Ids).toEqual(["G-GLOBAL1", "G-CAMPAIGN"]);
    expect(c.metaPixelIds).toEqual(["111111", "222222"]);
  });

  it("ignores the GTM-managed flag when no GTM container is configured", () => {
    expect(buildTrackingConfig({ googleTagsViaGtm: true }, {}).googleTagsViaGtm).toBe(false);
  });
});

describe("buildSeo", () => {
  const page = { slug: "heartbeat", title: "Heartbeat page", artistName: "Ashwin Gane", campaignType: "song", sections: smartLink({ title: "Heartbeat", releaseType: "single", coverUrl: "/uploads/cover.jpg" }) };

  it("auto-generates defaults from track / artist / release data", () => {
    const seo = buildSeo(page, "https://agl.sh");
    expect(seo.title).toBe("Heartbeat by Ashwin Gane | Listen Now");
    expect(seo.description).toMatch(/^Stream Heartbeat by Ashwin Gane on Spotify/);
    expect(seo.ogTitle).toBe(seo.title);
    expect(seo.image).toBe("https://agl.sh/uploads/cover.jpg");
    expect(seo.url).toBe("https://agl.sh/heartbeat");
    expect(seo.release).toMatchObject({ trackName: "Heartbeat", artistName: "Ashwin Gane", releaseType: "single" });
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
