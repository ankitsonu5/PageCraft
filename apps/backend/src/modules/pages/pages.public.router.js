const express = require("express");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/public/pages/:slug — served to public landing page viewer
router.get("/pages/:slug", async (req, res) => {
  const rawSlug = String(req.params.slug || "").trim().toLowerCase();

  const page = await prisma.page.findFirst({
    where: {
      slug: { equals: rawSlug, mode: "insensitive" },
    },
    include: {
      platformLinks: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
      project: {
        select: {
          name: true,
          metaPixelId: true,
        },
      },
    },
  });

  if (!page || (!page.isPublished && page.status !== "PUBLISHED")) {
    return res.status(404).json({ error: "Page not found or not published" });
  }

  res.json(page);
});

// POST /api/public/track-view — log landing page visit
router.post("/track-view", async (req, res) => {
  try {
    const { pageId, referrer, utmSource, utmMedium, utmCampaign, utmContent } = req.body;
    if (!pageId) return res.status(400).json({ error: "pageId required" });

    const rawIp = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "";
    const ip = rawIp.includes(".") ? rawIp.replace(/\.\d+$/, ".0") : rawIp;
    const geo = geoip.lookup(rawIp);
    const parser = new UAParser(req.headers["user-agent"] || "");
    const device = parser.getDevice().type || "desktop";
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";

    await prisma.pageView.create({
      data: {
        pageId,
        ip,
        device,
        browser,
        os,
        country: geo?.country || null,
        city: geo?.city || null,
        referer: referrer ? String(referrer).slice(0, 300) : null,
        utmSource: utmSource ? String(utmSource).slice(0, 100) : null,
        utmMedium: utmMedium ? String(utmMedium).slice(0, 100) : null,
        utmCampaign: utmCampaign ? String(utmCampaign).slice(0, 100) : null,
        utmContent: utmContent ? String(utmContent).slice(0, 100) : null,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[TrackView Error]", err.message);
    res.status(500).json({ error: "Failed to record view" });
  }
});

// POST /api/public/track-click — log platform button click
router.post("/track-click", async (req, res) => {
  try {
    const {
      pageId,
      platformLinkId,
      platform,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
    } = req.body;

    if (!pageId) return res.status(400).json({ error: "pageId required" });

    if (platformLinkId) {
      await prisma.platformLink.update({
        where: { id: platformLinkId },
        data: { clicks: { increment: 1 } },
      }).catch(() => {});
    }

    const rawIp = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "";
    const ip = rawIp.includes(".") ? rawIp.replace(/\.\d+$/, ".0") : rawIp;
    const geo = geoip.lookup(rawIp);
    const parser = new UAParser(req.headers["user-agent"] || "");
    const device = parser.getDevice().type || "desktop";
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";

    await prisma.clickLog.create({
      data: {
        platformLinkId: platformLinkId || null,
        platform: platform ? String(platform).slice(0, 50) : null,
        ip,
        city: geo?.city || null,
        country: geo?.country || null,
        device,
        browser,
        os,
        referer: referrer ? String(referrer).slice(0, 300) : null,
        utmSource: utmSource ? String(utmSource).slice(0, 100) : null,
        utmMedium: utmMedium ? String(utmMedium).slice(0, 100) : null,
        utmCampaign: utmCampaign ? String(utmCampaign).slice(0, 100) : null,
        utmContent: utmContent ? String(utmContent).slice(0, 100) : null,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[TrackClick Error]", err.message);
    res.status(500).json({ error: "Failed to record click" });
  }
});

module.exports = router;
