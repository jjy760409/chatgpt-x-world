// netlify/functions/analyze.js
// 피싱/스미싱 탐지 AI 분석 함수 — Google Gemini API 연동

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Method not allowed" });

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch { }

  const { text } = body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return json(400, { ok: false, error: "text field is required" });
  }

  // --- Subscription Verification ---
  const { verifyToken } = require("./subscription-token");
  const secret = process.env.SUBSCRIPTION_SECRET || "anw-secret-key-123";
  let isPro = false;

  const authHeader = event.headers["authorization"] || event.headers["Authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = verifyToken(token, secret);
      isPro = true; // Token is valid -> Pro User
      console.log(`[Analyze] Verified Pro User: ${payload.email} (${payload.plan})`);
    } catch (e) {
      console.warn("[Analyze] Invalid token:", e.message);
    }
  }

  // TODO: Add rate limiting for non-pro users here if needed
  // For now, we trust the frontend state or just log it
  // ---------------------------------

  const API_KEY = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

  // ✅ API 키가 없으면 규칙 기반 로컬 분석으로 폴백
  if (!API_KEY) {
    const result = localAnalyze(text.trim());
    return json(200, { ok: true, source: "local", ...result });
  }

  // ✅ Google Gemini API 호출
  try {
    const prompt = `너는 피싱/스미싱/사기 탐지 전문가야.
사용자가 입력한 URL, 전화번호, 계좌번호, 또는 메시지를 분석해.
결과를 반드시 아래 JSON 형식으로만 출력해. JSON 외 다른 텍스트는 절대 포함하지 마.

{
  "level": "OK" | "WARN" | "BAD",
  "oneLine": "초등학생도 이해하는 한 줄 요약",
  "reason": "왜 그런지 쉬운 말로 1~2문장"
}

규칙:
- 링크 클릭 유도, 앱 설치(APK) 유도, 인증번호/OTP/계좌/송금 유도, 긴급 공포 조장, 기관 사칭이면 위험도를 올려라.
- 잘 알려진 공식 사이트(google.com, naver.com 등)는 안전.
- 단축 URL(bit.ly, tinyurl.com 등)은 주의.
- 애매하면 WARN.
- 무조건 짧고 쉬운 한국어 문장.

분석 대상:
"""${text.trim()}"""`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.text();
      console.error("Gemini API error:", errData);
      // 폴백: 로컬 분석
      const result = localAnalyze(text.trim());
      return json(200, { ok: true, source: "local-fallback", ...result });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // JSON 파싱 시도
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return json(200, {
        ok: true,
        source: "gemini",
        level: parsed.level || "WARN",
        oneLine: parsed.oneLine || "분석 결과를 확인하세요.",
        reason: parsed.reason || "",
      });
    }

    // JSON 파싱 실패 → 폴백
    const result = localAnalyze(text.trim());
    return json(200, { ok: true, source: "local-fallback", ...result });

  } catch (e) {
    console.error("analyze error:", e);
    const result = localAnalyze(text.trim());
    return json(200, { ok: true, source: "local-fallback", ...result });
  }
};

// ✅ 로컬 규칙 기반 분석 (AI 없이도 기본 검사 가능)
function localAnalyze(text) {
  const lower = text.toLowerCase();

  // 위험 키워드
  const dangerKeywords = [
    "계좌이체", "송금", "인증번호", "otp", "긴급", "당장",
    "검찰", "경찰", "국세청", "은행", "대출", "당첨",
    "apk", ".exe", "설치하세요", "다운로드",
    "blocked", "suspended", "verify your account", "confirm your identity",
    "urgent action required", "your account will be closed",
  ];

  // 주의 키워드
  const warnKeywords = [
    "bit.ly", "tinyurl", "t.co", "goo.gl", "shorturl",
    "클릭", "확인하세요", "바로가기", "무료", "혜택",
    "click here", "free offer", "limited time",
  ];

  // 안전한 도메인
  const safeDomains = [
    "google.com", "naver.com", "daum.net", "kakao.com",
    "youtube.com", "github.com", "microsoft.com", "apple.com",
    "amazon.com", "facebook.com", "instagram.com",
  ];

  // 안전한 도메인 체크
  for (const domain of safeDomains) {
    if (lower.includes(domain)) {
      return {
        level: "OK",
        oneLine: "잘 알려진 안전한 사이트입니다.",
        reason: `${domain}은(는) 공식 사이트로 확인되었습니다.`,
      };
    }
  }

  // 위험 체크
  for (const kw of dangerKeywords) {
    if (lower.includes(kw)) {
      return {
        level: "BAD",
        oneLine: "⚠️ 사기/피싱 가능성이 높습니다!",
        reason: `"${kw}" 관련 위험 패턴이 감지되었습니다. 절대 개인 정보를 입력하지 마세요.`,
      };
    }
  }

  // 주의 체크
  for (const kw of warnKeywords) {
    if (lower.includes(kw)) {
      return {
        level: "WARN",
        oneLine: "주의가 필요합니다.",
        reason: `"${kw}" 관련 패턴이 발견되었습니다. 출처를 한 번 더 확인하세요.`,
      };
    }
  }

  // 기본: 안전
  return {
    level: "OK",
    oneLine: "현재까지 위험 요소가 감지되지 않았습니다.",
    reason: "알려진 위험 패턴과 일치하지 않습니다. 그래도 주의해서 사용하세요.",
  };
}
