import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Search, Lock, AlertTriangle, CheckCircle, Crown } from "lucide-react"
import SEO from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useSubscription } from "@/hooks/useSubscription"

export default function LandingPage() {
    const [url, setUrl] = useState("")
    const [isChecking, setIsChecking] = useState(false)
    const [result, setResult] = useState<null | { level: string; oneLine: string; reason: string }>(null)
    const { subscription, isPro } = useSubscription()

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url.trim()) return
        setIsChecking(true)
        setResult(null)

        const headers: HeadersInit = { "Content-Type": "application/json" }
        if (subscription?.token) {
            headers["Authorization"] = `Bearer ${subscription.token}`
        }

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers,
                body: JSON.stringify({ text: url.trim() }),
            })
            const data = await res.json()
            if (data.ok) {
                setResult({ level: data.level, oneLine: data.oneLine, reason: data.reason })
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
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-background to-background -z-10" />
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-4 gap-2">
                                <span>v2.0 Beta Now Live</span>
                                {isPro && (
                                    <span className="flex items-center gap-1 bg-yellow-400 text-black px-1.5 py-0.5 rounded-full text-[10px]">
                                        <Crown className="w-3 h-3" /> Pro User
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                                Detect Scams <br className="hidden sm:inline" />
                                <span className="text-blue-500">Before They Strike</span>
                            </h1>
                            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                                Real-time protection against phishing, smishing, and fraud using advanced AI analysis.
                            </p>
                        </motion.div>

                        {/* Checker Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-full max-w-lg mt-8"
                        >
                            <form onSubmit={handleCheck} className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative flex items-center bg-background rounded-lg border p-1 shadow-2xl">
                                    <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        className="border-0 shadow-none focus-visible:ring-0 text-md"
                                        placeholder="Enter URL, Phone, or Account Number..."
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                    <Button type="submit" disabled={isChecking}>
                                        {isChecking ? "Scanning..." : "Check Now"}
                                    </Button>
                                </div>
                            </form>

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
