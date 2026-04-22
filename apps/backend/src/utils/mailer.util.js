const nodemailer = require("nodemailer");

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587", 10),
    secure: SMTP_PORT === "465",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return _transporter;
}

async function sendLeadNotification({
  adminEmail,
  pageTitle,
  pageSlug,
  leadEmail,
  leadName,
  country,
  device,
}) {
  const transporter = getTransporter();
  if (!transporter) return; // SMTP not configured — skip silently

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const pageUrl = `${process.env.APP_BASE_URL || ""}/p/${pageSlug}`;

  await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `New Fan Lead: ${leadEmail}`,
    html: `
      <h2 style="margin:0 0 12px">New Fan Lead 🎉</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Email</td><td><strong>${leadEmail}</strong></td></tr>
        ${leadName ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Name</td><td>${leadName}</td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Page</td><td><a href="${pageUrl}">${pageTitle}</a></td></tr>
        ${country ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Country</td><td>${country}</td></tr>` : ""}
        ${device ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Device</td><td>${device}</td></tr>` : ""}
      </table>
    `,
  });
}

module.exports = { sendLeadNotification };
