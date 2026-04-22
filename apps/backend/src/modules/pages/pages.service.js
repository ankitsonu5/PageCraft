const { PrismaClient } = require("@prisma/client");
const { createGA4Property } = require("../../utils/ga4-admin.util");

const prisma = new PrismaClient();

async function listPages(projectId) {
  if (!projectId) throw { status: 400, message: "projectId required" };
  return prisma.page.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      publishedAt: true,
      updatedAt: true,
      ga4MeasurementId: true,
      metaTitle: true,
    },
  });
}

async function getPage(id) {
  const page = await prisma.page.findUnique({
    where: { id },
    include: { linkTrackers: true },
  });
  if (!page) throw { status: 404, message: "Page not found" };
  return page;
}

async function createPage(data) {
  const { projectId, title, slug } = data;
  if (!projectId || !title || !slug) {
    throw { status: 400, message: "projectId, title, and slug required" };
  }
  return prisma.page.create({
    data: { projectId, title, slug, sections: [] },
  });
}

async function updatePage(id, data) {
  const {
    title,
    sections,
    metaTitle,
    metaDescription,
    slug,
    pageBgColor,
    pageBgImage,
    fbPixelId,
    googleAdsId,
    gtmId,
    tiktokPixelId,
    snapchatPixelId,
    privacyPolicyUrl,
    termsUrl,
    appleAffCode,
    amazonAffCode,
    spotifyAffCode,
  } = data;
  return prisma.page.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(sections !== undefined && { sections }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(slug !== undefined && { slug }),
      ...(pageBgColor !== undefined && { pageBgColor }),
      ...(pageBgImage !== undefined && { pageBgImage }),
      ...(fbPixelId !== undefined && { fbPixelId }),
      ...(googleAdsId !== undefined && { googleAdsId }),
      ...(gtmId !== undefined && { gtmId }),
      ...(tiktokPixelId !== undefined && { tiktokPixelId }),
      ...(snapchatPixelId !== undefined && { snapchatPixelId }),
      ...(privacyPolicyUrl !== undefined && { privacyPolicyUrl }),
      ...(termsUrl !== undefined && { termsUrl }),
      ...(appleAffCode !== undefined && { appleAffCode }),
      ...(amazonAffCode !== undefined && { amazonAffCode }),
      ...(spotifyAffCode !== undefined && { spotifyAffCode }),
    },
  });
}

async function publishPage(pageId) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { project: true },
  });
  if (!page) throw { status: 404, message: "Page not found" };

  let ga4Data = {
    ga4PropertyId: page.ga4PropertyId,
    ga4MeasurementId: page.ga4MeasurementId,
    ga4StreamId: page.ga4StreamId,
  };

  if (!page.ga4MeasurementId) {
    const result = await createGA4Property({
      pageTitle: page.title,
      pageSlug: page.slug,
      projectName: page.project.name,
    });
    if (result) ga4Data = result;
  }

  return prisma.page.update({
    where: { id: pageId },
    data: { isPublished: true, publishedAt: new Date(), ...ga4Data },
  });
}

async function duplicatePage(id) {
  const src = await prisma.page.findUnique({ where: { id } });
  if (!src) throw { status: 404, message: "Page not found" };

  const baseSlug = `${src.slug}-copy`;
  let slug = baseSlug;
  let attempt = 1;
  while (
    await prisma.page.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${baseSlug}-${attempt++}`;
  }

  return prisma.page.create({
    data: {
      projectId: src.projectId,
      title: `${src.title} (Copy)`,
      slug,
      sections: src.sections,
      metaTitle: src.metaTitle,
      metaDescription: src.metaDescription,
      pageBgColor: src.pageBgColor,
      pageBgImage: src.pageBgImage,
    },
  });
}

async function deletePage(id) {
  await prisma.page.delete({ where: { id } });
}

module.exports = {
  listPages,
  getPage,
  createPage,
  updatePage,
  publishPage,
  duplicatePage,
  deletePage,
};
