import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Search, Lock, AlertTriangle, CheckCircle } from "lucide-react"
import SEO from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useSubscription } from "@/hooks/useSubscription"
import { LimitReachedModal } from "@/components/LimitReachedModal"
import { ReportAction } from "@/components/ReportAction"
import { getDeviceId } from "@/lib/fingerprint"
import { useTranslation } from "react-i18next"

export default function LandingPage() {
    const { t } = useTranslation();
    const [url, setUrl] = useState("")
    const [isChecking, setIsChecking] = useState(false)
    const [result, setResult] = useState<null | { level: string; oneLine: string; reason: string; category?: string }>(null)
    const [showLimitModal, setShowLimitModal] = useState(false)
    const { subscription } = useSubscription()
    const [deviceId, setDeviceId] = useState("")

    useEffect(() => {
        getDeviceId().then(setDeviceId)
    }, [])

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url.trim()) return
        setIsChecking(true)
        setResult(null)

        const headers: HeadersInit = { "Content-Type": "application/json" }
        if (subscription?.token) {
            headers["Authorization"] = `Bearer ${subscription.token}`
        }
        if (deviceId) {
            headers["x-device-id"] = deviceId
        }

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers,
                body: JSON.stringify({ text: url.trim() }),
            })
            const data = await res.json()

            // Handle Rate Limit Upgrade Trigger
            if (data.upgrade) {
                setShowLimitModal(true)
                return
            }

            if (data.ok) {
                setResult({
                    level: data.level,
                    oneLine: data.oneLine,
                    reason: data.reason,
                    category: data.category
                })
            } else {
                setResult({ level: "WARN", oneLine: "분석 중 오류가 발생했습니다.", reason: data.error || "" })
            }
        } catch {
            setResult({ level: "WARN", oneLine: "서버에 연결할 수 없습니다.", reason: "잠시 후 다시 시도해 주세요." })
        } finally {
            setIsChecking(false)
        }
    }

    // Contact Form State
    const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormState("submitting")

        const formData = new FormData(e.currentTarget)
        // Add form-name for Netlify
        formData.append("form-name", "contact")

        try {
            const res = await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData as any).toString(),
            })
            if (res.ok) {
                setFormState("success")
                    ; (e.target as HTMLFormElement).reset()
            } else {
                setFormState("error")
            }
        } catch (err) {
            setFormState("error")
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <SEO />
            <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-background to-background -z-10" />
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center space-y-6"
                        >
                            <div className="flex justify-center">
                                <div className="relative">
                                    <Shield className="w-20 h-20 text-primary animate-pulse" />
                                    <Lock className="w-8 h-8 text-primary absolute -bottom-2 -right-2 bg-background rounded-full p-1" />
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
                                {t('common.title')}
                            </h1>

                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                {t('common.description')}
                            </p>
                        </motion.div>

                        {/* Checker Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-full max-w-lg mt-8"
                        >
                            <CardContent className="p-6 space-y-4">
                                <form onSubmit={handleCheck} className="flex gap-2">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="url" className="sr-only">URL or Content</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="url"
                                                placeholder={t('common.placeholder')}
                                                className="pl-9 h-12 text-lg"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" size="lg" className="h-12 px-8 font-bold" disabled={isChecking}>
                                        {isChecking ? t('common.analyzing') : t('common.start_scan')}
                                    </Button>
                                </form>
                            </CardContent>

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 p-4 rounded-lg border ${result.level === "OK"
                                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                                        : result.level === "BAD"
                                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {result.level === "OK" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                                        <span className="font-semibold">{result.oneLine}</span>
                                    </div>
                                    {result.reason && (
                                        <p className="text-sm mt-2 ml-8 opacity-80">{result.reason}</p>
                                    )}
                                    {/* Smart Reporting Action */}
                                    <ReportAction category={result.category || ""} level={result.level} />
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-muted/50">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-3">
                        <FeatureCard
                            icon={<Shield className="h-10 w-10 text-blue-500" />}
                            title="Real-time Protection"
                            desc="Analyze links and messages instantly to block malicious content before you click."
                        />
                        <FeatureCard
                            icon={<Search className="h-10 w-10 text-cyan-500" />}
                            title="Deep Analysis"
                            desc="Our AI engine scans patterns, domains, and reputation databases globally."
                        />
                        <FeatureCard
                            icon={<Lock className="h-10 w-10 text-indigo-500" />}
                            title="Privacy First"
                            desc="Your data is encrypted and never stored without your explicit permission."
                        />
                    </div>
                </div>
            </section>

            {/* Contact / Report Form */}
            <section className="py-20 container px-4 md:px-6">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Partner & Report</CardTitle>
                            <CardDescription>
                                Contact us for API access or to report a new scam pattern.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {formState === "success" ? (
                                <div className="text-center py-10">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold">Message Sent!</h3>
                                    <p className="text-muted-foreground mt-2">We'll get back to you shortly.</p>
                                    <Button onClick={() => setFormState("idle")} variant="outline" className="mt-6">
                                        Send Another
                                    </Button>
                                </div>
                            ) : (
                                <form name="contact" method="post" onSubmit={handleContactSubmit} className="space-y-4">
                                    <input type="hidden" name="form-name" value="contact" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company / Org</Label>
                                            <Input id="company" name="company" placeholder="Acme Inc." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" name="name" placeholder="John Doe" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input id="phone" name="phone" placeholder="010-1234-5678" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="plan">Inquiry Type</Label>
                                        <select
                                            id="plan"
                                            name="plan"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="api">API Access</option>
                                            <option value="report">Report Scam</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="How can we help you?"
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={formState === "submitting"}>
                                        {formState === "submitting" ? "Sending..." : "Send Message"}
                                    </Button>

                                    {formState === "error" && (
                                        <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>
                                    )}
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader>
                <div className="mb-4">{icon}</div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-base">{desc}</CardDescription>
            </CardContent>
        </Card>
    )
}
