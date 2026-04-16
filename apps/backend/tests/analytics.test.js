jest.mock("@prisma/client", () => require("./__mocks__/prisma"));
jest.mock("../src/utils/ga4-data.util", () => ({
  fetchAnalytics: jest.fn().mockResolvedValue({
    summary: [
      { value: "1200" },
      { value: "900" },
      { value: "600" },
      { value: "0.35" },
      { value: "145" },
    ],
    timeSeries: [
      {
        dimensionValues: [{ value: "20240101" }],
        metricValues: [{ value: "50" }],
      },
    ],
    geo: [
      {
        dimensionValues: [{ value: "Mumbai" }],
        metricValues: [{ value: "300" }],
      },
    ],
    devices: [
      {
        dimensionValues: [{ value: "mobile" }],
        metricValues: [{ value: "700" }],
      },
      {
        dimensionValues: [{ value: "desktop" }],
        metricValues: [{ value: "500" }],
      },
    ],
    gender: [],
    sources: [
      {
        dimensionValues: [{ value: "Organic Search" }],
        metricValues: [{ value: "600" }],
      },
    ],
  }),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { prismaMock } = require("./__mocks__/prisma");
const app = require("../src/app");

const TOKEN = `Bearer ${jwt.sign({ adminId: "admin-1" }, process.env.JWT_SECRET)}`;

const MOCK_PAGE = {
  id: "page-1",
  title: "Heart Surgery Campaign",
  ga4PropertyId: "properties/123",
  ga4MeasurementId: "G-TEST123",
};

const MOCK_LINK = {
  id: "link-1",
  pageId: "page-1",
  label: "Book Now",
  slug: "abc123",
  targetUrl: "https://hospital.com/book",
  clicks: 42,
};

beforeEach(() => jest.clearAllMocks());

// ─── GET /api/analytics/:pageId ───────────────────
describe("GET /api/analytics/:pageId", () => {
  it("page with GA4 → 200 + full analytics data", async () => {
    prismaMock.page.findUnique.mockResolvedValue(MOCK_PAGE);
    prismaMock.linkTracker.findMany.mockResolvedValue([MOCK_LINK]);
    prismaMock.clickLog.groupBy.mockResolvedValue([
      { city: "Mumbai", _count: { city: 5 } },
    ]);
    prismaMock.clickLog.count.mockResolvedValue(3);

    const res = await request(app)
      .get("/api/analytics/page-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ga4Data");
    expect(res.body.ga4Data.summary[0].value).toBe("1200");
    expect(res.body.links).toHaveLength(1);
    expect(res.body.links[0].totalClicks).toBe(42);
    expect(res.body.links[0].topCity).toBe("Mumbai");
  });

  it("page without GA4 → 200 but ga4Data is null", async () => {
    prismaMock.page.findUnique.mockResolvedValue({
      ...MOCK_PAGE,
      ga4PropertyId: null,
      ga4MeasurementId: null,
    });
    prismaMock.linkTracker.findMany.mockResolvedValue([]);
    prismaMock.clickLog.groupBy.mockResolvedValue([]);
    prismaMock.clickLog.count.mockResolvedValue(0);

    const res = await request(app)
      .get("/api/analytics/page-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.ga4Data).toBeNull();
  });

  it("page not found → 404", async () => {
    prismaMock.page.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/analytics/bad-id")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(404);
  });

  it("period=today works", async () => {
    prismaMock.page.findUnique.mockResolvedValue(MOCK_PAGE);
    prismaMock.linkTracker.findMany.mockResolvedValue([]);
    prismaMock.clickLog.groupBy.mockResolvedValue([]);
    prismaMock.clickLog.count.mockResolvedValue(0);

    const { fetchAnalytics } = require("../src/utils/ga4-data.util");

    const res = await request(app)
      .get("/api/analytics/page-1?period=today")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    const call = fetchAnalytics.mock.calls[0][0];
    expect(call.startDate).toBe(call.endDate); // today = same date
  });

  it("no token → 401", async () => {
    const res = await request(app).get("/api/analytics/page-1");
    expect(res.status).toBe(401);
  });
});
