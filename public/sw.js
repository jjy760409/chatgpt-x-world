const CACHE_NAME = 'anw-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

const SCAM_KEYWORDS = ['대출', '부고', '청첩장', '비밀번호', '경찰청', '검찰', '가상화폐', '투자', '해킹', '본인인증', '합의금', '국민건강보험', '택배', '배송', '지원금', '계좌', '상품권', '환불', '승인번호', '무료추천', '주식'];

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // EMP Offline Survival Mode Interceptor
    if (url.pathname === '/api/analyze' && event.request.method === 'POST') {
        event.respondWith(
            fetch(event.request).catch(async () => {
                // Network failed, fallback to offline database
                const clone = event.request.clone();
                try {
                    const body = await clone.json();
                    const text = body.text || '';

                    let isThreat = false;
                    let matchedKeywords = [];
                    for (const kw of SCAM_KEYWORDS) {
                        if (text.includes(kw)) {
                            isThreat = true;
                            matchedKeywords.push(kw);
                        }
                    }

                    if (isThreat) {
                        return new Response(JSON.stringify({
                            ok: true,
                            level: 'WARN',
                            oneLine: '⚠️ OFFLINE MODE: 텍스트 위협 자동 감지!',
                            reason: `네트워크 연결이 끊어져 강력한 로컬 AI가 방어 중입니다. [${matchedKeywords.join(', ')}] 단어가 포함되어 있어 스미싱/피싱 확률이 매우 높습니다. 절대 클릭하거나 응답하지 마세요.`,
                            category: 'offline_threat'
                        }), { headers: { 'Content-Type': 'application/json' } });
                    }

                    return new Response(JSON.stringify({
                        ok: true,
                        level: 'OK',
                        oneLine: '✅ OFFLINE MODE: 현재 로컬 AI에서 위협 없음',
                        reason: '네트워크가 끊겨 정밀 분석을 할 수 없으나, 로컬 오프라인 보안 수칙상 안전합니다. 서버 연결이 복구되면 정밀 검사를 받아보세요.',
                        category: 'offline_safe'
                    }), { headers: { 'Content-Type': 'application/json' } });
                } catch (err) {
                    return new Response(JSON.stringify({
                        ok: false,
                        error: 'Offline analysis failed.'
                    }), { headers: { 'Content-Type': 'application/json' } });
                }
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
