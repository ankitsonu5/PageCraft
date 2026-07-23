require("dotenv").config({ path: __dirname + "/.env" });
const prisma = require("./src/lib/prisma");
const analyticsService = require("./src/modules/analytics/analytics.service");

async function runAnalyticsTest() {
  console.log("=== Campaign Analytics System Verification ===");

  // 1. Get or create project & page
  let project = await prisma.project.findFirst();
  if (!project) {
    project = await prisma.project.create({
      data: { name: "Analytics Test Project", slug: "analytics-test" },
    });
  }

  const pagesService = require("./src/modules/pages/pages.service");
  const testSlug = `analytics-podcast-${Date.now().toString().slice(-4)}`;
  const page = await pagesService.createPage({
    projectId: project.id,
    title: "Analytics Podcast Campaign",
    slug: testSlug,
    campaignType: "podcast",
    status: "PUBLISHED",
  });
  console.log(`\nCreated test campaign page: ${page.title} (slug: ${page.slug})`);

  // 2. Simulate Page Views (with referrers and UTM tags)
  console.log("\n1. Logging simulated Page Views...");
  await prisma.pageView.createMany({
    data: [
      {
        pageId: page.id,
        ip: "103.21.124.1",
        device: "mobile",
        browser: "Chrome",
        os: "iOS",
        country: "IN",
        city: "Mumbai",
        referer: "https://instagram.com",
        utmSource: "instagram",
        utmMedium: "story",
        utmCampaign: "mind_over_matter_ep12",
      },
      {
        pageId: page.id,
        ip: "103.21.124.2",
        device: "desktop",
        browser: "Safari",
        os: "macOS",
        country: "US",
        city: "New York",
        referer: "https://twitter.com",
        utmSource: "twitter",
        utmMedium: "tweet",
        utmCampaign: "mind_over_matter_ep12",
      },
      {
        pageId: page.id,
        ip: "103.21.124.3",
        device: "mobile",
        browser: "Chrome",
        os: "Android",
        country: "IN",
        city: "Delhi",
        referer: "https://facebook.com",
        utmSource: "facebook",
        utmMedium: "ad",
        utmCampaign: "mind_over_matter_ep12",
      },
    ],
  });

  // 3. Simulate Platform Clicks
  console.log("\n2. Logging simulated Platform Clicks...");
  await prisma.clickLog.createMany({
    data: [
      {
        platform: "spotify",
        ip: "103.21.124.1",
        country: "IN",
        device: "mobile",
        browser: "Chrome",
        os: "iOS",
        referer: "https://instagram.com",
        utmSource: "instagram",
      },
      {
        platform: "apple_podcasts",
        ip: "103.21.124.2",
        country: "US",
        device: "desktop",
        browser: "Safari",
        os: "macOS",
        referer: "https://twitter.com",
        utmSource: "twitter",
      },
    ],
  });

  // 4. Simulate Fan Lead Capture
  console.log("\n3. Capturing simulated Fan Lead submission...");
  await prisma.fanLead.create({
    data: {
      pageId: page.id,
      projectId: project.id,
      email: "fan.test@example.com",
      name: "Test Fan",
      platform: "spotify",
      source: "podcast_page",
      country: "IN",
      device: "mobile",
      utmSource: "instagram",
      utmCampaign: "mind_over_matter_ep12",
    },
  });

  // 5. Test Analytics Overview aggregation
  console.log("\n4. Testing Analytics Overview calculation:");
  const overview = await analyticsService.getAnalyticsOverview("30d");
  console.log("Overview KPIs:", overview.overview);
  console.log("Platform Clicks:", overview.platformClicks);
  console.log("Device Traffic:", overview.deviceTraffic);

  // 6. Test Single Page Analytics
  console.log("\n5. Testing Single Page Analytics calculation:");
  const pageAnalytics = await analyticsService.getPageAnalytics(page.id, "30d");
  console.log("Campaign KPIs:", pageAnalytics.overview);

  // 7. Test CSV Export generator
  console.log("\n6. Testing Analytics CSV Export:");
  const csvData = await analyticsService.exportAnalyticsCsv();
  console.log("CSV Header & Sample Row:");
  console.log(csvData.split("\n").slice(0, 3).join("\n"));

  await prisma.$disconnect();
  console.log("\n=== ALL CAMPAIGN ANALYTICS TESTS PASSED ===");
}

runAnalyticsTest().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
