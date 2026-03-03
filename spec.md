# Pulse Social

## Current State

- Stripe is wired in as the payment provider (backend `stripe/stripe.mo`, frontend `useSubscription.ts`, `SubscriptionGate.tsx`, `AdminPage.tsx` Settings tab).
- Subscription is ₹99/week; checkout redirects to Stripe, verifies session on return.
- Admin Panel Settings tab allows saving Stripe secret key and allowed countries.
- All payment UI references "Stripe".

## Requested Changes (Diff)

### Add
- Razorpay backend module (`src/backend/razorpay/razorpay.mo`) that:
  - Stores a Razorpay configuration (key_id + key_secret).
  - Creates a Razorpay Order via HTTP outcall to `https://api.razorpay.com/v1/orders`.
  - Verifies payment signature via HMAC-SHA256 on `razorpay_order_id|razorpay_payment_id`.
- Backend actor methods: `isRazorpayConfigured`, `setRazorpayConfiguration`, `createRazorpayOrder`, `verifyRazorpayPayment`.
- Frontend Razorpay checkout flow using Razorpay's JS SDK (`https://checkout.razorpay.com/v1/checkout.js`) loaded dynamically.
- Frontend `useRazorpaySubscription` hook replacing `useSubscription`.
- Admin Settings tab updated to show Razorpay Key ID + Key Secret fields instead of Stripe fields.

### Modify
- `main.mo`: remove Stripe imports/methods, add Razorpay methods.
- `useSubscription.ts`: replace Stripe checkout call with Razorpay order creation + JS SDK popup.
- `SubscriptionGate.tsx`: update copy — remove "Secured via Stripe", show "Secured via Razorpay · UPI, Cards, Net Banking".
- `AdminPage.tsx` Settings tab: replace Stripe fields/instructions with Razorpay Key ID + Key Secret fields and Razorpay setup instructions.
- `TopNav.tsx`: no functional change needed (already calls `subscribe` from hook).

### Remove
- `src/backend/stripe/stripe.mo` usage from `main.mo` (keep file but stop importing it since Caffeine manages the directory; just remove the import and usage).
- Stripe-specific backend methods: `isStripeConfigured`, `setStripeConfiguration`, `createCheckoutSession`, `getStripeSessionStatus`.

## Implementation Plan

1. Create `src/backend/razorpay/razorpay.mo` with order creation (HTTP outcall to Razorpay API with Basic Auth using key_id:key_secret) and payment signature verification.
2. Update `main.mo`: remove Stripe import/methods, add Razorpay config storage and delegate to the new module.
3. Update `backend.d.ts` bindings to reflect new actor interface.
4. Update `useSubscription.ts`: call `createRazorpayOrder`, load Razorpay JS SDK dynamically, open checkout popup; on `payment.captured` callback call `verifyRazorpayPayment`, then store subscription locally.
5. Update `SubscriptionGate.tsx`: replace Stripe copy with Razorpay, check `isRazorpayConfigured` instead of `isStripeConfigured`.
6. Update `AdminPage.tsx` Settings tab: replace Stripe fields with Razorpay Key ID + Key Secret; update setup instructions to link razorpay.com.
