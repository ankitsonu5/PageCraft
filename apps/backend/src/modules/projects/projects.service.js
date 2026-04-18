const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SAFE_PROJECT_FIELDS = {
  id: true,
  name: true,
  slug: true,
  description: true,
  color: true,
  logo: true,
  createdAt: true,
  updatedAt: true,
  metaPixelId: true, // public pixel ID is fine
  klaviyoListId: true, // list ID is fine
  // metaCapiToken and klaviyoApiKey are NEVER sent to client
};

async function listProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: { ...SAFE_PROJECT_FIELDS, _count: { select: { pages: true } } },
  });
}

async function getProject(id) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      ...SAFE_PROJECT_FIELDS,
      defaultHeader: true,
      defaultFooter: true,
      pages: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          publishedAt: true,
          updatedAt: true,
          ga4MeasurementId: true,
        },
      },
    },
  });
  if (!project) throw { status: 404, message: "Project not found" };
  return project;
}

async function createProject(data) {
  const { name, description, color, logo } = data;
  if (!name) throw { status: 400, message: "Project name required" };

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return prisma.project.create({
    data: { name, slug, description, color: color || "#534AB7", logo },
  });
}

async function updateProject(id, data) {
  const allowed = [
    "name",
    "description",
    "color",
    "logo",
    "defaultHeader",
    "defaultFooter",
    "metaPixelId",
    "metaCapiToken",
    "klaviyoApiKey",
    "klaviyoListId",
  ];
  const patch = {};
  for (const key of allowed) {
    if (key in data) patch[key] = data[key];
  }
  return prisma.project.update({ where: { id }, data: patch });
}

async function deleteProject(id) {
  // cascade: pages and their link trackers are deleted by DB cascade
  await prisma.project.delete({ where: { id } });
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
