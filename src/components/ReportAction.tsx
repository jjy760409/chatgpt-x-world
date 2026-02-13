import { Phone, ExternalLink, Siren } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportActionProps {
    category: string
    level: string
}

export function ReportAction({ category, level }: ReportActionProps) {
    if (level === "safe" || !category) return null

    // Authority Configuration
    const authorities = {
        voice_phishing: {
            name: "KISA & Police",
            phone: "118",
            phoneLabel: "Call 118 (KISA)",
            url: "https://ecrm.cyber.go.kr",
            urlLabel: "Online Report (ECRM)",
            description: "Report smishing/vishing immediately to prevent data theft."
        },
        financial_fraud: {
            name: "FSS (Financial Supervisory Service)",
            phone: "1332",
            phoneLabel: "Call 1332 (FSS)",
            url: "https://www.fss.or.kr",
            urlLabel: "FSS Complaint Center",
            description: "Contact FSS immediately for account suspension and damage relief."
        },
        illegal_gambling: {
            name: "NGCC (Gambling Control)",
            phone: "1336",
            phoneLabel: "Call 1336 (NGCC)",
            url: "https://www.ngcc.go.kr",
            urlLabel: "Report Gambling Site",
            description: "Report illegal online gambling sites anonymously."
        },
        sexual_violence: {
            name: "Digital Sex Crime Support",
            phone: "1366",
            phoneLabel: "Call 1366 (Women's Hotline)",
            url: "https://d4u.stop.or.kr",
            urlLabel: "Digital Sex Crime Center",
            description: "Get immediate help for digital sex crimes."
        },
        commercial_spam: {
            name: "KISA Spam Center",
            phone: "118",
            phoneLabel: "Report Spam (118)",
            url: "https://spam.kisa.or.kr",
            urlLabel: "KISA Spam Report",
            description: "Report illegal spam messages."
        },
        general: {
            name: "Police",
            phone: "112",
            phoneLabel: "Call 112 (Police)",
            url: "https://ecrm.cyber.go.kr",
            urlLabel: "Cyber Crime Report",
            description: "Report any suspicious criminal activity."
        }
    }

    // Default to 'general' if category not found (except 'safe')
    const action = authorities[category as keyof typeof authorities] || authorities["general"]

    return (
        <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                    <Siren className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-red-700 dark:text-red-400 text-lg">
                        Immediate Action Required
                    </h3>
                    <p className="text-sm text-red-600/90 dark:text-red-400/80 mb-4">
                        This content is identified as <strong>{category.replace("_", " ").toUpperCase()}</strong>.
                        {action.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="destructive"
                            className="gap-2 shadow-lg hover:scale-105 transition-transform"
                            onClick={() => window.location.href = `tel:${action.phone}`}
                        >
                            <Phone className="w-4 h-4" />
                            {action.phoneLabel}
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                            onClick={() => window.open(action.url, "_blank")}
                        >
                            <ExternalLink className="w-4 h-4" />
                            {action.urlLabel}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        * Reporting helps prevent others from becoming victims.
                    </p>
                </div>
            </div>
        </div>
    )
}
