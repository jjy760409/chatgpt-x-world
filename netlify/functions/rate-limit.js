// Simple in-memory rate limiter for demo purposes
// In production, use Redis or a database

const usageStore = new Map();

// Reset usage every 24 hours (simplified)
setInterval(() => {
    usageStore.clear();
}, 24 * 60 * 60 * 1000);

/**
 * Checks if the IP has exceeded the limit
 * @param {string} ip - User IP address
 * @param {number} limit - Max allowed requests
 * @returns {boolean} - True if allowed, False if limit exceeded
 */
function checkRateLimit(ip, limit = 10) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `${ip}:${today}`;

    const currentUsage = usageStore.get(key) || 0;

    if (currentUsage >= limit) {
        return { allowed: false, remaining: 0 };
    }

    usageStore.set(key, currentUsage + 1);
    return { allowed: true, remaining: limit - (currentUsage + 1) };
}

module.exports = { checkRateLimit };
