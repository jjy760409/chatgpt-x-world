import { Link } from "react-router-dom"

export default function ThanksPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h1 className="text-4xl font-bold mb-4 text-green-500">Submission Received!</h1>
            <p className="text-lg text-muted-foreground mb-8">
                Thank you for reporting. We will investigate immediately.
            </p>
            <Link to="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Back to Home
            </Link>
        </div>
    )
}
