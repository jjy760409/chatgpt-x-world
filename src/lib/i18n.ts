import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    common: {
                        title: "Global Anti-Scam Network",
                        description: "AI-Powered Real-time Scam Detection",
                        start_scan: "Scan Now",
                        analyzing: "Analyzing...",
                        placeholder: "Paste URL or text message here...",
                        copyright: "© 2026 ANW. All rights reserved.",
                        language: "Language"
                    },
                    result: {
                        safe: "SAFE",
                        warning: "WARNING",
                        danger: "DANGER",
                        safe_desc: "No threats detected.",
                        warning_desc: "Suspicious elements found.",
                        danger_desc: "High risk of scam detected."
                    },
                    report: {
                        title: "Immediate Action Required",
                        call: "Call Now",
                        online: "Report Online",
                        desc: "Reporting prevents further victims."
                    }
                }
            },
            ko: {
                translation: {
                    common: {
                        title: "ANW 사기 탐지 네트워크",
                        description: "AI 기반 실시간 스미싱/사기 탐지",
                        start_scan: "무료 검사 시작",
                        analyzing: "AI가 분석 중입니다...",
                        placeholder: "의심스러운 문자나 URL을 입력하세요...",
                        copyright: "© 2026 ANW. All rights reserved.",
                        language: "언어"
                    },
                    result: {
                        safe: "안전",
                        warning: "주의",
                        danger: "위험",
                        safe_desc: "위협 요소가 발견되지 않았습니다.",
                        warning_desc: "의심스러운 정황이 있습니다.",
                        danger_desc: "즉시 차단이 필요한 위험 요소입니다."
                    },
                    report: {
                        title: "즉시 조치가 필요합니다",
                        call: "전화 신고",
                        online: "온라인 신고",
                        desc: "신고는 추가 피해를 막을 수 있습니다."
                    }
                }
            }
        }
    });

export default i18n;
