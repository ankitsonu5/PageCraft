require("express-async-errors");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { authMiddleware } = require("./middleware/auth.middleware");
const authRouter = require("./modules/auth/auth.router");
const projectsRouter = require("./modules/projects/projects.router");
const pagesRouter = require("./modules/pages/pages.router");
const pagesPublicRouter = require("./modules/pages/pages.public.router");
const analyticsRouter = require("./modules/analytics/analytics.router");
const linksRouter = require("./modules/links/links.router");
const linksManageRouter = require("./modules/links/links.manage.router");
const leadsRouter = require("./modules/leads/leads.router");
const leadsManageRouter = require("./modules/leads/leads.manage.router");

const app = express();

// ─── FILE UPLOAD SETUP ────────────────────────────
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }),
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:4200",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

// ─── RATE LIMITERS ───────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many submissions. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── PUBLIC ROUTES ────────────────────────────────
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);
app.use("/t", linksRouter);
app.use("/api/public", pagesPublicRouter);
app.use("/uploads", express.static(uploadsDir));

// ─── PROTECTED ROUTES ─────────────────────────────
app.use("/api/projects", authMiddleware, projectsRouter);
app.use("/api/pages", authMiddleware, pagesRouter);
app.use("/api/analytics", authMiddleware, analyticsRouter);
app.use("/api/links", authMiddleware, linksManageRouter);
app.use("/api/leads", leadsLimiter, leadsRouter);
app.use("/api/leads/manage", authMiddleware, leadsManageRouter);

app.post("/api/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ─── ANGULAR STATIC FILES ─────────────────────────
const publicDir = path.join(__dirname, "../../frontend/dist/frontend/browser");
app.use(express.static(publicDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ─── ERROR HANDLER ────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("[Error]", err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;
