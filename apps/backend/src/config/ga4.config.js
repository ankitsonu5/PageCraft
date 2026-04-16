const { AnalyticsAdminServiceClient } = require("@google-analytics/admin");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

const keyFilename = process.env.GA4_SERVICE_ACCOUNT_KEY_PATH;

const adminClient = new AnalyticsAdminServiceClient({ keyFilename });
const dataClient = new BetaAnalyticsDataClient({ keyFilename });

module.exports = { adminClient, dataClient };
