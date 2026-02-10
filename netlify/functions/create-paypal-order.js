// netlify/functions/create-paypal-order.js
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

    const { planId, planName, amount } = body;
    if (!planId || !amount) {
        return json(400, { ok: false, error: "planId and amount required" });
    }

    try {
        const { accessToken, baseUrl } = await getPayPalAccessToken();

        const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        reference_id: planId,
                        description: `ANW ${planName} Plan - Monthly Subscription`,
                        amount: {
                            currency_code: "USD",
                            value: String(amount),
                        },
                    },
                ],
                application_context: {
                    brand_name: "ANW Anti-Scam Web",
                    landing_page: "NO_PREFERENCE",
                    user_action: "PAY_NOW",
                    return_url: "https://anw.kr/thanks",
                    cancel_url: "https://anw.kr/pricing",
                },
            }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok) {
            return json(500, {
                ok: false,
                error: "PayPal order creation failed",
                detail: orderData.message || JSON.stringify(orderData),
            });
        }

        return json(200, { ok: true, orderId: orderData.id });
    } catch (e) {
        return json(500, { ok: false, error: "Server error", detail: String(e?.message || e) });
    }
};
