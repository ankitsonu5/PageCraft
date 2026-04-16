const { login, getMe } = require("./auth.service");

async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const result = await login(email, password);
  res.json(result);
}

async function handleMe(req, res) {
  const admin = await getMe(req.adminId);
  res.json(admin);
}

module.exports = { handleLogin, handleMe };
