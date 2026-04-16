jest.mock("@prisma/client", () => require("./__mocks__/prisma"));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { prismaMock } = require("./__mocks__/prisma");
const app = require("../src/app");

const TOKEN = `Bearer ${jwt.sign({ adminId: "admin-1" }, process.env.JWT_SECRET)}`;

const MOCK_LINK = {
  id: "link-1",
  pageId: "page-1",
  label: "Book Appointment",
  targetUrl: "https://hospital.com/book",
  slug: "abc123",
  clicks: 42,
  createdAt: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

// ─── GET /api/links?pageId ────────────────────────
describe("GET /api/links", () => {
  it("returns links for a page", async () => {
    prismaMock.linkTracker.findMany.mockResolvedValue([MOCK_LINK]);

    const res = await request(app)
      .get("/api/links?pageId=page-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].label).toBe("Book Appointment");
  });

  it("missing pageId → 400", async () => {
    const res = await request(app)
      .get("/api/links")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(400);
  });

  it("no token → 401", async () => {
    const res = await request(app).get("/api/links?pageId=page-1");
    expect(res.status).toBe(401);
  });
});

// ─── POST /api/links ──────────────────────────────
describe("POST /api/links", () => {
  it("valid data → 201 + link with slug", async () => {
    prismaMock.linkTracker.create.mockResolvedValue(MOCK_LINK);

    const res = await request(app)
      .post("/api/links")
      .set("Authorization", TOKEN)
      .send({
        pageId: "page-1",
        label: "Book Appointment",
        targetUrl: "https://hospital.com/book",
      });

    expect(res.status).toBe(201);
    expect(res.body.label).toBe("Book Appointment");
    expect(prismaMock.linkTracker.create).toHaveBeenCalledTimes(1);
    // slug should be auto-generated
    const callArg = prismaMock.linkTracker.create.mock.calls[0][0];
    expect(callArg.data).toHaveProperty("slug");
    expect(callArg.data.slug.length).toBeGreaterThan(0);
  });

  it("missing label → 400", async () => {
    const res = await request(app)
      .post("/api/links")
      .set("Authorization", TOKEN)
      .send({ pageId: "page-1", targetUrl: "https://hospital.com" });

    expect(res.status).toBe(400);
    expect(prismaMock.linkTracker.create).not.toHaveBeenCalled();
  });

  it("missing targetUrl → 400", async () => {
    const res = await request(app)
      .post("/api/links")
      .set("Authorization", TOKEN)
      .send({ pageId: "page-1", label: "Book" });

    expect(res.status).toBe(400);
  });

  it("missing pageId → 400", async () => {
    const res = await request(app)
      .post("/api/links")
      .set("Authorization", TOKEN)
      .send({ label: "Book", targetUrl: "https://hospital.com" });

    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/links/:id ────────────────────────
describe("DELETE /api/links/:id", () => {
  it("deletes link → 204", async () => {
    prismaMock.linkTracker.delete.mockResolvedValue(MOCK_LINK);

    const res = await request(app)
      .delete("/api/links/link-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(204);
    expect(prismaMock.linkTracker.delete).toHaveBeenCalledWith({
      where: { id: "link-1" },
    });
  });

  it("no token → 401", async () => {
    const res = await request(app).delete("/api/links/link-1");
    expect(res.status).toBe(401);
  });
});

// ─── GET /t/:slug (public redirect) ──────────────
describe("GET /t/:slug", () => {
  it("valid slug → 301 redirect + click logged", async () => {
    prismaMock.linkTracker.findUnique.mockResolvedValue(MOCK_LINK);
    prismaMock.$transaction.mockResolvedValue([]);

    const res = await request(app).get("/t/abc123");

    expect(res.status).toBe(301);
    expect(res.headers.location).toBe("https://hospital.com/book");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it("invalid slug → 404", async () => {
    prismaMock.linkTracker.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/t/notexist");

    expect(res.status).toBe(404);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
