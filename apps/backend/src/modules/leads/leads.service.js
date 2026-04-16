const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getLeads({
  projectId,
  platform,
  segment,
  limit = 200,
  offset = 0,
}) {
  const where = { projectId };
  if (platform) where.platform = platform;
  if (segment) where.segment = segment;

  const [leads, total] = await Promise.all([
    prisma.fanLead.findMany({
      where,
      orderBy: { capturedAt: "desc" },
      take: limit,
      skip: offset,
      include: { page: { select: { title: true, slug: true } } },
    }),
    prisma.fanLead.count({ where }),
  ]);

  return { leads, total };
}

async function getLeadsSummary(projectId) {
  const [total, synced, byPlatform, byCountry] = await Promise.all([
    prisma.fanLead.count({ where: { projectId } }),
    prisma.fanLead.count({ where: { projectId, klaviyoSynced: true } }),
    prisma.fanLead.groupBy({
      by: ["platform"],
      where: { projectId, platform: { not: null } },
      _count: true,
      orderBy: { _count: { platform: "desc" } },
    }),
    prisma.fanLead.groupBy({
      by: ["country"],
      where: { projectId, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: "desc" } },
      take: 5,
    }),
  ]);

  return { total, synced, byPlatform, byCountry };
}

async function exportLeadsCsv(projectId) {
  const leads = await prisma.fanLead.findMany({
    where: { projectId },
    orderBy: { capturedAt: "desc" },
    include: { page: { select: { title: true } } },
  });

  const header =
    "Email,Name,Platform,Source,City,Country,Device,Segment,Klaviyo Synced,Page,Captured At";
  const rows = leads.map((l) =>
    [
      l.email,
      l.name || "",
      l.platform || "",
      l.source || "",
      l.city || "",
      l.country || "",
      l.device || "",
      l.segment,
      l.klaviyoSynced ? "Yes" : "No",
      l.page?.title || "",
      l.capturedAt.toISOString(),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );

  return [header, ...rows].join("\n");
}

async function retrySyncLead(leadId) {
  return prisma.fanLead.update({
    where: { id: leadId },
    data: { klaviyoSynced: false },
  });
}

module.exports = { getLeads, getLeadsSummary, exportLeadsCsv, retrySyncLead };
