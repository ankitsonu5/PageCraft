const {
  getAnalyticsOverview,
  getPageAnalytics,
  exportAnalyticsCsv,
} = require("./analytics.service");

async function handleOverview(req, res) {
  const { period } = req.query;
  res.json(await getAnalyticsOverview(period));
}

async function handleGet(req, res) {
  const { pageId } = req.params;
  const { period } = req.query;
  res.json(await getPageAnalytics(pageId, period));
}

async function handleExport(req, res) {
  const csv = await exportAnalyticsCsv();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="pagecraft-analytics.csv"');
  res.send(csv);
}

module.exports = { handleOverview, handleGet, handleExport };
