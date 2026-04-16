const https = require("https");

async function addToKlaviyoList({
  apiKey,
  listId,
  email,
  name,
  source,
  platform,
}) {
  if (!apiKey || !listId || !email) return;

  const payload = JSON.stringify({
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email,
                first_name: name || "",
                properties: {
                  source: source || "direct",
                  platform: platform || "",
                },
              },
            },
          ],
        },
      },
      relationships: {
        list: { data: { type: "list", id: listId } },
      },
    },
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "a.klaviyo.com",
        path: "/api/profile-subscription-bulk-create-jobs/",
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          revision: "2024-02-15",
        },
      },
      (res) => {
        res.on("data", () => {});
        res.on("end", resolve);
      },
    );
    req.on("error", (e) => console.error("[Klaviyo error]", e.message));
    req.write(payload);
    req.end();
  });
}

module.exports = { addToKlaviyoList };
