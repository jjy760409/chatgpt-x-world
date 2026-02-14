// Simple in-memory rate limiter for demo purposes
// In production, use Redis or a database

const usageStore = new Map();

// Reset usage every 24 hours (simplified)
setInterval(() => {
    usageStore.clear();
}, 24 * 60 * 60 * 1000);

/**
 * Checks if the identifier (IP or DeviceID) has exceeded the limit
 * @param {string} identifier - User IP or Device ID
 * @param {number} limit - Max allowed requests
 * @param {string} type - "ip" or "device"
 * @returns {boolean} - True if allowed, False if limit exceeded
 */
function checkRateLimit(identifier, limit = 10, type = "ip") {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `rate_limit:${type}:${identifier}:${today}`;

    const currentUsage = usageStore.get(key) || 0;

    if (currentUsage >= limit) {
        return { allowed: false, remaining: 0 };
    }

    usageStore.set(key, currentUsage + 1);
    return { allowed: true, remaining: limit - (currentUsage + 1) };
}

module.exports = { checkRateLimit };
