import { useState, useEffect } from "react"
import { Lock, RefreshCw, LogOut, Loader2, ShieldAlert, TrendingUp, Users, DollarSign, Activity, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import SEO from "@/components/SEO"

interface Submission {
    id: string
    created_at: string
    data: {
        company?: string
        name?: string
        email?: string
        phone?: string
        plan?: string
        message?: string
        ip?: string
    }
}

interface TrafficData {
    time: string;
    scans: number;
    threats: number;
}

interface AlertData {
    country: string;
    type: string;
    url: string;
    time: string;
}

// Real data will be fetched from Supabase
const trafficData: TrafficData[] = [];
const recentAlerts: AlertData[] = [];

export default function AdminPage() {
    const [key, setKey] = useState("")
    const [token, setToken] = useState<string | null>(localStorage.getItem("anw_admin_token"))
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<Submission[]>([])
    const [error, setError] = useState("")

    // Real-time Stats State
    const [stats, setStats] = useState({
        trafficData: trafficData,
        recentAlerts: recentAlerts,
        kpi: { totalScans: 0, threatsBlocked: 0, revenue: 0, activeUsers: 0 }
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/admin-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key }),
            })
            const json = await res.json()

            if (json.ok && json.token) {
                setToken(json.token)
                localStorage.setItem("anw_admin_token", json.token)
                setKey("")
            } else {
                setError("Invalid Admin Key")
            }
        } catch (err) {
            setError("Login failed. Check network or functions.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        setToken(null)
        setData([])
        localStorage.removeItem("anw_admin_token")
    }

    const loadSubmissions = async () => {
        if (!token) return
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin-submissions", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const json = await res.json()
            if (json.ok) {
                if (Array.isArray(json.submissions)) setData(json.submissions)
                if (json.stats) {
                    // Update stats if present (Phase 2)
                    setStats(prev => ({
                        trafficData: json.stats.trafficData.length > 0 ? json.stats.trafficData : prev.trafficData,
                        recentAlerts: json.stats.recentAlerts.length > 0 ? json.stats.recentAlerts : prev.recentAlerts,
                        kpi: { ...prev.kpi, ...json.stats.kpi }
                    }))
                }
            } else {
                if (json.error?.toLowerCase().includes("token")) handleLogout()
            }
        } catch (err) {
            setError("Failed to fetch data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (token) loadSubmissions()
    }, [token])

    if (!token) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center p-4 bg-dot-pattern">
                <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-fit">
                            <Lock className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Control Center Access</CardTitle>
                        <CardDescription>Restricted Area. Authorized Personnel Only.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="key" className="sr-only">Admin Key</Label>
                                <Input
                                    id="key"
                                    type="password"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    placeholder="Enter Access Key..."
                                    className="text-center text-lg h-12"
                                    autoComplete="off"
                                />
                            </div>
                            {error && <p className="text-sm text-center text-red-500 font-medium animate-pulse">{error}</p>}
                            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Identity"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // --- Control Center Dashboard ---
    return (
        <div className="container py-8 space-y-8 animate-in fade-in duration-500">
            <SEO title="Control Center - ANW" />

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8 text-red-600" />
                        Mission Control
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">Global security status and revenue monitoring.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-bold text-sm animate-pulse">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        SYSTEM OPERATIONAL
                    </div>
                    <Button variant="outline" onClick={loadSubmissions} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Sync
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Scans (24h)</CardTitle>
                        <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.kpi.totalScans.toLocaleString()}</div>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> Real-time
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10 border-red-200 dark:border-red-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Threats Blocked</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.kpi.threatsBlocked.toLocaleString()}</div>
                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                            Prevented potential damages
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Est. Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">${stats.kpi.revenue.toLocaleString()}</div>
                        <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                            Pending Payout
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.kpi.activeUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Currently online
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Traffic Chart (Custom SVG Implementation) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Global Scan Traffic</CardTitle>
                        <CardDescription>Real-time request volume over the last 24 hours.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full flex items-end justify-between gap-2 pt-10 relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between text-xs text-muted-foreground/30 pointer-events-none">
                                <div className="border-b w-full h-full border-dashed" />
                                <div className="border-b w-full h-full border-dashed" />
                                <div className="border-b w-full h-full border-dashed" />
                                <div className="border-b w-full h-full border-dashed" />
                            </div>

                            {/* Data Bars */}
                            {stats.trafficData.map((data, i) => (
                                <div key={i} className="group relative flex flex-col justify-end w-full h-full items-center">
                                    <div className="w-full max-w-[40px] bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all relative overflow-hidden" style={{ height: `${(data.scans / Math.max(10, Math.max(...stats.trafficData.map(d => d.scans)))) * 100}%` }}>
                                        <div className="absolute bottom-0 w-full bg-red-500/50" style={{ height: `${(data.threats / Math.max(1, data.scans)) * 100}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-2">{data.time}</span>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 bg-popover text-popover-foreground text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border pointer-events-none whitespace-nowrap z-10">
                                        <div className="font-bold">{data.time}</div>
                                        <div>Scans: {data.scans}</div>
                                        <div className="text-red-500">Threats: {data.threats}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Threat Feed */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-indigo-500" />
                            Live Threat Feed
                        </CardTitle>
                        <CardDescription>Real-time blocked attempts from global nodes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                            {stats.recentAlerts.map((alert, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border-l-4 border-red-500 animate-in slide-in-from-right-5 fade-in duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{alert.country.split(" ")[0]}</span>
                                        <div>
                                            <p className="font-bold text-sm">{alert.type} Blocked</p>
                                            <p className="text-xs text-muted-foreground truncate w-32">{alert.url}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground">{alert.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Inquiry & Subscription Log</CardTitle>
                    <CardDescription>
                        {data.length > 0 ? `${data.length} records found.` : "Use Sync button to fetch latest DB records."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* ... (Existing Table Code) ... */}
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Company</th>
                                    <th className="p-4 font-medium">Type</th>
                                    <th className="p-4 font-medium">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No recent inquiries found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item) => (
                                        <tr key={item.id} className="border-t hover:bg-muted/50 transition-colors">
                                            <td className="p-4 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 font-medium">
                                                <div>{item.data.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.data.email}</div>
                                            </td>
                                            <td className="p-4">{item.data.company || "-"}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold">
                                                    {item.data.plan || "General"}
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-md truncate" title={item.data.message}>
                                                {item.data.message || "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
