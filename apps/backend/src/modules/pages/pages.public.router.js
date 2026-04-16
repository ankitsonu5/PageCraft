const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/public/pages/:slug  — served to the public page viewer
router.get("/pages/:slug", async (req, res) => {
  const page = await prisma.page.findUnique({
    where: { slug: req.params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      sections: true,
      isPublished: true,
      metaTitle: true,
      metaDescription: true,
      ga4MeasurementId: true,
      linkTrackers: {
        select: { id: true, label: true, slug: true, targetUrl: true },
      },
      project: {
        select: { metaPixelId: true },
      },
    },
  });

  if (!page || !page.isPublished) {
    return res.status(404).json({ error: "Page not found or not published" });
  }

  res.json(page);
});

module.exports = router;
