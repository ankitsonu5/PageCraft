const prisma = require("../../lib/prisma");

const RESERVED_SLUGS = [
  "admin",
  "login",
  "api",
  "dashboard",
  "settings",
  "project",
  "builder",
  "analytics",
  "leads",
  "uploads",
  "health",
  "public",
  "t",
  "p",
];

function sanitizeSlug(slug) {
  if (!slug) return "";
  return String(slug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function listPages(projectId, filters = {}) {
  if (!projectId) throw { status: 400, message: "projectId required" };
  const { brand, campaignType, status } = filters;

  const where = { projectId };
  if (brand) where.brand = brand;
  if (campaignType) where.campaignType = campaignType;
  if (status) where.status = status;

  return prisma.page.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      platformLinks: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { leads: true, pageViews: true },
      },
    },
  });
}

async function getPage(id) {
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      platformLinks: {
        orderBy: { order: "asc" },
      },
      linkTrackers: true,
      _count: {
        select: { leads: true, pageViews: true },
      },
    },
  });
  if (!page) throw { status: 404, message: "Page not found" };
  return page;
}

async function createPage(data) {
  const {
    projectId,
    title,
    slug: rawSlug,
    campaignType = "podcast",
    brand = "ASHWIN_GANE",
    status = "PUBLISHED",
    artistName,
    episodeNumber,
    guestName,
    hostName,
    ctaType = "Listen Now",
    coverImage,
    bgImage,
    releaseDate,
    ctaText = "Listen Now",
    customDomain,
    enableFanForm = true,
    fanFormTitle = "Join the Inner Circle",
    ogImage,
    platformLinks = [],
  } = data;

  if (!projectId || !title || !rawSlug) {
    throw { status: 400, message: "projectId, title, and slug required" };
  }

  const cleanSlug = sanitizeSlug(rawSlug);

  if (RESERVED_SLUGS.includes(cleanSlug)) {
    throw { status: 400, message: `'${cleanSlug}' is a reserved URL path and cannot be used.` };
  }

  const existing = await prisma.page.findFirst({
    where: { slug: cleanSlug },
  });
  if (existing) {
    throw { status: 400, message: "URL slug already exists. Please choose a unique slug." };
  }

  const page = await prisma.page.create({
    data: {
      projectId,
      title,
      slug: cleanSlug,
      campaignType,
      brand,
      status,
      artistName: artistName || null,
      episodeNumber: episodeNumber || null,
      guestName: guestName || null,
      hostName: hostName || null,
      ctaType: ctaType || "Listen Now",
      coverImage: coverImage || null,
      bgImage: bgImage || null,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      ctaText,
      customDomain: customDomain || null,
      enableFanForm: Boolean(enableFanForm),
      fanFormTitle,
      ogImage: ogImage || coverImage || null,
      sections: "[]",
      isPublished: status === "PUBLISHED",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      platformLinks: {
        create: (platformLinks || []).map((link, idx) => ({
          platform: link.platform || "spotify",
          name: link.name || "Listen",
          url: link.url || "#",
          icon: link.icon || null,
          order: link.order !== undefined ? link.order : idx,
          isActive: link.isActive !== undefined ? Boolean(link.isActive) : true,
        })),
      },
    },
    include: {
      platformLinks: {
        orderBy: { order: "asc" },
      },
    },
  });

  return page;
}

