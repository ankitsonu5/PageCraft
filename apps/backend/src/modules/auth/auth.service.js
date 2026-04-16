const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function login(email, password) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw { status: 401, message: "Invalid credentials" };

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) throw { status: 401, message: "Invalid credentials" };

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

  return {
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  };
}

async function getMe(adminId) {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw { status: 404, message: "Admin not found" };
  return { id: admin.id, email: admin.email, name: admin.name };
}

module.exports = { login, getMe };
