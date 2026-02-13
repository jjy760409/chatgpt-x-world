import { Link, Outlet } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

export default function Layout() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-2xl items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link to="/" className="mr-6 flex items-center space-x-2">
                            <ShieldAlert className="h-6 w-6 text-primary" />
                            <span className="hidden font-bold sm:inline-block">
                                ANW (Anti-Scam Web)
                            </span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link to="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
                            <Link to="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">How it works</Link>
                            <Link to="/admin" className="transition-colors hover:text-foreground/80 text-foreground/60">Admin</Link>
                        </nav>
                    </div>
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
