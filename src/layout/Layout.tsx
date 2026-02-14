import { Link, Outlet } from "react-router-dom"
import { ShieldAlert, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { usePWA } from "@/hooks/usePWA"
import { Download } from "lucide-react"

export default function Layout() {
    const { i18n } = useTranslation();
    const { isInstallable, installApp } = usePWA();

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('ko') ? 'en' : 'ko';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <ShieldAlert className="h-6 w-6 text-primary" />
                        <span className="hidden md:inline-block">ANW</span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleLanguage}
                            className="gap-2"
                        >
                            <Globe className="h-4 w-4" />
                            {i18n.language.startsWith('ko') ? 'EN' : 'KO'}
                        </Button>

                        {isInstallable && (
                            <Button
                                onClick={installApp}
                                variant="outline"
                                size="sm"
                                className="hidden md:flex gap-2 border-primary/50 text-primary hover:bg-primary/10 animate-pulse"
                            >
                                <Download className="h-4 w-4" />
                                App
                            </Button>
                        )}

                        <Link to="/pricing">
                            <Button variant="ghost" size="sm">Pro Plan</Button>
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="py-8 border-t border-border/40 bg-background/95">
                <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-lg">
                            <ShieldAlert className="h-5 w-5 text-primary" />
                            <span>ANW (Anti-Scam Web)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            &copy; 2026 ANW (anw.kr). All rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground/60 max-w-md">
                            The ANW App, Website, and domain 'anw.kr' are the intellectual property of ANW.
                            Unauthorized reproduction or distribution is strictly prohibited.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
                        <Link to="/about" className="hover:text-foreground transition-colors">About Us</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
