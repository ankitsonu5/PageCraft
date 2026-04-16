jest.mock("@prisma/client", () => require("./__mocks__/prisma"));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { prismaMock } = require("./__mocks__/prisma");
const app = require("../src/app");

const TOKEN = `Bearer ${jwt.sign({ adminId: "admin-1" }, process.env.JWT_SECRET)}`;

const MOCK_PROJECT = {
  id: "proj-1",
  name: "PIMF Hospital",
  slug: "pimf-hospital",
  description: "Test desc",
  color: "#534AB7",
  logo: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _count: { pages: 2 },
};

beforeEach(() => jest.clearAllMocks());

// ─── GET /api/projects ────────────────────────────
describe("GET /api/projects", () => {
  it("returns list of projects", async () => {
    prismaMock.project.findMany.mockResolvedValue([MOCK_PROJECT]);

    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("PIMF Hospital");
  });

  it("no token → 401", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/projects/:id ────────────────────────
describe("GET /api/projects/:id", () => {
  it("existing project → 200", async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      ...MOCK_PROJECT,
      pages: [],
    });

    const res = await request(app)
      .get("/api/projects/proj-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("proj-1");
  });

  it("not found → 404", async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/projects/nonexistent")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/projects ───────────────────────────
describe("POST /api/projects", () => {
  it("valid data → 201 + created project", async () => {
    prismaMock.project.create.mockResolvedValue(MOCK_PROJECT);

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", TOKEN)
      .send({ name: "PIMF Hospital", description: "Test", color: "#534AB7" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("PIMF Hospital");
    expect(prismaMock.project.create).toHaveBeenCalledTimes(1);
  });

  it("missing name → 400", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", TOKEN)
      .send({ description: "No name given" });

    expect(res.status).toBe(400);
    expect(prismaMock.project.create).not.toHaveBeenCalled();
  });
});

// ─── PATCH /api/projects/:id ──────────────────────
describe("PATCH /api/projects/:id", () => {
  it("updates project → 200", async () => {
    const updated = { ...MOCK_PROJECT, name: "Updated Name" };
    prismaMock.project.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/projects/proj-1")
      .set("Authorization", TOKEN)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });
});

// ─── DELETE /api/projects/:id ─────────────────────
describe("DELETE /api/projects/:id", () => {
  it("deletes project → 204", async () => {
    prismaMock.project.delete.mockResolvedValue(MOCK_PROJECT);

    const res = await request(app)
      .delete("/api/projects/proj-1")
      .set("Authorization", TOKEN);

    expect(res.status).toBe(204);
    expect(prismaMock.project.delete).toHaveBeenCalledWith({
      where: { id: "proj-1" },
    });
  });

  it("no token → 401", async () => {
    const res = await request(app).delete("/api/projects/proj-1");
    expect(res.status).toBe(401);
  });
});
