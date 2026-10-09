const express = require("express");
const {
  getTrackingSettings,
  updateTrackingSettings,
} = require("./settings.service");

const router = express.Router();

// GET /api/settings/tracking — global Tracking & Analytics settings
router.get("/tracking", async (req, res) => {
  res.json(await getTrackingSettings({ fresh: true }));
});

// PUT /api/settings/tracking — update global tracking settings
router.put("/tracking", async (req, res) => {
  res.json(await updateTrackingSettings(req.body));
});

module.exports = router;
