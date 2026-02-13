import SEO from "@/components/SEO"

export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl py-12 px-4">
            <SEO title="Privacy Policy - ANW" />
            <div className="prose dark:prose-invert max-w-none">
                <h1>Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last Updated: February 2026</p>

                <h2>1. Introduction</h2>
                <p>
                    ANW ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website (anw.kr) and mobile application.
                </p>

                <h2>2. Information We Collect</h2>
                <ul>
                    <li><strong>Analysis Data:</strong> URLs, text messages, phone numbers, or bank account numbers you submit for scam analysis.</li>
                    <li><strong>Account Information:</strong> Email address and payment information (processed securely by PayPal) for Pro/Enterprise users.</li>
                    <li><strong>Usage Data:</strong> IP address, browser type, and interaction logs for security and service improvement.</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <p>We use the collected data to:</p>
                <ul>
                    <li>Provide real-time scam detection analysis.</li>
                    <li>Process subscription payments and manage accounts.</li>
                    <li>Improve our AI detection models (anonymized data only).</li>
                    <li>Prevent abuse and ensure service security.</li>
                </ul>

                <h2>4. Data Security</h2>
                <p>
                    We implement industry-standard security measures, including SSL encryption and secure data storage, to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                </p>

                <h2>5. Third-Party Services</h2>
                <p>
                    We use trusted third-party services such as PayPal for payments and Google Gemini for AI analysis. These services have their own privacy policies governing the use of your data.
                </p>

                <h2>6. Your Rights</h2>
                <p>
                    You have the right to access, correct, or delete your personal information. Contact us at support@anw.kr for any privacy-related requests.
                </p>

                <h2>7. Contact Us</h2>
                <p>
                    If you have questions about this Privacy Policy, please contact us at: <br />
                    <strong>Email:</strong> support@anw.kr
                </p>
            </div>
        </div>
    )
}
