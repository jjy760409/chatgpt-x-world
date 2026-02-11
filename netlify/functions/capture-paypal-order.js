// netlify/functions/capture-paypal-order.js
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

async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    const baseUrl = process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

    const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || "Failed to get PayPal token");

    return { accessToken: data.access_token, baseUrl };
}

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Method not allowed" });

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
        return json(500, { ok: false, error: "PayPal credentials not configured" });
    }

    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch { }

    const { orderId } = body;
    if (!orderId) {
        return json(400, { ok: false, error: "orderId required" });
    }

    try {
        const { accessToken, baseUrl } = await getPayPalAccessToken();

        const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const captureData = await captureRes.json();

        if (!captureRes.ok) {
            return json(500, {
                ok: false,
                error: "PayPal capture failed",
                detail: captureData.message || JSON.stringify(captureData),
            });
        }

        // Extract payment details
        const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
        const payerEmail = captureData.payer?.email_address;
        const amountValue = capture?.amount?.value;

        // --- Subscription Token Generation ---
        const { createToken } = require("./subscription-token");
        // In production, use process.env.SUBSCRIPTION_SECRET
        const secret = process.env.SUBSCRIPTION_SECRET || "anw-secret-key-123";

        // Determine plan based on amount (Simple logic for demo)
        // Free: 0, Pro: 9.99, Enterprise: 29.99
        let plan = "pro";
        if (amountValue >= 29) plan = "enterprise";

        const tokenPayload = {
            email: payerEmail,
            plan: plan,
            orderId: capture?.id,
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days valid
        };

        const subscriptionToken = createToken(tokenPayload, secret);
        // -------------------------------------

        return json(200, {
            ok: true,
            status: captureData.status,
            transactionId: capture?.id || null,
            payerEmail: payerEmail || null,
            amount: amountValue || null,
            currency: capture?.amount?.currency_code || null,
            subscriptionToken: subscriptionToken, // Send token to frontend
            plan: plan
        });
    } catch (e) {
        console.error("Capture Error:", e);
        return json(500, { ok: false, error: "Server error", detail: String(e?.message || e) });
    }
};
