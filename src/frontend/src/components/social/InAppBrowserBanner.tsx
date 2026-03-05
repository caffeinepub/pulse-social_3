import { Copy, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function detectInAppBrowser(): boolean {
  const ua = navigator.userAgent || "";

  // Common in-app browser signatures
  const inAppSignatures = [
    "Instagram",
    "FBAN",
    "FBAV",
    "FBIOS",
    "FBSS",
    "Twitter",
    "Threads",
    "TikTok",
    "Line",
    "WhatsApp",
    "Snapchat",
    "Pinterest",
    "LinkedInApp",
    "GSA", // Google Search App
    "MicroMessenger", // WeChat
    "UCBrowser",
    "SamsungBrowser",
  ];

  // Check for explicit in-app browser strings
  if (inAppSignatures.some((sig) => ua.includes(sig))) return true;

  // Check for Android WebView specifically (wv flag in Chrome)
  if (/Android.*(wv)/.test(ua)) return true;

  // iOS webview check: UIWebView or WKWebView
  // On iOS Safari, "Safari" is in the UA; in-app browsers often omit it or have specific strings
  if (
    /iphone|ipad/i.test(ua) &&
    !/safari/i.test(ua) &&
    !ua.includes("CriOS") &&
    !ua.includes("FxiOS")
  ) {
    return true;
  }

  return false;
}

const DISMISS_KEY = "pulse_inapp_banner_dismissed";

export function InAppBrowserBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!detectInAppBrowser()) return;
    // Check if dismissed this session
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed) return;
    setVisible(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! Open it in Chrome, Safari, or Firefox.");
    } catch {
      // Fallback for browsers that block clipboard
      toast.error("Copy this URL and open it in your browser.");
    }
  };

  if (!visible) return null;

  return (
    <div
      data-ocid="inapp.panel"
      role="alert"
      className="sticky top-0 z-[100] w-full bg-foreground text-background"
      style={{ borderBottom: "1px solid oklch(0.4 0 0)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-start sm:items-center gap-3">
        {/* Icon */}
        <ExternalLink className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0 opacity-80" />

        {/* Message */}
        <p className="flex-1 text-xs sm:text-sm leading-snug opacity-90">
          For the best experience, open{" "}
          <span className="font-semibold">Pulse Social</span> in your browser
          (Chrome, Safari, or Firefox). Internet Identity login may not work in
          this app.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            data-ocid="inapp.button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-current opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Link
          </button>
          <button
            type="button"
            data-ocid="inapp.close_button"
            onClick={handleDismiss}
            aria-label="Dismiss in-app browser notice"
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
