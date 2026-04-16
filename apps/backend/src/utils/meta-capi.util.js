const https = require("https");
const crypto = require("crypto");

function hashSHA256(value) {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

async function sendCAPIEvent({
  pixelId,
  accessToken,
  eventName,
  email,
  pageUrl,
  clientIp,
  clientUserAgent,
}) {
  if (!pixelId || !accessToken) return;

  const payload = JSON.stringify({
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: pageUrl,
        user_data: {
          em: email ? [hashSHA256(email)] : undefined,
          client_ip_address: clientIp,
          client_user_agent: clientUserAgent,
        },
      },
    ],
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "graph.facebook.com",
        path: `/v18.0/${pixelId}/events?access_token=${accessToken}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.on("data", () => {});
        res.on("end", resolve);
      },
    );
    req.on("error", (e) => console.error("[CAPI error]", e.message));
    req.write(payload);
    req.end();
  });
}

module.exports = { sendCAPIEvent };
