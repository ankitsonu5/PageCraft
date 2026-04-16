const express = require("express");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const { PrismaClient } = require("@prisma/client");
const { sendCAPIEvent } = require("../../utils/meta-capi.util");

const prisma = new PrismaClient();
const router = express.Router();

// GET /t/:slug  — public click-tracking redirect
router.get("/:slug", async (req, res) => {
  const tracker = await prisma.linkTracker.findUnique({
    where: { slug: req.params.slug },
    include: { page: { include: { project: true } } },
  });

  if (!tracker) return res.status(404).send("Link not found");

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
  const geo = geoip.lookup(ip);
  const parser = new UAParser(req.headers["user-agent"]);
  const deviceType = parser.getDevice().type || "desktop";

  await prisma.$transaction([
    prisma.linkTracker.update({
      where: { id: tracker.id },
      data: { clicks: { increment: 1 } },
    }),
    prisma.clickLog.create({
      data: {
        trackerId: tracker.id,
        ip,
        city: geo?.city || null,
        country: geo?.country || null,
        device: deviceType,
        referer: req.headers["referer"] || "direct",
      },
    }),
  ]);

  // Meta CAPI — ViewContent (fire and forget)
  const proj = tracker.page?.project;
  if (proj?.metaPixelId && proj?.metaCapiToken) {
    sendCAPIEvent({
      pixelId: proj.metaPixelId,
      accessToken: proj.metaCapiToken,
      eventName: "ViewContent",
      pageUrl: tracker.targetUrl,
      clientIp: ip,
      clientUserAgent: req.headers["user-agent"],
    }).catch(() => {});
  }

  res.redirect(301, tracker.targetUrl);
});

module.exports = router;
