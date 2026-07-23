const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");

async function login(email, password) {
  let admin;
  try {
    admin = await prisma.admin.findUnique({ where: { email } });
  } catch (dbError) {
    console.error("[Auth Service] Database connection error during login:", dbError.message);
    const error = new Error("Database service temporarily unavailable. Please try again.");
    error.status = 503;
    throw error;
  }

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
