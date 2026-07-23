const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function login(email, password) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

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
  if (!admin) {
    const error = new Error("Admin not found");
    error.status = 404;
    throw error;
  }
  return { id: admin.id, email: admin.email, name: admin.name };
}

module.exports = { login, getMe };
