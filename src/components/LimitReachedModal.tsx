import { motion, AnimatePresence } from "framer-motion"
import { Lock, ArrowRight, ShieldAlert, X } from "lucide-react"

interface LimitReachedModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LimitReachedModal({ isOpen, onClose }: LimitReachedModalProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-background border-2 border-red-500 rounded-xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-red-500/10 p-6 text-center border-b border-red-500/20 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <ShieldAlert className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">
                            Critical Alert: Protection Paused
                        </h2>
                        <p className="text-sm font-medium text-red-500">
                            Your daily free scan limit (10/10) has been reached.
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        <div className="space-y-4 text-center">
                            <p className="text-muted-foreground">
                                You are currently <span className="font-bold text-foreground">vulnerable</span> to new phishing attacks. Scammers don't stop, and neither should your protection.
                            </p>

                            <div className="bg-secondary/50 p-4 rounded-lg text-left text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary" />
                                    <span>Unlock <b>Unlimited</b> Real-time Scans</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary" />
                                    <span>Get <b>Priority</b> AI Threat Analysis</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary" />
                                    <span>Secure Your <b>Financial Assets</b> Now</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = "/pricing"}
                            className="w-full py-4 text-lg font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            Activate Full Protection
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <p className="text-xs text-center text-muted-foreground">
                            Join 10,000+ Pro users staying safe today.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
