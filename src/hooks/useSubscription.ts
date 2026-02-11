import { useState, useEffect } from "react"

export interface Subscription {
    email: string
    plan: "free" | "pro" | "enterprise"
    orderId: string
    expiresAt: number
    token: string
}

const STORAGE_KEY = "anw_subscription"

export function useSubscription() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Load from local storage on mount
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            if (data) {
                const parsed = JSON.parse(data)
                // Check expiry
                if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                    localStorage.removeItem(STORAGE_KEY)
                    setSubscription(null)
                } else {
                    setSubscription(parsed)
                }
            }
        } catch (e) {
            console.error("Failed to load subscription", e)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const saveSubscription = (token: string, plan: string, email: string, orderId: string) => {
        const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        const sub: Subscription = { token, plan: plan as any, email, orderId, expiresAt }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(sub))
        setSubscription(sub)

        // Dispatch event for other tabs/components
        window.dispatchEvent(new Event("storage"))
    }

    const removeSubscription = () => {
        localStorage.removeItem(STORAGE_KEY)
        setSubscription(null)
        window.dispatchEvent(new Event("storage"))
    }

    return {
        subscription,
        isLoading,
        isPro: subscription?.plan === "pro" || subscription?.plan === "enterprise",
        isEnterprise: subscription?.plan === "enterprise",
        saveSubscription,
        removeSubscription
    }
}
