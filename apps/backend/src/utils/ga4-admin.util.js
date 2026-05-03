const { adminClient } = require("../config/ga4.config");

async function createGA4Property({ pageTitle, pageSlug, projectName }) {
  try {
    const [property] = await adminClient.createProperty({
      property: {
        displayName: `${projectName} — ${pageTitle}`,
        timeZone: "Asia/Kolkata",
        currencyCode: "INR",
        industryCategory: "OTHER",
        parent: process.env.GA4_ACCOUNT_NAME,
      },
    });

    const [stream] = await adminClient.createDataStream({
      parent: property.name,
      dataStream: {
        type: "WEB_DATA_STREAM",
        displayName: `${pageSlug} stream`,
        webStreamData: {
          defaultUri: `${process.env.APP_BASE_URL}/${pageSlug}`,
        },
      },
    });

    return {
      ga4PropertyId: property.name,
      ga4MeasurementId: stream.webStreamData?.measurementId || null,
      ga4StreamId: stream.name,
    };
  } catch (err) {
    console.error("[GA4 Admin] createGA4Property failed:", err.message);
    return null;
  }
}

module.exports = { createGA4Property };
