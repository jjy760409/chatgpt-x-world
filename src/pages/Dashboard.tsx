import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, BadgeDollarSign, ChevronLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { getMetrics } from "@/lib/metrics";
import type { UserMetrics } from "@/lib/metrics";

export default function Dashboard() {
    const [metrics, setMetrics] = useState<UserMetrics>({ totalScans: 0, threatsBlocked: 0, estimatedMoneySaved: 0 });

    useEffect(() => {
        setMetrics(getMetrics());
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <SEO title="My Security Vault | ANW" />

            <div className="container max-w-4xl px-4 py-8 mx-auto mt-16">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Scanner
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
                            My Security Vault
                        </h1>
                        <p className="text-muted-foreground text-lg">Your personal cyber-defense record based on local device analysis.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <MetricCard
                            icon={<Shield className="w-8 h-8 text-blue-500" />}
                            title="Total Scans"
                            value={metrics.totalScans.toLocaleString()}
                            delay={0.1}
                        />
                        <MetricCard
                            icon={<ShieldAlert className="w-8 h-8 text-red-500" />}
                            title="Threats Blocked"
                            value={metrics.threatsBlocked.toLocaleString()}
                            delay={0.2}
                        />
                        <MetricCard
                            icon={<BadgeDollarSign className="w-8 h-8 text-yellow-500" />}
                            title="Est. Money Saved"
                            value={`₩${metrics.estimatedMoneySaved.toLocaleString()}`}
                            delay={0.3}
                        />
                    </div>

                    {metrics.threatsBlocked > 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 text-center shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-green-500/5 blur-3xl -z-10" />
                            <h3 className="text-2xl font-bold text-green-400 mb-3">Excellent Defense Status</h3>
                            <p className="text-muted-foreground max-w-2xl mx-auto">You have successfully protected yourself against {metrics.threatsBlocked} potential threats. Keep consulting ANW for every suspicious message to maintain an impenetrable digital life!</p>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 blur-3xl -z-10" />
                            <h3 className="text-xl font-bold text-foreground mb-3">Ready to Defend</h3>
                            <p className="text-muted-foreground max-w-2xl mx-auto">You haven't encountered any threats yet. If you receive a suspicious link or text, analyze it immediately to build up your defense record.</p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function MetricCard({ icon, title, value, delay }: { icon: React.ReactNode, title: string, value: string | number, delay: number }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
            <Card className="bg-background/80 backdrop-blur-md border hover:border-primary/50 transition-all shadow-xl h-full">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                    <div className="p-4 rounded-2xl bg-muted/50 border shadow-inner">
                        {icon}
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                        <p className="text-4xl font-extrabold">{value}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
