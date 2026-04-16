const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/links?pageId=xxx
router.get("/", async (req, res) => {
  const { pageId } = req.query;
  if (!pageId) return res.status(400).json({ error: "pageId required" });

  const links = await prisma.linkTracker.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
  });
  res.json(links);
});

// POST /api/links
router.post("/", async (req, res) => {
  const { pageId, label, targetUrl } = req.body;
  if (!pageId || !label || !targetUrl) {
    return res
      .status(400)
      .json({ error: "pageId, label, and targetUrl required" });
  }

  const slug = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const link = await prisma.linkTracker.create({
    data: { pageId, label, targetUrl, slug },
  });
  res.status(201).json(link);
});

// DELETE /api/links/:id
router.delete("/:id", async (req, res) => {
  await prisma.linkTracker.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

module.exports = router;
