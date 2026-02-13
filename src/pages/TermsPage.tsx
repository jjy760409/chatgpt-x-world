import SEO from "@/components/SEO"

export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-12 px-4">
            <SEO title="Terms of Service - ANW" />
            <div className="prose dark:prose-invert max-w-none">
                <h1>Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Effective Date: February 2026</p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using ANW (anw.kr) and its related services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
                </p>

                <h2>2. Service Description</h2>
                <p>
                    ANW provides AI-powered analysis of URLs, text messages, and financial information to detect potential scams. The service is provided "as is" and intended for informational purposes only.
                </p>

                <h2>3. User Responsibilities</h2>
                <ul>
                    <li>You agree not to use the service for any illegal purposes.</li>
                    <li>You must not attempt to reverse engineer, disrupt, or compromise the integrity of our system.</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                </ul>

                <h2>4. Intellectual Property</h2>
                <p>
                    The ANW App, Website, and domain 'anw.kr' are the exclusive intellectual property of ANW. All content, trademarks, logos, and code are protected by copyright and intellectual property laws. Unauthorized reproduction, distribution, or modification is strictly prohibited.
                </p>

                <h2>5. Subscription & Refunds</h2>
                <p>
                    Pro and Enterprise plans are billed on a recurring basis. You may cancel your subscription at any time. Refunds are processed according to our specific Refund Policy, typically within 7 days of the initial purchase if the service was not used.
                </p>

                <h2>6. Termination</h2>
                <p>
                    We reserve the right to terminate or suspend your access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or us.
                </p>

                <h2>7. Governing Law</h2>
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of the Repubic of Korea, without regard to its conflict of law provisions.
                </p>
            </div>
        </div>
    )
}
