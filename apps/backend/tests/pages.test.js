jest.mock("@prisma/client", () => require("./__mocks__/prisma"));
jest.mock("../src/utils/ga4-admin.util", () => ({
  createGA4Property: jest.fn().mockResolvedValue({
    ga4PropertyId: "properties/123",
    ga4MeasurementId: "G-TEST123",
    ga4StreamId: "dataStreams/456",
  }),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { prismaMock } = require("./__mocks__/prisma");
const app = require("../src/app");

const TOKEN = `Bearer ${jwt.sign({ adminId: "admin-1" }, process.env.JWT_SECRET)}`;

const MOCK_PAGE = {
  id: "page-1",
  projectId: "proj-1",
  title: "Heart Surgery Campaign",
  slug: "heart-surgery",
  sections: [],
  isPublished: false,
  publishedAt: null,
  ga4PropertyId: null,
  ga4MeasurementId: null,
  ga4StreamId: null,
  metaTitle: null,
  metaDescription: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  linkTrackers: [],
};

const MOCK_PROJECT = {
  id: "proj-1",
  name: "PIMF Hospital",
};

beforeEach(() => jest.clearAllMocks());

// ─── GET /api/pages?projectId ─────────────────────
describe("GET /api/pages", () => {
  it("returns pages for a project", async () => {
    prismaMock.page.findMany.mockResolvedValue([MOCK_PAGE]);

    const res = await request(app)
      .get("/api/pages?projectId=proj-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].slug).toBe("heart-surgery");
  });

  it("missing projectId → 400", async () => {
    const res = await request(app)
      .get("/api/pages")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(400);
  });

  it("no token → 401", async () => {
    const res = await request(app).get("/api/pages?projectId=proj-1");
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/pages/:id ───────────────────────────
describe("GET /api/pages/:id", () => {
  it("existing page → 200", async () => {
    prismaMock.page.findUnique.mockResolvedValue(MOCK_PAGE);

    const res = await request(app)
      .get("/api/pages/page-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("page-1");
  });

  it("not found → 404", async () => {
    prismaMock.page.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/pages/bad-id")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/pages ──────────────────────────────
describe("POST /api/pages", () => {
  it("valid data → 201 + page", async () => {
    prismaMock.page.create.mockResolvedValue(MOCK_PAGE);

    const res = await request(app)
      .post("/api/pages")
      .set("Authorization", TOKEN)
      .send({
        projectId: "proj-1",
        title: "Heart Surgery Campaign",
        slug: "heart-surgery",
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Heart Surgery Campaign");
  });

  it("missing title → 400", async () => {
    const res = await request(app)
      .post("/api/pages")
      .set("Authorization", TOKEN)
      .send({ projectId: "proj-1", slug: "heart-surgery" });

    expect(res.status).toBe(400);
    expect(prismaMock.page.create).not.toHaveBeenCalled();
  });

  it("missing slug → 400", async () => {
    const res = await request(app)
      .post("/api/pages")
      .set("Authorization", TOKEN)
      .send({ projectId: "proj-1", title: "Heart Surgery Campaign" });

    expect(res.status).toBe(400);
  });

  it("missing projectId → 400", async () => {
    const res = await request(app)
      .post("/api/pages")
      .set("Authorization", TOKEN)
      .send({ title: "Test", slug: "test" });

    expect(res.status).toBe(400);
  });
});

// ─── PATCH /api/pages/:id ─────────────────────────
describe("PATCH /api/pages/:id", () => {
  it("updates title and sections → 200", async () => {
    const updated = {
      ...MOCK_PAGE,
      title: "Updated Title",
      sections: [{ id: "sec-1", type: "hero", data: {} }],
    };
    prismaMock.page.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/pages/page-1")
      .set("Authorization", TOKEN)
      .send({
        title: "Updated Title",
        sections: [{ id: "sec-1", type: "hero", data: {} }],
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Title");
    expect(res.body.sections).toHaveLength(1);
  });
});

// ─── POST /api/pages/:id/publish ──────────────────
describe("POST /api/pages/:id/publish", () => {
  it("publishes page + creates GA4 property → 200", async () => {
    // findUnique called twice: once in publishPage, once in update
    prismaMock.page.findUnique.mockResolvedValue({
      ...MOCK_PAGE,
      project: MOCK_PROJECT,
    });
    prismaMock.page.update.mockResolvedValue({
      ...MOCK_PAGE,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      ga4PropertyId: "properties/123",
      ga4MeasurementId: "G-TEST123",
      ga4StreamId: "dataStreams/456",
    });

    const res = await request(app)
      .post("/api/pages/page-1/publish")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.isPublished).toBe(true);
    expect(res.body.ga4MeasurementId).toBe("G-TEST123");
  });

  it("already published page — skips GA4 creation", async () => {
    const { createGA4Property } = require("../src/utils/ga4-admin.util");
    prismaMock.page.findUnique.mockResolvedValue({
      ...MOCK_PAGE,
      ga4MeasurementId: "G-EXISTING",
      project: MOCK_PROJECT,
    });
    prismaMock.page.update.mockResolvedValue({
      ...MOCK_PAGE,
      isPublished: true,
      ga4MeasurementId: "G-EXISTING",
    });

    const res = await request(app)
      .post("/api/pages/page-1/publish")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(createGA4Property).not.toHaveBeenCalled();
  });

  it("GA4 fails → page still publishes (graceful fail)", async () => {
    const { createGA4Property } = require("../src/utils/ga4-admin.util");
    createGA4Property.mockResolvedValueOnce(null); // GA4 fail

    prismaMock.page.findUnique.mockResolvedValue({
      ...MOCK_PAGE,
      project: MOCK_PROJECT,
    });
    prismaMock.page.update.mockResolvedValue({
      ...MOCK_PAGE,
      isPublished: true,
      ga4MeasurementId: null,
    });

    const res = await request(app)
      .post("/api/pages/page-1/publish")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.isPublished).toBe(true);
  });

  it("page not found → 404", async () => {
    prismaMock.page.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/pages/bad-id/publish")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/pages/:id ────────────────────────
describe("DELETE /api/pages/:id", () => {
  it("deletes page → 204", async () => {
    prismaMock.page.delete.mockResolvedValue(MOCK_PAGE);

    const res = await request(app)
      .delete("/api/pages/page-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(204);
    expect(prismaMock.page.delete).toHaveBeenCalledWith({
      where: { id: "page-1" },
    });
  });
});

// ─── GET /api/public/pages/:slug ──────────────────
describe("GET /api/public/pages/:slug (public)", () => {
  it("published page → 200 (no auth needed)", async () => {
    prismaMock.page.findUnique.mockResolvedValue({
      ...MOCK_PAGE,
      isPublished: true,
    });

    const res = await request(app).get("/api/public/pages/heart-surgery");

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("heart-surgery");
  });

  it("unpublished page → 404", async () => {
    prismaMock.page.findUnique.mockResolvedValue({
      ...MOCK_PAGE,
      isPublished: false,
    });

    const res = await request(app).get("/api/public/pages/heart-surgery");

    expect(res.status).toBe(404);
  });

  it("nonexistent slug → 404", async () => {
    prismaMock.page.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/public/pages/ghost-page");

    expect(res.status).toBe(404);
  });
});
