export interface UserMetrics {
    totalScans: number;
    threatsBlocked: number;
    estimatedMoneySaved: number;
}

const METRICS_KEY = 'anw_user_metrics';

export function getMetrics(): UserMetrics {
    const data = localStorage.getItem(METRICS_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch {
            // Ignore parse errors
        }
    }
    return {
        totalScans: 0,
        threatsBlocked: 0,
        estimatedMoneySaved: 0
    };
}

export function recordScan(isThreat: boolean) {
    const current = getMetrics();
    current.totalScans += 1;
    if (isThreat) {
        current.threatsBlocked += 1;
        // Estimate around ₩500,000 saved per blocked threat on average
        current.estimatedMoneySaved += 500000;
    }
    localStorage.setItem(METRICS_KEY, JSON.stringify(current));
}
