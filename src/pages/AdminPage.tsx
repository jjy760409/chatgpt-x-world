import { useState } from "react"
import { Lock, Download, RefreshCw, LogOut, Loader2 } from "lucide-react"
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

export default function AdminPage() {
    const [key, setKey] = useState("")
    const [token, setToken] = useState<string | null>(localStorage.getItem("anw_admin_token"))
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<Submission[]>([])
    const [error, setError] = useState("")

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
            if (json.ok && Array.isArray(json.submissions)) {
                setData(json.submissions)
            } else {
                setError(json.error || "Failed to load submissions")
                if (json.error?.toLowerCase().includes("token")) handleLogout()
            }
        } catch (err) {
            setError("Failed to fetch data")
        } finally {
            setIsLoading(false)
        }
    }

    const downloadCSV = () => {
        if (!data.length) return
        const header = ["Date", "Company", "Name", "Phone", "Email", "Type", "Message"]
        const rows = data.map((s) => [
            new Date(s.created_at).toLocaleString(),
            s.data.company || "",
            s.data.name || "",
            s.data.phone || "",
            s.data.email || "",
            s.data.plan || "",
            (s.data.message || "").replace(/\n/g, " "),
        ])

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [header.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "anw_submissions.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (!token) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" /> Admin Access
                        </CardTitle>
                        <CardDescription>Enter your admin key to continue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="key">Admin Key</Label>
                                <Input
                                    id="key"
                                    type="password"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    placeholder="••••••••••••"
                                    autoComplete="off"
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Unlock Dashboard"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-8 space-y-6">
            <SEO title="Admin Dashboard - ANW" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Manage and export incoming inquiries.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadSubmissions} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={downloadCSV} disabled={!data.length}>
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                    <CardDescription>
                        {data.length > 0 ? `${data.length} records found.` : "No data loaded. Use Refresh to fetch."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                            No data to display.
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
