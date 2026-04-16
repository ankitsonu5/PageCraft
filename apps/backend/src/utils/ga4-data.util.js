const { dataClient } = require("../config/ga4.config");

async function fetchAnalytics({ propertyId, startDate, endDate }) {
  const dateRanges = [{ startDate, endDate }];

  const [summary, timeSeries, geo, devices, gender, sources] =
    await Promise.all([
      dataClient.runReport({
        property: propertyId,
        dateRanges,
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }),
      dataClient.runReport({
        property: propertyId,
        dateRanges,
        metrics: [{ name: "sessions" }],
        dimensions: [{ name: "date" }],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      }),
      dataClient.runReport({
        property: propertyId,
        dateRanges,
        metrics: [{ name: "sessions" }],
        dimensions: [{ name: "city" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      dataClient.runReport({
        property: propertyId,
        dateRanges,
        metrics: [{ name: "sessions" }],
        dimensions: [{ name: "deviceCategory" }],
      }),
      dataClient.runReport({
        property: propertyId,
        dateRanges,
        metrics: [{ name: "totalUsers" }],
        dimensions: [{ name: "userGender" }],
      }),
      dataClient.runReport({
        property: propertyId,
        dateRanges,
        metrics: [{ name: "sessions" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
      }),
    ]);

  return {
    summary: summary[0].rows?.[0]?.metricValues || [],
    timeSeries: timeSeries[0].rows || [],
    geo: geo[0].rows || [],
    devices: devices[0].rows || [],
    gender: gender[0].rows || [],
    sources: sources[0].rows || [],
  };
}

module.exports = { fetchAnalytics };
