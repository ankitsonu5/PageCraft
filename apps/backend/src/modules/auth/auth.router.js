const express = require("express");
const { handleLogin, handleMe } = require("./auth.controller");
const { authMiddleware } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/login", handleLogin);
router.get("/me", authMiddleware, handleMe);

module.exports = router;
