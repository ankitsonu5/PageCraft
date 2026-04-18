const { PrismaClient } = require("@prisma/client");
const { fetchAnalytics } = require("../../utils/ga4-data.util");

const prisma = new PrismaClient();

function getPeriodDates(period) {
  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];

  switch (period) {
    case "today":
      return { startDate: fmt(today), endDate: fmt(today) };
    case "7d":
      return { startDate: "7daysAgo", endDate: "today" };
    case "30d":
      return { startDate: "30daysAgo", endDate: "today" };
    case "90d":
      return { startDate: "90daysAgo", endDate: "today" };
    default:
      return { startDate: "365daysAgo", endDate: "today" };
  }
}

async function getAnalytics(pageId, period = "30d") {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      ga4PropertyId: true,
      ga4MeasurementId: true,
      id: true,
      title: true,
      projectId: true,
      fbPixelId: true,
      googleAdsId: true,
      gtmId: true,
      tiktokPixelId: true,
      snapchatPixelId: true,
      appleAffCode: true,
      amazonAffCode: true,
      spotifyAffCode: true,
    },
  });
  if (!page) throw { status: 404, message: "Page not found" };

  const leadsCount = await prisma.fanLead.count({ where: { pageId } });

  const links = await prisma.linkTracker.findMany({
    where: { pageId },
    include: {
      clickLogs: {
        orderBy: { clickedAt: "desc" },
        take: 1,
      },
    },
  });

  // Link click top city per tracker
  const linkStats = await Promise.all(
    links.map(async (link) => {
      const topCity = await prisma.clickLog.groupBy({
        by: ["city"],
        where: { trackerId: link.id, city: { not: null } },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
        take: 1,
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayClicks = await prisma.clickLog.count({
        where: { trackerId: link.id, clickedAt: { gte: todayStart } },
      });

      return {
        id: link.id,
        label: link.label,
        slug: link.slug,
        targetUrl: link.targetUrl,
        totalClicks: link.clicks,
        todayClicks,
        topCity: topCity[0]?.city || null,
      };
    }),
  );

  let ga4Data = null;
  if (page.ga4PropertyId) {
    const { startDate, endDate } = getPeriodDates(period);
    ga4Data = await fetchAnalytics({
      propertyId: page.ga4PropertyId,
      startDate,
      endDate,
    });
  }

  return { page, ga4Data, links: linkStats, leadsCount };
}

module.exports = { getAnalytics };
