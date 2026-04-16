jest.mock("@prisma/client", () => require("./__mocks__/prisma"));

const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prismaMock } = require("./__mocks__/prisma");

// Import app after mocks are in place
const app = require("../src/app");

const MOCK_ADMIN = {
  id: "admin-uuid-1",
  email: "admin@test.com",
  name: "Test Admin",
  passwordHash: bcrypt.hashSync("Secret123", 10),
};

beforeEach(() => jest.clearAllMocks());

// ─── POST /api/auth/login ──────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("valid credentials → 200 + token + admin", async () => {
    prismaMock.admin.findUnique.mockResolvedValue(MOCK_ADMIN);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "Secret123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.admin.email).toBe("admin@test.com");
    expect(res.body.admin).not.toHaveProperty("passwordHash");
  });

  it("wrong password → 401", async () => {
    prismaMock.admin.findUnique.mockResolvedValue(MOCK_ADMIN);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "wrongpass" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it("unknown email → 401", async () => {
    prismaMock.admin.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "Secret123" });

    expect(res.status).toBe(401);
  });

  it("missing fields → 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com" });

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  it("valid token → 200 + admin info", async () => {
    prismaMock.admin.findUnique.mockResolvedValue(MOCK_ADMIN);

    const token = jwt.sign({ adminId: MOCK_ADMIN.id }, process.env.JWT_SECRET);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(MOCK_ADMIN.email);
  });

  it("no token → 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("invalid token → 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer bad.token.here");
    expect(res.status).toBe(401);
  });
});
