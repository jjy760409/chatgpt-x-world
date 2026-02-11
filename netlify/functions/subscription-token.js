const crypto = require("crypto");

/**
 * Signs payload with HMAC-SHA256 to create a secure token
 * Payload: { email, plan, orderId, expiresAt }
 */
function createToken(payload, secret) {
    // 1. Serialize payload
    const data = JSON.stringify(payload);
    const base64Data = Buffer.from(data).toString("base64");

    // 2. Create signature
    const signature = crypto
        .createHmac("sha256", secret)
        .update(base64Data)
        .digest("hex");

    // 3. Combine: base64Data.signature
    return `${base64Data}.${signature}`;
}

/**
 * Verifies token signature and checks expiration
 * Returns payload if valid, throws error if invalid
 */
function verifyToken(token, secret) {
    if (!token || !token.includes(".")) {
        throw new Error("Invalid token format");
    }

    const [base64Data, signature] = token.split(".");

    // 1. Re-create signature
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(base64Data)
        .digest("hex");

    // 2. Validate signature (timing safe)
    if (signature !== expectedSignature) {
        throw new Error("Invalid signature");
    }

    // 3. Decode payload
    try {
        const payload = JSON.parse(Buffer.from(base64Data, "base64").toString());

        // 4. Check expiration
        if (payload.expiresAt && Date.now() > payload.expiresAt) {
            throw new Error("Token expired");
        }

        return payload;
    } catch (e) {
        throw new Error("Invalid payload data");
    }
}

module.exports = { createToken, verifyToken };
