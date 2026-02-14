import { Share2, Link as LinkIcon, Twitter, Facebook, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { useState } from "react"

export function ShareButtons() {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const shareUrl = "https://anw.kr";
    const shareText = t('viral.message');
    const fullText = `${shareText} ${shareUrl}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=ScamAlert,ANW,CyberSecurity`, '_blank');
    };

    const handleFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const handleWhatsapp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
    };

    return (
        <div className="mt-8 pt-6 border-t border-border/50 text-center animate-in fade-in duration-700 delay-300">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                {t('viral.title')}
            </h4>
            <p className="text-xs text-muted-foreground/70 mb-4 px-4">
                {t('viral.desc')}
            </p>

            <div className="flex justify-center gap-3 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 border-transparent"
                    onClick={handleTwitter}
                >
                    <Twitter className="w-4 h-4" />
                    Twitter
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border-transparent"
                    onClick={handleFacebook}
                >
                    <Facebook className="w-4 h-4" />
                    Facebook
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-transparent"
                    onClick={handleWhatsapp}
                >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleCopy}
                >
                    <LinkIcon className="w-4 h-4" />
                    {copied ? t('viral.copy_toast') : "Copy Link"}
                </Button>
            </div>
        </div>
    )
}