async function updatePage(id, data) {
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) throw { status: 404, message: "Page not found" };

  const {
    title,
    slug: rawSlug,
    campaignType,
    brand,
    status,
    artistName,
    episodeNumber,
    guestName,
    hostName,
    ctaType,
    coverImage,
    bgImage,
    releaseDate,
    ctaText,
    customDomain,
    enableFanForm,
    fanFormTitle,
    ogImage,
    metaTitle,
    metaDescription,
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
    platformLinks,
  } = data;

  let cleanSlug;
  if (rawSlug !== undefined) {
    cleanSlug = sanitizeSlug(rawSlug);
    if (RESERVED_SLUGS.includes(cleanSlug)) {
      throw { status: 400, message: `'${cleanSlug}' is a reserved URL path.` };
    }
    if (cleanSlug !== existing.slug) {
      const slugCheck = await prisma.page.findFirst({
        where: { slug: cleanSlug, NOT: { id } },
      });
      if (slugCheck) {
        throw { status: 400, message: "URL slug already in use by another campaign." };
      }
    }
  }

  if (Array.isArray(platformLinks)) {
    await prisma.platformLink.deleteMany({ where: { pageId: id } });
    if (platformLinks.length > 0) {
      await prisma.platformLink.createMany({
        data: platformLinks.map((link, idx) => ({
          pageId: id,
          platform: link.platform || "spotify",
          name: link.name || "Listen",
          url: link.url || "#",
          icon: link.icon || null,
          order: link.order !== undefined ? link.order : idx,
          isActive: link.isActive !== undefined ? Boolean(link.isActive) : true,
        })),
      });
    }
  }

  const updatedStatus = status !== undefined ? status : existing.status;
  const isPublished = updatedStatus === "PUBLISHED";

  const updated = await prisma.page.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(cleanSlug !== undefined && { slug: cleanSlug }),
      ...(campaignType !== undefined && { campaignType }),
      ...(brand !== undefined && { brand }),
      ...(status !== undefined && { status: updatedStatus, isPublished }),
      ...(artistName !== undefined && { artistName }),
      ...(episodeNumber !== undefined && { episodeNumber }),
      ...(guestName !== undefined && { guestName }),
      ...(hostName !== undefined && { hostName }),
      ...(ctaType !== undefined && { ctaType }),
      ...(coverImage !== undefined && { coverImage }),
      ...(bgImage !== undefined && { bgImage }),
      ...(releaseDate !== undefined && { releaseDate: releaseDate ? new Date(releaseDate) : null }),
      ...(ctaText !== undefined && { ctaText }),
      ...(customDomain !== undefined && { customDomain }),
      ...(enableFanForm !== undefined && { enableFanForm: Boolean(enableFanForm) }),
      ...(fanFormTitle !== undefined && { fanFormTitle }),
      ...(ogImage !== undefined && { ogImage }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
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
      ...(isPublished && !existing.publishedAt && { publishedAt: new Date() }),
    },
    include: {
      platformLinks: {
        orderBy: { order: "asc" },
      },
    },
  });

  return updated;
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

  if (!page.ga4MeasurementId && typeof createGA4Property === "function") {
    try {
      const result = await createGA4Property({
        pageTitle: page.title,
        pageSlug: page.slug,
        projectName: page.project.name,
      });
      if (result) ga4Data = result;
    } catch (_err) {
      // skip auto-provisioning if GA4 API is not configured
    }
  }

  return prisma.page.update({
    where: { id: pageId },
    data: {
      isPublished: true,
      status: "PUBLISHED",
      publishedAt: new Date(),
      ...ga4Data,
    },
    include: {
      platformLinks: { orderBy: { order: "asc" } },
    },
  });
}

async function duplicatePage(id) {
  const src = await prisma.page.findUnique({
    where: { id },
    include: { platformLinks: true },
  });
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
      campaignType: src.campaignType,
      brand: src.brand,
      status: "DRAFT",
      isPublished: false,
      artistName: src.artistName,
      episodeNumber: src.episodeNumber,
      guestName: src.guestName,
      hostName: src.hostName,
      ctaType: src.ctaType,
      coverImage: src.coverImage,
      bgImage: src.bgImage,
      releaseDate: src.releaseDate,
      ctaText: src.ctaText,
      customDomain: src.customDomain,
      enableFanForm: src.enableFanForm,
      fanFormTitle: src.fanFormTitle,
      ogImage: src.ogImage,
      sections: src.sections,
      metaTitle: src.metaTitle,
      metaDescription: src.metaDescription,
      pageBgColor: src.pageBgColor,
      pageBgImage: src.pageBgImage,
      platformLinks: {
        create: (src.platformLinks || []).map((link) => ({
          platform: link.platform,
          name: link.name,
          url: link.url,
          icon: link.icon,
          order: link.order,
          isActive: link.isActive,
        })),
      },
    },
    include: {
      platformLinks: { orderBy: { order: "asc" } },
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
