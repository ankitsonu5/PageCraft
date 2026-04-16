const express = require("express");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const { PrismaClient } = require("@prisma/client");
const { sendCAPIEvent } = require("../../utils/meta-capi.util");
const { addToKlaviyoList } = require("../../utils/klaviyo.util");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/leads  — public, fan email submit from published page
router.post("/", async (req, res) => {
  const { pageId, email, name, platform, source } = req.body;
  if (!pageId || !email) {
    return res.status(400).json({ error: "pageId and email are required" });
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { project: true },
  });
  if (!page) return res.status(404).json({ error: "Page not found" });

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
  const geo = geoip.lookup(ip);
  const parser = new UAParser(req.headers["user-agent"] || "");
  const device = parser.getDevice().type || "desktop";

  const lead = await prisma.fanLead.create({
    data: {
      pageId,
      projectId: page.projectId,
      email,
      name: name || null,
      platform: platform || null,
      source: source || "direct",
      city: geo?.city || null,
      country: geo?.country || null,
      device,
      segment: "cold",
    },
  });

  const { metaPixelId, metaCapiToken, klaviyoApiKey, klaviyoListId } =
    page.project;

  // Meta CAPI — Lead event (fire and forget)
  sendCAPIEvent({
    pixelId: metaPixelId,
    accessToken: metaCapiToken,
    eventName: "Lead",
    email,
    pageUrl: `${process.env.APP_BASE_URL}/p/${page.slug}`,
    clientIp: ip,
    clientUserAgent: req.headers["user-agent"],
  }).catch(() => {});

  // Klaviyo sync (fire and forget, then update flag)
  addToKlaviyoList({
    apiKey: klaviyoApiKey,
    listId: klaviyoListId,
    email,
    name,
    source,
    platform,
  })
    .then(() =>
      prisma.fanLead.update({
        where: { id: lead.id },
        data: { klaviyoSynced: true },
      }),
    )
    .catch(() => {});

  res.json({ success: true, message: "Subscribed successfully" });
});

module.exports = router;
