import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2, Lock, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";

interface SubscriptionGateProps {
  children: ReactNode;
  currentPrincipalId: string | null;
  isAdmin: boolean;
}

export function SubscriptionGate({
  children,
  currentPrincipalId,
  isAdmin,
}: SubscriptionGateProps) {
  const { isSubscribed, subscribe } = useSubscription(isAdmin);
  const { actor } = useActor();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(
    null,
  );

  // Check Stripe configuration on mount when actor is available
  useEffect(() => {
    if (!actor) return;
    actor
      .isStripeConfigured()
      .then((configured) => setStripeConfigured(configured))
      .catch(() => setStripeConfigured(false));
  }, [actor]);

  // Not logged in → show page as-is (they'll see the landing CTA)
  if (!currentPrincipalId) {
    return <>{children}</>;
  }

  // Logged in and subscribed (or admin) → show page
  if (isSubscribed) {
    return <>{children}</>;
  }

  // Logged in but not subscribed → paywall
  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await subscribe();
    } catch {
      setIsSubscribing(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key="subscription-gate"
        data-ocid="subscription.section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md">
          {/* Decorative background blob */}
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pulse-gradient" />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            }}
            className="bg-card border border-border rounded-3xl shadow-card-hover p-8 sm:p-10 text-center relative overflow-hidden"
          >
            {/* Subtle top shimmer */}
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-1 pulse-gradient rounded-t-3xl opacity-80"
            />

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-2xl pulse-gradient flex items-center justify-center shadow-glow">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight pulse-gradient-text">
                Pulse Social
              </span>
            </div>

            {/* Lock icon */}
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              <Lock className="h-8 w-8 text-primary" />
            </motion.div>

            {/* Heading */}
            <h1 className="font-display text-3xl font-bold mb-2 leading-tight">
              Subscribe to continue
            </h1>

            {/* Price pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-full font-semibold text-sm mb-5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              $1 / week
            </motion.div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-8">
              Get full access to your feed, explore new people, and share your
              moments.
            </p>

            {/* CTA or not-configured message */}
            {stripeConfigured === null ? (
              // Still checking
              <div
                data-ocid="subscription.loading_state"
                className="flex items-center justify-center gap-2 text-muted-foreground py-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Checking payment options…</span>
              </div>
            ) : stripeConfigured === false ? (
              // Stripe not configured
              <div
                data-ocid="subscription.error_state"
                className="bg-muted rounded-2xl px-5 py-4 text-sm text-muted-foreground"
              >
                Payments are not yet configured. Please check back soon.
              </div>
            ) : (
              // Subscribe CTA
              <Button
                data-ocid="subscription.subscribe_button"
                onClick={handleSubscribe}
                disabled={isSubscribing}
                size="lg"
                className="w-full rounded-2xl pulse-gradient text-white border-0 shadow-glow text-base h-12 font-semibold"
              >
                {isSubscribing ? (
                  <>
                    <Loader2
                      data-ocid="subscription.loading_state"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                    Redirecting to checkout…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Subscribe — $1/week
                  </>
                )}
              </Button>
            )}

            {/* Fine print */}
            <p className="text-xs text-muted-foreground mt-4">
              Secured checkout via Stripe · Cancel anytime
            </p>
          </motion.div>
        </div>
      </motion.main>
    </AnimatePresence>
  );
}
