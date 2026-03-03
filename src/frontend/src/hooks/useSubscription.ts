import { useCallback, useEffect, useState } from "react";
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
  localStorage.setItem(getStorageKey(principalId), JSON.stringify(record));
}

export function useSubscription(isAdmin: boolean) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() ?? null;

  const [paidUntil, setPaidUntil] = useState<Date | null>(() => {
    if (!principalId) return null;
    const record = readSubscription(principalId);
    if (!record || record.paidUntil <= Date.now()) return null;
    return new Date(record.paidUntil);
  });

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

  const isSubscribed: boolean =
    isAdmin || (paidUntil !== null && paidUntil > new Date());

  const handlePaymentSuccess = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!actor || !principalId) return false;
      try {
        const status = await actor.getStripeSessionStatus(sessionId);
        if (status.__kind__ === "completed") {
          const newPaidUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
          writeSubscription(principalId, { paidUntil: newPaidUntil });
          setPaidUntil(new Date(newPaidUntil));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [actor, principalId],
  );

  const subscribe = useCallback(async (): Promise<void> => {
    if (!actor) return;
    const successUrl = `${window.location.origin}/?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/`;
    const items = [
      {
        productName: "Pulse Social Weekly",
        currency: "inr",
        quantity: 1n,
        priceInCents: 9900n,
        productDescription: "1 week access to Pulse Social",
      },
    ];
    const checkoutUrl = await actor.createCheckoutSession(
      items,
      successUrl,
      cancelUrl,
    );
    window.location.href = checkoutUrl;
  }, [actor]);

  return {
    isSubscribed,
    paidUntil,
    handlePaymentSuccess,
    subscribe,
  };
}
