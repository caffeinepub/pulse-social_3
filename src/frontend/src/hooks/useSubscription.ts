import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

interface SubscriptionRecord {
  paidUntil: number; // timestamp ms
}

function getStorageKey(principalId: string): string {
  return `subscription_${principalId}`;
}

function readSubscription(principalId: string): SubscriptionRecord | null {
  try {
    const raw = localStorage.getItem(getStorageKey(principalId));
    if (!raw) return null;
    return JSON.parse(raw) as SubscriptionRecord;
  } catch {
    return null;
  }
}

function writeSubscription(
  principalId: string,
  record: SubscriptionRecord,
): void {
  const key = getStorageKey(principalId);
  localStorage.setItem(key, JSON.stringify(record));
  // Dispatch a storage event so all hook instances in the same tab refresh
  window.dispatchEvent(
    new StorageEvent("storage", { key, newValue: JSON.stringify(record) }),
  );
}

export function isRazorpayConfiguredLocally(): boolean {
  const key = localStorage.getItem("razorpay_key_id");
  return !!key && key.trim().length > 0;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if ((window as unknown as Record<string, unknown>).Razorpay) {
      resolve();
      return;
    }
    // Already a pending script tag
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay SDK failed to load")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.head.appendChild(script);
  });
}

export function useSubscription(isAdmin: boolean) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const principalId = identity?.getPrincipal().toString() ?? null;

  const [isSubscribing, setIsSubscribing] = useState(false);

  const [paidUntil, setPaidUntil] = useState<Date | null>(() => {
    if (!principalId) return null;
    const record = readSubscription(principalId);
    if (!record || record.paidUntil <= Date.now()) return null;
    return new Date(record.paidUntil);
  });

  // Free trial state derived from backend first-login time
  const [trialStartMs, setTrialStartMs] = useState<number | null>(null);
  const [trialLoaded, setTrialLoaded] = useState(false);

  // Re-read subscription when principal changes
  useEffect(() => {
    if (!principalId) {
      setPaidUntil(null);
      return;
    }
    const record = readSubscription(principalId);
    if (record && record.paidUntil > Date.now()) {
      setPaidUntil(new Date(record.paidUntil));
    } else {
      setPaidUntil(null);
    }
  }, [principalId]);

  // Listen for storage changes (including same-tab dispatches after payment)
  useEffect(() => {
    if (!principalId) return;
    const key = getStorageKey(principalId);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      const record = readSubscription(principalId);
      if (record && record.paidUntil > Date.now()) {
        setPaidUntil(new Date(record.paidUntil));
      } else {
        setPaidUntil(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [principalId]);

  // Load free trial start time from backend
  useEffect(() => {
    if (!actor || isFetching || !principalId) {
      if (!principalId) {
        setTrialStartMs(null);
        setTrialLoaded(false);
      }
      return;
    }

    actor
      .getFirstLoginTime()
      .then((result) => {
        if (result !== null && result !== undefined) {
          // Convert bigint nanoseconds to milliseconds
          setTrialStartMs(Number(result) / 1_000_000);
        } else {
          setTrialStartMs(null);
        }
        setTrialLoaded(true);
      })
      .catch(() => {
        setTrialStartMs(null);
        setTrialLoaded(true);
      });
  }, [actor, isFetching, principalId]);

  // Derive free trial status
  const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
  const trialEndsAt: Date | null =
    trialStartMs !== null ? new Date(trialStartMs + TRIAL_DURATION_MS) : null;

  const isInFreeTrial: boolean =
    !isAdmin && trialEndsAt !== null && trialEndsAt.getTime() > Date.now();

  const isPaidSubscribed: boolean =
    paidUntil !== null && paidUntil > new Date();

  const isSubscribed: boolean = isAdmin || isPaidSubscribed || isInFreeTrial;

  // No-op kept for API compatibility
  const handlePaymentSuccess = useCallback(
    async (_sessionId: string): Promise<boolean> => {
      return false;
    },
    [],
  );

  const subscribe = useCallback(async (): Promise<void> => {
    const keyId = localStorage.getItem("razorpay_key_id");
    if (!keyId || !keyId.trim()) {
      toast.error(
        "Please re-enter your Razorpay Key ID in Admin Panel → Settings to enable payments on this device.",
      );
      return;
    }

    setIsSubscribing(true);

    try {
      await loadRazorpayScript();

      const RazorpayConstructor = (
        window as unknown as Record<
          string,
          new (
            options: unknown,
          ) => { open: () => void }
        >
      ).Razorpay;

      if (!RazorpayConstructor) {
        toast.error("Failed to load payment SDK. Please try again.");
        setIsSubscribing(false);
        return;
      }

      const options = {
        key: keyId.trim(),
        amount: 100, // paise = ₹1
        currency: "INR",
        name: "Pulse Social",
        description: "Weekly Subscription – ₹1/week",
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#000000",
        },
        handler: (_response: unknown) => {
          // Payment successful — activate subscription for 7 days
          if (principalId) {
            const newPaidUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
            writeSubscription(principalId, { paidUntil: newPaidUntil });
            setPaidUntil(new Date(newPaidUntil));
          }
          setIsSubscribing(false);
          toast.success("Subscription activated! Welcome to Pulse Social");
        },
        modal: {
          ondismiss: () => {
            setIsSubscribing(false);
          },
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      toast.error("Failed to open payment. Please try again.");
      setIsSubscribing(false);
    }
  }, [principalId]);

  return {
    isSubscribed,
    isSubscribing,
    paidUntil,
    isInFreeTrial,
    trialEndsAt,
    trialLoaded,
    handlePaymentSuccess,
    subscribe,
  };
}
