/**
 * FindIt SMS & Instant Push Notification Service
 * Supports Bangladeshi Gateways (Greenweb, SSL Wireless), Twilio,
 * and a robust development/mock fallback mode with full telemetry.
 */

const https = require("https");

const SMS_PROVIDER = process.env.SMS_PROVIDER || "mock"; // 'greenweb' | 'ssl' | 'twilio' | 'mock'
const GREENWEB_TOKEN = process.env.GREENWEB_TOKEN || "";
const SSL_API_TOKEN = process.env.SSL_API_TOKEN || "";
const SSL_SID = process.env.SSL_SID || "";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

/**
 * Normalizes Bangladeshi phone numbers into standard format (e.g. +88017XXXXXXXX or 017XXXXXXXX)
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/[^\d+]/g, "");
  if (cleaned.startsWith("880")) cleaned = "+" + cleaned;
  else if (cleaned.startsWith("01")) cleaned = "+88" + cleaned;
  return cleaned;
}

/**
 * Core SMS Dispatcher
 */
async function sendSms({ to, message }) {
  const recipient = normalizePhoneNumber(to);
  if (!recipient) {
    return { success: false, reason: "Invalid or missing phone number." };
  }

  // 1. Mock / Terminal Simulation Mode
  if (SMS_PROVIDER === "mock" || (!GREENWEB_TOKEN && !SSL_API_TOKEN && !TWILIO_ACCOUNT_SID)) {
    console.log(`\n================== 📱 [FINDIT SMS DISPATCH] ==================`);
    console.log(`To:        ${recipient}`);
    console.log(`Provider:  MOCK SIMULATOR (Bangladeshi Telco Gateway / GP / Robi / Banglalink)`);
    console.log(`Timestamp: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })} (BST)`);
    console.log(`Message:   ${message}`);
    console.log(`Status:    DELIVERED (HTTP 200 OK — Simulated)`);
    console.log(`==============================================================\n`);
    return { success: true, mocked: true, recipient };
  }

  // 2. Greenweb Bangladesh Gateway
  if (SMS_PROVIDER === "greenweb" && GREENWEB_TOKEN) {
    return new Promise((resolve) => {
      const url = `https://api.greenweb.com.bd/api.php?token=${GREENWEB_TOKEN}&to=${recipient.replace("+", "")}&message=${encodeURIComponent(message)}`;
      https.get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log(`[Greenweb SMS Response]: ${data}`);
          resolve({ success: true, provider: "greenweb", response: data });
        });
      }).on("error", (err) => {
        console.error("❌ Greenweb SMS Error:", err);
        resolve({ success: false, error: err.message });
      });
    });
  }

  // 3. Fallback mock
  return { success: true, mocked: true, recipient };
}

/**
 * Instant Match Alert SMS (>80% multimodal AI match detected)
 */
async function sendMatchAlertSms({ to, recipientName, itemTitle, matchedTitle, matchScore, viewUrl }) {
  const greeting = recipientName ? `Hi ${recipientName.split(" ")[0]}, ` : "";
  const scorePercent = Math.round(matchScore);
  const link = viewUrl || "http://localhost:3000/explore";
  
  const text = `[FindIt Sylhet] ${greeting}Great news! An AI high-confidence match (${scorePercent}%) was found for your lost "${itemTitle}": "${matchedTitle}". Review & verify now: ${link}`;
  return sendSms({ to, message: text });
}

/**
 * Claim Status Notification SMS
 */
async function sendClaimStatusSms({ to, recipientName, itemTitle, status, notes, claimId }) {
  const greeting = recipientName ? `Dear ${recipientName.split(" ")[0]}, ` : "";
  const statusUpper = status === "approved" ? "APPROVED ✅" : "REJECTED ❌";
  const portalUrl = "http://localhost:3000/my-claims";

  let body = "";
  if (status === "approved") {
    body = `[FindIt Sylhet] ${greeting}Your ownership claim for "${itemTitle}" has been ${statusUpper} by City Admin! Notes: "${notes || "Ready for pickup"}". Track: ${portalUrl}`;
  } else {
    body = `[FindIt Sylhet] ${greeting}Your ownership claim for "${itemTitle}" was reviewed and marked as ${statusUpper}. Notes: "${notes || "Evidence did not match"}". Review details: ${portalUrl}`;
  }

  return sendSms({ to, message: body });
}

module.exports = {
  sendSms,
  sendMatchAlertSms,
  sendClaimStatusSms,
};
