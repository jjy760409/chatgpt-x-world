import { Phone, ExternalLink, Siren } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

interface ReportActionProps {
    category: string
    level: string
}

export function ReportAction({ category, level }: ReportActionProps) {
    const { t, i18n } = useTranslation();
    const isKr = i18n.language.startsWith('ko');

    if (level === "safe" || !category) return null

    // Authority Configuration (KR vs Global)
    const authorities = {
        voice_phishing: isKr ? {
            name: "KISA & Police",
            phone: "118",
            phoneLabel: "전화 신고 (118)",
            url: "https://ecrm.cyber.go.kr",
            urlLabel: "온라인 신고 (ECRM)",
            description: "보이스피싱/스미싱은 즉시 신고하여 추가 피해를 막으세요."
        } : {
            name: "Global Anti-Fraud",
            phone: "911", // Placeholder for local emergency
            phoneLabel: "Call Police",
            url: "https://www.ic3.gov/", // FBI IC3
            urlLabel: "Report to FBI (IC3)",
            description: "Report immediately to prevent identity theft."
        },
        financial_fraud: isKr ? {
            name: "FSS (Financial Supervisory Service)",
            phone: "1332",
            phoneLabel: "금융감독원 (1332)",
            url: "https://www.fss.or.kr",
            urlLabel: "불법금융 신고센터",
            description: "계좌 정지 및 피해 구제를 위해 즉시 연락하세요."
        } : {
            name: "FTC (Federal Trade Commission)",
            phone: "", // FTC doesn't have a direct emergency line like 112
            phoneLabel: "Report Fraud",
            url: "https://reportfraud.ftc.gov/",
            urlLabel: "Report directly to FTC",
            description: "Contact FTC to report fraud and bad business practices."
        },
        illegal_gambling: isKr ? {
            name: "NGCC (Gambling Control)",
            phone: "1336",
            phoneLabel: "도박문제 상담 (1336)",
            url: "https://www.ngcc.go.kr",
            urlLabel: "불법도박 신고",
            description: "불법 도박 사이트 및 행위를 익명으로 신고하세요."
        } : {
            name: "Gambling Commission",
            phone: "",
            phoneLabel: "Get Help",
            url: "https://www.gamblingcommission.gov.uk/", // Example UK, or generic
            urlLabel: "Report Illegal Gambling",
            description: "Report illegal gambling activities."
        },
        sexual_violence: isKr ? {
            name: "Digital Sex Crime Support",
            phone: "1366",
            phoneLabel: "여성긴급전화 (1366)",
            url: "https://d4u.stop.or.kr",
            urlLabel: "디지털성범죄 피해지원",
            description: "디지털 성범죄 피해, 즉시 도움을 받으세요."
        } : {
            name: "Safety Center",
            phone: "",
            phoneLabel: "Get Help",
            url: "https://www.missingkids.org/CyberTipline", // NCMEC
            urlLabel: "Report to CyberTipline",
            description: "Report online exploitation."
        },
        commercial_spam: isKr ? {
            name: "KISA Spam Center",
            phone: "118",
            phoneLabel: "스팸 신고 (118)",
            url: "https://spam.kisa.or.kr",
            urlLabel: "불법스팸 대응센터",
            description: "불법 스팸 문자를 신고하세요."
        } : {
            name: "Spam Reporting",
            phone: "",
            phoneLabel: "Report Spam",
            url: "https://fightspam.gc.ca", // Example CA, or generic
            urlLabel: "Report Spam",
            description: "Report unsolicited spam messages."
        },
        general: isKr ? {
            name: "Police",
            phone: "112",
            phoneLabel: "경찰청 (112)",
            url: "https://ecrm.cyber.go.kr",
            urlLabel: "사이버범죄 신고",
            description: "의심스러운 범죄 행위를 신고하세요."
        } : {
            name: "Local Police",
            phone: "911",
            phoneLabel: "Emergency Call",
            url: "https://www.econsumer.gov",
            urlLabel: "Global Complaint",
            description: "Report suspicious activities to local authorities."
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
                        {t('report.title')}
                    </h3>
                    <p className="text-sm text-red-600/90 dark:text-red-400/80 mb-4">
                        {action.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {action.phone && (
                            <Button
                                variant="destructive"
                                className="gap-2 shadow-lg hover:scale-105 transition-transform"
                                onClick={() => window.location.href = `tel:${action.phone}`}
                            >
                                <Phone className="w-4 h-4" />
                                {action.phoneLabel}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="gap-2 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                            onClick={() => window.open(action.url, "_blank")}
                        >
                            <ExternalLink className="w-4 h-4" />
                            {action.urlLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
