/**
 * Simple Device Fingerprinting Utility
 * Generates a persistent device ID based on browser characteristics.
 * Note: This is a client-side approximation. For banking-grade security, use a paid service like FingerprintJS Pro.
 */

export async function getDeviceId(): Promise<string> {
    // 1. Try to get existing ID from localStorage
    const storedId = localStorage.getItem('anw_device_id');
    if (storedId) return storedId;

    // 2. Generate new ID based on browser characteristics
    const fingerprint = await generateFingerprint();
    const newId = await hashString(fingerprint);

    // 3. Store and return
    localStorage.setItem('anw_device_id', newId);
    return newId;
}

async function generateFingerprint(): Promise<string> {
    const components = [
        navigator.userAgent,
        navigator.language,
        (navigator as any).deviceMemory || 'unknown',
        (navigator as any).hardwareConcurrency || 'unknown',
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        !!(window as any).sessionStorage,
        !!(window as any).localStorage,
        !!(window as any).indexedDB,
        getCanvasFingerprint()
    ];

    return components.join('||');
}

function getCanvasFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'unknown';

        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('ANW_FINGERPRINT_123', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('ANW_FINGERPRINT_123', 4, 17);

        return canvas.toDataURL();
    } catch (e) {
        return 'error';
    }
}

async function hashString(str: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
