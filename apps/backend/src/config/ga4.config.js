const { AnalyticsAdminServiceClient } = require("@google-analytics/admin");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const path = require("path");

// __dirname = apps/backend/src/config  →  ../../../../ = project root
const keyFilename = path.resolve(
  __dirname,
  "../../../../secrets/ga4-service-account.json",
);

const adminClient = new AnalyticsAdminServiceClient({ keyFilename });
const dataClient = new BetaAnalyticsDataClient({ keyFilename });

module.exports = { adminClient, dataClient };
