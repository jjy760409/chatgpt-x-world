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
    // ✅ 4) 사이트의 폼 목록 조회 (Netlify Forms)
    let submissions = [];
    try {
      const forms = await netlifyFetch(`/sites/${SITE_ID}/forms`, NETLIFY_ACCESS_TOKEN);
      const form = (forms || []).find((f) => f?.name === FORM_NAME);
      if (form) {
        submissions = await netlifyFetch(`/forms/${form.id}/submissions`, NETLIFY_ACCESS_TOKEN);
      }
    } catch (e) {
      console.warn("Netlify Forms fetch failed:", e.message);
    }

    // ✅ 5) Supabase 데이터 가져오기 (Dashboard Stats)
    const { createClient } = require('@supabase/supabase-js');
    const sbUrl = process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

    let dbLogs = [];
    let trafficData = [];
    let recentAlerts = [];
    let kpi = { totalScans: 0, threatsBlocked: 0, revenue: 1240, activeUsers: 42 };

    if (sbUrl && sbKey) {
      const supabase = createClient(sbUrl, sbKey);

      // Fetch last 24 hours logs
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('scan_logs')
        .select('*')
        .gte('created_at', yesterday)
        .order('created_at', { ascending: true })
        .limit(1000); // Limit for performance

      if (data) {
        dbLogs = data;
        kpi.totalScans = dbLogs.length;
        kpi.threatsBlocked = dbLogs.filter(l => l.result_level === 'BAD' || l.result_level === 'danger').length;

        // Aggregate Hourly Traffic
        const hours = {};
        // Initialize last 24h
        for (let i = 0; i < 24; i++) {
          const date = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
          const h = date.getHours();
          const key = `${h}:00`;
          hours[key] = { time: key, scans: 0, threats: 0 };
        }

        dbLogs.forEach(log => {
          const h = new Date(log.created_at).getHours();
          const key = `${h}:00`;
          if (hours[key]) {
            hours[key].scans++;
            if (log.result_level === 'BAD' || log.result_level === 'danger') hours[key].threats++;
          }
        });
        trafficData = Object.values(hours);

        // Recent Alerts
        recentAlerts = dbLogs
          .filter(l => l.result_level === 'BAD' || l.result_level === 'danger')
          .slice(-10)
          .reverse()
          .map(l => ({
            country: l.country === 'KR' ? "🇰🇷 KR" : "🇺🇸 US",
            type: l.result_category || "Scam",
            url: l.url,
            time: new Date(l.created_at).toLocaleTimeString()
          }));
      }
    }

    return json(200, {
      ok: true,
      submissions,
      stats: { trafficData, recentAlerts, kpi }
    });

  } catch (e) {
    return json(500, { ok: false, error: "API Error", detail: String(e?.message || e) });
  }
};
