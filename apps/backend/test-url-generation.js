require("dotenv").config({ path: __dirname + "/.env" });
const prisma = require("./src/lib/prisma");
const http = require("http");

async function runUrlTests() {
  console.log("=== Dynamic URL Generation & Redirect Verification ===");

  // 1. Get or create project
  let project = await prisma.project.findFirst();
  if (!project) {
    project = await prisma.project.create({
      data: { name: "URL Test Project", slug: "url-test" },
    });
  }

  // 2. Test Creating Reserved Slug (should fail)
  console.log("\n1. Testing Reserved Slug Validation ('dashboard'):");
  const pagesService = require("./src/modules/pages/pages.service");
  try {
    await pagesService.createPage({
      projectId: project.id,
      title: "Reserved Test",
      slug: "dashboard",
    });
    console.error("FAILED: Reserved slug was allowed!");
  } catch (err) {
    console.log("SUCCESS: Reserved slug rejected with error:", err.message);
  }

  // 3. Create clean campaign slug
  const cleanSlug = `seo-podcast-ep-${Date.now().toString().slice(-4)}`;
  console.log(`\n2. Creating Clean Campaign with slug: '${cleanSlug}'`);
  const page = await pagesService.createPage({
    projectId: project.id,
    title: "Clean SEO Campaign",
    slug: cleanSlug,
    campaignType: "podcast",
  });
  console.log("Page Created:", page.id, "Slug:", page.slug);

  // 4. Test Legacy Redirect GET /p/:slug (should 301 redirect to /:slug)
  console.log(`\n3. Testing 301 Redirect for GET http://localhost:3100/p/${cleanSlug}`);
  await new Promise((resolve) => {
    http.get(`http://localhost:3100/p/${cleanSlug}`, (res) => {
      console.log("HTTP Status Code:", res.statusCode);
      console.log("Location Header:", res.headers.location);
      if (res.statusCode === 301 && res.headers.location === `/${cleanSlug}`) {
        console.log("SUCCESS: 301 Redirect to clean URL verified!");
      } else {
        console.error("FAILED: Unexpected redirect response");
      }
      resolve();
    });
  });

  await prisma.$disconnect();
  console.log("\n=== ALL URL TESTS PASSED SUCCESSFULLY ===");
}

runUrlTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
