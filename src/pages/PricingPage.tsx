import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Zap, Shield, Globe, ArrowRight } from "lucide-react"
import SEO from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import PayPalCheckout from "@/components/PayPalCheckout"

const plans = [
    {
        id: "free",
        name: "Free",
        price: 0,
        period: "",
        description: "Basic protection for individuals",
        features: [
            "10 scans per day",
            "URL & phone check",
            "Community threat database",
            "Email support",
        ],
        cta: "Get Started",
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: 9.99,
        period: "/mo",
        description: "Advanced protection for professionals",
        features: [
            "Unlimited scans",
            "Real-time AI analysis",
            "Priority threat detection",
            "Bank account verification",
            "API access (1,000 calls/mo)",
            "Priority email support",
        ],
        cta: "Upgrade to Pro",
        popular: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 29.99,
        period: "/mo",
        description: "Complete solution for teams & businesses",
        features: [
            "Everything in Pro",
            "Unlimited API access",
            "Team management (up to 50)",
            "Custom threat rules",
            "Webhook integrations",
            "Dedicated account manager",
            "SLA guarantee (99.9%)",
        ],
        cta: "Contact Sales",
        popular: false,
    },
]

export default function PricingPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [showCheckout, setShowCheckout] = useState(false)

    const handleSelectPlan = (planId: string) => {
        if (planId === "free") {
            window.location.href = "/"
            return
        }
        setSelectedPlan(planId)
        setShowCheckout(true)
    }

    const selectedPlanData = plans.find((p) => p.id === selectedPlan)

    if (showCheckout && selectedPlanData && selectedPlanData.price > 0) {
        return (
            <div className="container max-w-lg py-16 px-4">
                <SEO title={`Subscribe to ${selectedPlanData.name} - ANW`} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <button
                        onClick={() => setShowCheckout(false)}
                        className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
                    >
                        ← Back to plans
                    </button>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Subscribe to {selectedPlanData.name}
                            </CardTitle>
                            <CardDescription>
                                ${selectedPlanData.price}{selectedPlanData.period} — Cancel anytime
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PayPalCheckout
                                planId={selectedPlanData.id}
                                planName={selectedPlanData.name}
                                amount={selectedPlanData.price}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="container py-16 px-4">
            <SEO title="Pricing - ANW Anti-Scam Protection" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-primary/10 text-primary mb-4">
                    <Globe className="h-3 w-3 mr-1" /> Available Worldwide
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Choose the protection level that fits your needs. Upgrade or cancel anytime.
                </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card
                            className={`relative h-full flex flex-col ${plan.popular
                                    ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                                    : "border-border"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                                        <Zap className="h-3 w-3" /> Most Popular
                                    </span>
                                </div>
                            )}

                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col">
                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">
                                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                                    </span>
                                    {plan.period && (
                                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Button
                                    className="w-full"
                                    variant={plan.popular ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => handleSelectPlan(plan.id)}
                                >
                                    {plan.cta}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Trust badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-16 text-center"
            >
                <div className="flex items-center justify-center gap-8 text-muted-foreground">
                    <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4" />
                        <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4" />
                        <span>Cancel anytime</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4" />
                        <span>Available in 190+ countries</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
