// netlify/functions/admin-auth.js
const crypto = require("crypto");

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
  body: JSON.stringify(body),
});

function b64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signToken(payloadObj, secret) {
  const payload = b64url(JSON.stringify(payloadObj));
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${payload}.${sig}`;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Method not allowed" });

  const ADMIN_KEY = process.env.ANW_ADMIN_KEY || process.env.ADMIN_KEY;
  if (!ADMIN_KEY) return json(500, { ok: false, error: "Missing ANW_ADMIN_KEY in env" });

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}

  const key = (body.key || "").trim();
  if (!key) return json(400, { ok: false, error: "Key required" });

  // ✅ 타이밍 공격 방지용 비교
  const a = Buffer.from(key);
  const b = Buffer.from(String(ADMIN_KEY));
  const sameLen = a.length === b.length;
  const equal = sameLen && crypto.timingSafeEqual(a, b);

  if (!equal) return json(401, { ok: false, error: "Invalid key" });

  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12시간 토큰
  const token = signToken({ exp }, ADMIN_KEY);

  return json(200, { ok: true, token, exp });
};
