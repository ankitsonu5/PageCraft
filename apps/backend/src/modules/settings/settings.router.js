const express = require("express");
const {
  getTrackingSettings,
  updateTrackingSettings,
} = require("./settings.service");

const prisma = require("../../lib/prisma");

const router = express.Router();

// GET /api/settings/tracking — global Tracking & Analytics settings
router.get("/tracking", async (req, res) => {
  res.json(await getTrackingSettings({ fresh: true }));
});

// PUT /api/settings/tracking — update global tracking settings
router.put("/tracking", async (req, res) => {
  res.json(await updateTrackingSettings(req.body));
});

// GET /api/settings/tracking/status — what is configured + recent events (last 24h)
router.get("/tracking/status", async (req, res) => {
  const s = await getTrackingSettings({ fresh: true });
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [pageViews, clicksByPlatform, recentClicks] = await Promise.all([
    prisma.pageView.count({ where: { viewedAt: { gte: since } } }),
    prisma.clickLog.groupBy({
      by: ["platform"],
      where: { clickedAt: { gte: since }, platform: { not: null } },
      _count: { _all: true },
    }),
    prisma.clickLog.findMany({
      where: { platform: { not: null } },
      orderBy: { clickedAt: "desc" },
      take: 10,
      select: { platform: true, device: true, clickedAt: true },
    }),
  ]);
  res.json({
    connected: {
      gtm: Boolean(s.gtmId),
      ga4: Boolean(s.ga4MeasurementId) || Boolean(s.gtmId && s.googleTagsViaGtm),
      googleAds: Boolean(s.googleAdsId) || Boolean(s.gtmId && s.googleTagsViaGtm),
      meta: Boolean(s.metaPixelId),
      tiktok: Boolean(s.tiktokPixelId),
      snapchat: Boolean(s.snapchatPixelId),
    },
    last24h: {
      pageViews,
      streamingClicks: clicksByPlatform
        .map((r) => ({ platform: r.platform, count: r._count._all }))
        .sort((a, b) => b.count - a.count),
    },
    recentClicks,
  });
});

module.exports = router;
