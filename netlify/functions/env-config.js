// netlify/functions/env-config.js
// Exposes safe, public environment variables to the frontend
const json = (statusCode, body) => ({
    statusCode,
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
    },
    body: JSON.stringify(body),
});

exports.handler = async () => {
    return json(200, {
        paypalClientId: process.env.PAYPAL_CLIENT_ID || "test",
        paypalMode: process.env.PAYPAL_MODE || "sandbox",
    });
};
