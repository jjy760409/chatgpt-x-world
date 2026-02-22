// netlify/functions/public-threats.js
const { createClient } = require('@supabase/supabase-js');

const json = (statusCode, body) => ({
    statusCode,
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
});

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

    const sbUrl = process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!sbUrl || !sbKey) {
        return json(500, { ok: false, error: "Database configuration missing" });
    }

    try {
        const supabase = createClient(sbUrl, sbKey);

        // Fetch the 10 most recent blocked threats, anonymized
        const { data, error } = await supabase
            .from('scan_logs')
            .select('country, result_category, created_at')
            .in('result_level', ['BAD', 'danger', 'WARN'])
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        // Process data for the ticker
        const threats = data.map(log => {
            const countryEmoji = log.country === 'KR' ? '🇰🇷' : (log.country === 'US' ? '🇺🇸' : '🌐');
            const type = log.result_category || 'Scam';
            const timeDiff = Math.floor((Date.now() - new Date(log.created_at).getTime()) / 60000); // minutes
            let timeAgo = timeDiff < 1 ? 'Just now' : `${timeDiff}m ago`;
            if (timeDiff > 60) timeAgo = `${Math.floor(timeDiff / 60)}h ago`;

            return {
                text: `${countryEmoji} Blocked ${type} threat`,
                time: timeAgo
            };
        });

        // Add some dynamic feel if empty
        if (threats.length === 0) {
            threats.push({ text: "🟢 AI Engine Active - Scanning global network...", time: "Live" });
        }

        return json(200, { ok: true, threats });

    } catch (e) {
        console.error("public-threats error:", e);
        return json(500, { ok: false, error: "Failed to fetch threat data" });
    }
};
