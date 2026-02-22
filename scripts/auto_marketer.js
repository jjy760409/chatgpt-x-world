const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Initialize from env or command line
const SB_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || 'YOUR_GEMINI_KEY';

if (!SB_URL || !SB_KEY || !GEMINI_KEY || SB_URL === 'YOUR_SUPABASE_URL') {
    console.error("Missing necessary environment variables. Export VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and GEMINI_API_KEY.");
    process.exit(1);
}

const supabase = createClient(SB_URL, SB_KEY);

async function generateMarketingPost(stats) {
    const prompt = `
당신은 최고의 보안 마케터이자, 안티 스캠 웹(ANW)의 공식 블로거입니다.
오늘 하루 동안 전 세계에서 ANW 시스템이 탐지하고 막아낸 피싱/스미싱 데이터 통계를 알려드리겠습니다.
이 데이터를 바탕으로 네이버 블로그, 미디엄, 스팀잇 등에 올릴 수 있는 '대박 꿀팁 + 경각심 조성' 마케팅 포스팅을 마크다운(Markdown)으로 1편 작성해주세요.

## 오늘자 ANW 차단 통계:
- 총 탐지/스캔 시도: ${stats.total}건
- 실제 사기(BAD) 판별 건수: ${stats.bad}건
- 위험/주의(WARN) 판별 건수: ${stats.warn}건
- 주요 공격 국가: ${stats.countries.join(", ")}
- 발견된 주요 위협 내용 요약:
${stats.samples.map(s => `  * [${s.country}] ${s.category}: ${s.url.substring(0, 50)}...`).join("\n")}

## 글 작성 가이드라인 (SEO 100% 최적화):
1. **자극적이고 클릭하고 싶은 제목**: (예: "방금 소름 돋았습니다... 오늘 하루만 한국에서 뚫린 피싱 문자의 정체")
2. **공감대 형성 (Intro)**: 요즘 이런 사기가 유행이라는 점을 일상적인 톤으로 먼저 다가갈 것.
3. **충격적인 데이터 공개**: 제공된 통계 수치를 강조(Bold)하여 심각성을 알릴 것.
4. **문제 해결책 제시**: "저희 ANW가 이걸 실시간으로 막아내고 있습니다" 라고 자연스럽게 홍보.
5. **독자 행동 유도 (Call to Action)**: "지금 당장 의심되는 링크나 이미지를 anw.kr 에 올려서 3초 만에 검사하세요."
6. **마지막 태그 추가**: #스미싱 #보안가이드 #ANW 등

자, 이제 SEO와 해시태그까지 완벽하게 갖춘 진짜 마케팅용 포스팅 원문을 마크다운으로 작성하세요.
    `;

    const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
        }
    });

    return new Promise((resolve, reject) => {
        const req = https.request(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            },
            (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsed = JSON.parse(data);
                            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                            resolve(text || "No content generated");
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error(`API Error: ${res.statusCode} ${data}`));
                    }
                });
            }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function startAutoMarketer() {
    console.log("🚀 [Auto Marketer] Starting daily data fetch...");

    // 1. Fetch yesterday's data from DB
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
        .from('scan_logs')
        .select('country, result_level, result_category, url')
        .gte('created_at', yesterday);

    if (error) {
        console.error("Failed to fetch Supabase DB", error);
        process.exit(1);
    }

    if (!data || data.length === 0) {
        console.log("No scan data for yesterday. Skip marketing post.");
        return;
    }

    // 2. Synthesize stats
    let stats = {
        total: data.length,
        bad: data.filter(d => d.result_level === 'BAD').length,
        warn: data.filter(d => d.result_level === 'WARN').length,
        countries: [...new Set(data.filter(d => d.country).map(d => d.country))],
        samples: data.filter(d => d.result_level === 'BAD').slice(0, 5)
    };

    console.log(`📊 [Auto Marketer] Analyzed ${stats.total} logs. Generating content...`);

    // 3. Ask Gemini for a marketing post
    try {
        const postMarkdown = await generateMarketingPost(stats);

        // 4. Save to repository (Daily log)
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `marketing_post_${dateStr}.md`;
        const filepath = path.join(__dirname, '..', '_legacy', filename); // saving in _legacy or _marketing

        // Ensure folder exists (fallback to root if needed)
        const targetDir = path.join(__dirname, '..', 'marketing_auto');
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }

        fs.writeFileSync(path.join(targetDir, filename), postMarkdown, 'utf8');
        console.log(`✅ [Auto Marketer] Successfully generated marketing post: ${filename}`);

    } catch (e) {
        console.error("Markdown generation failed: ", e);
    }
}

startAutoMarketer();
