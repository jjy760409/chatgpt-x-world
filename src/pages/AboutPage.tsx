import { motion } from "framer-motion"
import { Shield, Zap, Globe, Lock, Search, Users } from "lucide-react"
import SEO from "@/components/SEO"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
    {
        icon: <Search className="h-8 w-8 text-blue-500" />,
        title: "1. Enter Suspicious Content",
        desc: "Paste any URL, phone number, account number, or message you received.",
    },
    {
        icon: <Zap className="h-8 w-8 text-cyan-500" />,
        title: "2. AI Analyzes in Real-time",
        desc: "Our AI engine + rule-based system scans for phishing patterns, suspicious domains, and known scam databases.",
    },
    {
        icon: <Shield className="h-8 w-8 text-green-500" />,
        title: "3. Get Instant Results",
        desc: "Receive a clear OK / WARN / BAD verdict with an easy-to-understand explanation.",
    },
]

export default function AboutPage() {
    return (
        <div className="container py-16 px-4">
            <SEO title="How It Works - ANW Anti-Scam Protection" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    How ANW Protects You
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Simple 3-step process to verify any suspicious content before it's too late.
                </p>
            </motion.div>

            {/* Steps */}
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-20">
                {steps.map((step, i) => (
                    <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                    >
                        <Card className="h-full text-center bg-card/50 backdrop-blur border-white/10">
                            <CardHeader>
                                <div className="mx-auto mb-4">{step.icon}</div>
                                <CardTitle className="text-lg">{step.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{step.desc}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Why ANW */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                <h2 className="text-3xl font-bold text-center mb-10">Why Choose ANW?</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start gap-4">
                        <Globe className="h-6 w-6 text-blue-500 mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Global Coverage</h3>
                            <p className="text-sm text-muted-foreground">We scan against threat databases from 190+ countries.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Lock className="h-6 w-6 text-indigo-500 mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Privacy First</h3>
                            <p className="text-sm text-muted-foreground">Your data is encrypted and never stored without consent.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Zap className="h-6 w-6 text-yellow-500 mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Instant Results</h3>
                            <p className="text-sm text-muted-foreground">AI-powered analysis returns results in under 2 seconds.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Users className="h-6 w-6 text-green-500 mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Community Driven</h3>
                            <p className="text-sm text-muted-foreground">Threat reports from our users help protect everyone.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
