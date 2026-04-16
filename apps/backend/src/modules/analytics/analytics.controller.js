const { getAnalytics } = require("./analytics.service");

async function handleGet(req, res) {
  const { pageId } = req.params;
  const { period } = req.query;
  res.json(await getAnalytics(pageId, period));
}

module.exports = { handleGet };
