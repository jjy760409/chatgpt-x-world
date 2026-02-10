import { Helmet } from "react-helmet-async"

interface SEOProps {
    title?: string
    description?: string
    name?: string
    type?: string
}

export default function SEO({
    title = "ANW - Anti-Scam Web",
    description = "Real-time AI protection against phishing, smishing, and online fraud. Verify URLs and bank accounts instantly.",
    name = "ANW",
    type = "website"
}: SEOProps) {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {/* End Twitter tags */}
        </Helmet>
    )
}
