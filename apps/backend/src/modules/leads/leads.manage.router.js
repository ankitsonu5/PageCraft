const express = require("express");
const {
  getLeads,
  getLeadsSummary,
  exportLeadsCsv,
} = require("./leads.service");

const router = express.Router();

// GET /api/leads/manage?projectId=xxx
router.get("/", async (req, res) => {
  const { projectId, platform, segment } = req.query;
  if (!projectId) return res.status(400).json({ error: "projectId required" });
  res.json(await getLeads({ projectId, platform, segment }));
});

// GET /api/leads/manage/summary?projectId=xxx
router.get("/summary", async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ error: "projectId required" });
  res.json(await getLeadsSummary(projectId));
});

// GET /api/leads/manage/export/:projectId
router.get("/export/:projectId", async (req, res) => {
  const csv = await exportLeadsCsv(req.params.projectId);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="leads-${req.params.projectId}.csv"`,
  );
  res.send(csv);
});

module.exports = router;
