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
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by{" "}
                        <a
                            href="#"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4"
                        >
                            Anti-Gravity
                        </a>
                        . The source code is available on GitHub.
                    </p>
                </div>
            </footer>
        </div>
    )
}
