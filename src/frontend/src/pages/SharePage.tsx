import { Button } from "@/components/ui/button";
import { Check, Copy, Share2, Twitter, Zap } from "lucide-react";
import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

export function SharePage() {
  const appUrl = window.location.origin;
  const shareMessage = "Join me on Pulse Social!";
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      toast.success("Link copied!", { duration: 2500 });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = appUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success("Link copied!", { duration: 2500 });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareMessage} ${appUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(shareMessage);
    const url = encodeURIComponent(appUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 page-transition">
      {/* Subtle background texture */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 35%, oklch(0.75 0 0 / 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, oklch(0.65 0 0 / 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-[0_8px_48px_oklch(0_0_0/0.12)] dark:shadow-[0_8px_48px_oklch(0_0_0/0.4)] border border-border/60">
          {/* Logo lockup */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div
              className="w-20 h-20 rounded-3xl silver-icon flex items-center justify-center"
              style={{
                boxShadow:
                  "0 0 32px oklch(0.7 0 0 / 0.4), 0 8px 24px oklch(0 0 0 / 0.25), inset 0 2px 4px oklch(1 0 0 / 0.5)",
              }}
            >
              <Zap className="h-9 w-9 text-white fill-white drop-shadow-lg" />
            </div>

            <div className="text-center">
              <h1
                className="font-display text-4xl font-bold tracking-tight silver-shine-text"
                style={{ fontSize: "clamp(2rem, 8vw, 2.75rem)" }}
              >
                Pulse Social
              </h1>
              <p className="mt-2 text-muted-foreground text-base leading-relaxed">
                Connect, share, and discover amazing moments.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/60 mb-6" />

          {/* Share section heading */}
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Share this app
            </span>
          </div>

          {/* App URL display + copy */}
          <div className="flex items-center gap-2 mb-6">
            <div
              data-ocid="share.link_input"
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm font-mono text-foreground/80 truncate select-all cursor-text"
              title={appUrl}
            >
              {appUrl}
            </div>
            <Button
              data-ocid="share.copy_button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0 rounded-xl gap-1.5 border-border hover:bg-accent transition-all duration-150"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-foreground" />
                  <span className="text-xs font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-xs font-medium">Copy</span>
                </>
              )}
            </Button>
          </div>

          {/* Social share buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-ocid="share.whatsapp_button"
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent transition-all duration-150 text-sm font-semibold text-foreground group"
            >
              <SiWhatsapp className="h-4 w-4 text-[#25D366] group-hover:scale-110 transition-transform duration-150" />
              WhatsApp
            </button>

            <button
              type="button"
              data-ocid="share.twitter_button"
              onClick={handleTwitter}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent transition-all duration-150 text-sm font-semibold text-foreground group"
            >
              <Twitter className="h-4 w-4 group-hover:scale-110 transition-transform duration-150" />
              Twitter / X
            </button>
          </div>
        </div>

        {/* Footer attribution */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </div>
    </main>
  );
}
