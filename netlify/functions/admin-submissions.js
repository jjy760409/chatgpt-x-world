// netlify/functions/admin-submissions.js
const crypto = require("crypto");

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  },
  body: JSON.stringify(body),
});

function timingSafeEq(a, b) {
  const ab = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verifyToken(token, secret) {
  // token = payload.sig
  if (!token || typeof token !== "string") return { ok: false, error: "Bad token" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, error: "Bad token" };

  const [payloadB64, sig] = parts;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (!timingSafeEq(sig, expected)) return { ok: false, error: "Bad token" };

  // payload decode
  let payloadStr = "";
  try {
    payloadStr = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch {
    return { ok: false, error: "Bad token" };
  }

  let payload = {};
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return { ok: false, error: "Bad token" };
  }

  if (!payload.exp || Date.now() > payload.exp) return { ok: false, error: "Token expired" };

  return { ok: true, payload };
}

async function netlifyFetch(path, accessToken) {
  const res = await fetch(`https://api.netlify.com/api/v1${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const txt = await res.text();
  let data = null;
  try { data = JSON.parse(txt); } catch { data = txt; }
  if (!res.ok) throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

  // ✅ 핑 테스트
  const qs = event.queryStringParameters || {};
  if (qs.ping === "1") return json(200, { ok: true, pong: true });

  // ✅ 1) 관리자 키(환경변수) 준비
  const ADMIN_KEY = process.env.ANW_ADMIN_KEY || process.env.ADMIN_KEY;
  if (!ADMIN_KEY) return json(500, { ok: false, error: "Missing ADMIN_KEY/ANW_ADMIN_KEY in env" });

  // ✅ 2) 토큰 받기 (Authorization: Bearer xxxx)
  const auth = event.headers?.authorization || event.headers?.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  const v = verifyToken(token, ADMIN_KEY);
  if (!v.ok) return json(401, { ok: false, error: v.error });

  // ✅ 3) Netlify API 토큰/사이트ID 필요
  const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID; // (또는 SITE_ID)
  const FORM_NAME = process.env.FORM_NAME || "contact";

  if (!NETLIFY_ACCESS_TOKEN) return json(500, { ok: false, error: "Missing NETLIFY_ACCESS_TOKEN in env" });
  if (!SITE_ID) return json(500, { ok: false, error: "Missing NETLIFY_SITE_ID in env" });

  try {
    // ✅ 4) 사이트의 폼 목록 조회 → FORM_NAME 찾기
    const forms = await netlifyFetch(`/sites/${SITE_ID}/forms`, NETLIFY_ACCESS_TOKEN);
    const form = (forms || []).find((f) => f?.name === FORM_NAME);

    if (!form) {
      return json(404, {
        ok: false,
        error: "FORM_NAME not found on this site",
        hint: "Netlify > Forms 에 폼이 만들어졌는지 확인(도메인에서 1회 이상 제출 필요)",
        available_forms: (forms || []).map((f) => f?.name).filter(Boolean),
      });
    }

    // ✅ 5) 제출 데이터(submissions) 가져오기
    const submissions = await netlifyFetch(`/forms/${form.id}/submissions`, NETLIFY_ACCESS_TOKEN);

    return json(200, { ok: true, form: { id: form.id, name: form.name }, submissions });
  } catch (e) {
    return json(500, { ok: false, error: "Netlify API error", detail: String(e?.message || e) });
  }
};
