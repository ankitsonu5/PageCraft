const prisma = require("../../lib/prisma");

function getFilterDate(period) {
  const now = new Date();
  switch (period) {
    case "today":
      now.setHours(0, 0, 0, 0);
      return now;
    case "7d":
      now.setDate(now.getDate() - 7);
      return now;
    case "30d":
      now.setDate(now.getDate() - 30);
      return now;
    case "90d":
      now.setDate(now.getDate() - 90);
      return now;
    default:
      return null; // all time
  }
}

async function getAnalyticsOverview(period = "30d") {
  const filterDate = getFilterDate(period);
  const pageViewWhere = filterDate ? { viewedAt: { gte: filterDate } } : {};
  const clickWhere = filterDate ? { clickedAt: { gte: filterDate } } : {};

  const totalPageViews = await prisma.pageView.count({ where: pageViewWhere });

  const uniqueVisitorsGroup = await prisma.pageView.groupBy({
    by: ["ip"],
    where: { ...pageViewWhere, ip: { not: null } },
  });
  const uniqueVisitors = uniqueVisitorsGroup.length;

  const totalClicks = await prisma.clickLog.count({ where: clickWhere });
  const ctr = totalPageViews > 0 ? ((totalClicks / totalPageViews) * 100).toFixed(1) : "0.0";

  const platformClicks = await prisma.clickLog.groupBy({
    by: ["platform"],
    where: { ...clickWhere, platform: { not: null } },
    _count: { platform: true },
    orderBy: { _count: { platform: "desc" } },
  });

  const countryTraffic = await prisma.pageView.groupBy({
    by: ["country"],
    where: { ...pageViewWhere, country: { not: null } },
    _count: { country: true },
    orderBy: { _count: { country: "desc" } },
    take: 10,
  });

  const deviceTraffic = await prisma.pageView.groupBy({
    by: ["device"],
    where: { ...pageViewWhere, device: { not: null } },
    _count: { device: true },
  });

  const pages = await prisma.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      brand: true,
      campaignType: true,
      _count: {
        select: {
          pageViews: true,
          leads: true,
        },
      },
      platformLinks: {
        select: { clicks: true },
      },
    },
    take: 10,
  });

  const campaignPerformance = pages.map((c) => {
    const totalClicksForCampaign = c.platformLinks.reduce((sum, l) => sum + l.clicks, 0);
    const views = c._count.pageViews;
    const campaignCtr = views > 0 ? ((totalClicksForCampaign / views) * 100).toFixed(1) : "0.0";
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      brand: c.brand,
      campaignType: c.campaignType,
      views,
      clicks: totalClicksForCampaign,
      leads: c._count.leads,
      ctr: campaignCtr,
    };
  }).sort((a, b) => b.views - a.views);

  return {
    period,
    overview: {
      totalPageViews,
      uniqueVisitors,
      totalClicks,
      ctr,
    },
    platformClicks: platformClicks.map((p) => ({
      platform: p.platform || "Custom",
      clicks: p._count.platform,
    })),
    countryTraffic: countryTraffic.map((c) => ({
      country: c.country,
      views: c._count.country,
    })),
    deviceTraffic: deviceTraffic.map((d) => ({
      device: d.device || "desktop",
      views: d._count.device,
    })),
    topCampaigns: campaignPerformance,
  };
}

async function getPageAnalytics(pageId, period = "30d") {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      platformLinks: { orderBy: { order: "asc" } },
    },
  });
  if (!page) throw { status: 404, message: "Campaign not found" };

  const filterDate = getFilterDate(period);
  const pageViewWhere = { pageId, ...(filterDate ? { viewedAt: { gte: filterDate } } : {}) };

  const totalViews = await prisma.pageView.count({ where: pageViewWhere });

  const uniqueVisitorsGroup = await prisma.pageView.groupBy({
    by: ["ip"],
    where: { ...pageViewWhere, ip: { not: null } },
  });
  const uniqueVisitors = uniqueVisitorsGroup.length;

  const totalClicks = page.platformLinks.reduce((sum, l) => sum + l.clicks, 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  const leadsCount = await prisma.fanLead.count({ where: { pageId } });

  return {
    page: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      brand: page.brand,
      campaignType: page.campaignType,
    },
    overview: {
      totalViews,
      uniqueVisitors,
      totalClicks,
      ctr,
      leadsCount,
    },
    platformLinks: page.platformLinks,
  };
}

async function exportAnalyticsCsv() {
  const pages = await prisma.page.findMany({
    include: {
      platformLinks: true,
      _count: { select: { pageViews: true, leads: true } },
    },
  });

  const header = "Campaign Title,Slug,Brand,Type,Page Views,Platform Clicks,Leads,CTR (%)\n";
  const rows = pages.map((p) => {
    const totalClicks = p.platformLinks.reduce((sum, l) => sum + l.clicks, 0);
    const views = p._count.pageViews;
    const ctr = views > 0 ? ((totalClicks / views) * 100).toFixed(1) : "0.0";
    return `"${p.title.replace(/"/g, '""')}","${p.slug}","${p.brand}","${p.campaignType}",${views},${totalClicks},${p._count.leads},${ctr}`;
  }).join("\n");

  return header + rows;
}

module.exports = {
  getAnalyticsOverview,
  getPageAnalytics,
  exportAnalyticsCsv,
};
