jest.mock("@prisma/client", () => require("./__mocks__/prisma"));
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { prismaMock } = require("./__mocks__/prisma");
const app = require("../src/app");
const { clearTrackingSettingsCache } = require("../src/modules/settings/settings.service");

const TOKEN = `Bearer ${jwt.sign({ adminId: "admin-1" }, process.env.JWT_SECRET)}`;
const GLOBAL = { id: "global", gtmId: "GTM-AAA111", ga4MeasurementId: "G-GLOBAL1", googleAdsId: null, metaPixelId: null, tiktokPixelId: null, snapchatPixelId: null, googleAdsConversionLabel: null, googleTagsViaGtm: false };

beforeEach(() => {
  jest.clearAllMocks();
  clearTrackingSettingsCache();
  prismaMock.trackingSettings.findUnique.mockResolvedValue(GLOBAL);
});

describe("Settings → Tracking & Analytics API", () => {
  it("requires auth", async () => {
    expect((await request(app).get("/api/settings/tracking")).status).toBe(401);
  });

  it("rejects malformed IDs", async () => {
    const res = await request(app).put("/api/settings/tracking").set("Authorization", TOKEN).send({ gtmId: "GTM-'); alert(1)//" });
    expect(res.status).toBe(400);
    expect(prismaMock.trackingSettings.upsert).not.toHaveBeenCalled();
  });

  it("saves normalised IDs", async () => {
    prismaMock.trackingSettings.upsert.mockResolvedValue({});
    const res = await request(app).put("/api/settings/tracking").set("Authorization", TOKEN).send({ googleAdsId: " aw-11082888576 ", googleTagsViaGtm: true });
    expect(res.status).toBe(200);
    expect(prismaMock.trackingSettings.upsert.mock.calls[0][0].update).toEqual({ googleAdsId: "AW-11082888576", googleTagsViaGtm: true });
  });

  it("status reports configured tags and recent events", async () => {
    prismaMock.pageView.count.mockResolvedValue(12);
    prismaMock.clickLog.groupBy.mockResolvedValue([{ platform: "Spotify", _count: { _all: 3 } }]);
    prismaMock.clickLog.findMany.mockResolvedValue([]);
    const res = await request(app).get("/api/settings/tracking/status").set("Authorization", TOKEN);
    expect(res.status).toBe(200);
    expect(res.body.connected).toMatchObject({ gtm: true, ga4: true, googleAds: false });
    expect(res.body.last24h).toEqual({ pageViews: 12, streamingClicks: [{ platform: "Spotify", count: 3 }] });
  });
});
