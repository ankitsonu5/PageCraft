const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: __dirname + "/../../../apps/backend/.env" });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@pagecraft.in";
  const password = process.env.ADMIN_PASSWORD || "changeme123";
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: { email, passwordHash: hash, name: "Admin" },
  });

  console.log("✓ Admin seeded:", admin.email);

  // Demo project
  const project = await prisma.project.upsert({
    where: { slug: "my-first-project" },
    update: {},
    create: {
      name: "My First Project",
      slug: "my-first-project",
      description: "PageCraft demo project",
      color: "#534AB7",
    },
  });

  console.log("✓ Demo project seeded:", project.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
