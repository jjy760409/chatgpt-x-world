import { useState, useEffect, useRef } from "react"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"

declare global {
    interface Window {
        paypal?: any
    }
}

interface PayPalCheckoutProps {
    planId: string
    planName: string
    amount: number
}

export default function PayPalCheckout({ planId, planName, amount }: PayPalCheckoutProps) {
    const paypalRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<"loading" | "ready" | "processing" | "success" | "error">("loading")
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        // Load PayPal SDK dynamically
        const existingScript = document.querySelector('script[src*="paypal.com/sdk"]')

        const initPayPal = () => {
            if (!window.paypal || !paypalRef.current) return

            setStatus("ready")

            window.paypal.Buttons({
                style: {
                    shape: "rect",
                    color: "blue",
                    layout: "vertical",
                    label: "pay",
                },

                createOrder: async () => {
                    try {
                        const res = await fetch("/api/create-paypal-order", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ planId, planName, amount }),
                        })
                        const data = await res.json()
                        if (!data.ok || !data.orderId) {
                            throw new Error(data.error || "Failed to create order")
                        }
                        return data.orderId
                    } catch (err: any) {
                        setErrorMsg(err.message || "Failed to create order")
                        setStatus("error")
                        throw err
                    }
                },

                onApprove: async (data: any) => {
                    setStatus("processing")
                    try {
                        const res = await fetch("/api/capture-paypal-order", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: data.orderID }),
                        })
                        const result = await res.json()
                        if (result.ok) {
                            setStatus("success")
                        } else {
                            throw new Error(result.error || "Payment capture failed")
                        }
                    } catch (err: any) {
                        setErrorMsg(err.message || "Payment failed")
                        setStatus("error")
                    }
                },

                onError: (err: any) => {
                    console.error("PayPal Error:", err)
                    setErrorMsg("PayPal encountered an error. Please try again.")
                    setStatus("error")
                },

                onCancel: () => {
                    setStatus("ready")
                },
            }).render(paypalRef.current)
        }

        if (existingScript && window.paypal) {
            initPayPal()
            return
        }

        // Dynamically inject PayPal script
        const clientId = (window as any).__PAYPAL_CLIENT_ID__ || "test"
        const script = document.createElement("script")
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`
        script.async = true
        script.onload = initPayPal
        script.onerror = () => {
            setErrorMsg("Failed to load PayPal SDK. Check your internet connection.")
            setStatus("error")
        }
        document.head.appendChild(script)

        return () => {
            // Cleanup not needed for PayPal SDK script
        }
    }, [planId, planName, amount])

    if (status === "success") {
        return (
            <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground mb-4">
                    Welcome to ANW {planName}. Your protection is now active.
                </p>
                <a
                    href="/"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
                >
                    Start Using ANW
                </a>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Payment Issue</h3>
                <p className="text-muted-foreground mb-4">{errorMsg}</p>
                <button
                    onClick={() => {
                        setStatus("loading")
                        setErrorMsg("")
                        window.location.reload()
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                    <span className="font-medium">{planName} Plan</span>
                    <span className="text-lg font-bold">${amount}/mo</span>
                </div>
            </div>

            {(status === "loading" || status === "processing") && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-muted-foreground">
                        {status === "loading" ? "Loading PayPal..." : "Processing payment..."}
                    </span>
                </div>
            )}

            <div ref={paypalRef} className={status === "loading" || status === "processing" ? "hidden" : ""} />

            <p className="text-xs text-muted-foreground text-center mt-4">
                Secure payment powered by PayPal. You can cancel your subscription anytime.
            </p>
        </div>
    )
}
