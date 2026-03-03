# Pulse Social

## Current State
Pulse Social is a full-stack social media app with:
- Internet Identity authentication
- Feed, Explore, Profile, and Admin pages
- Posts, likes, comments, follows
- Blob-storage for image uploads
- Authorization/role-based access control (admin role)
- No payment or subscription system

## Requested Changes (Diff)

### Add
- Stripe weekly subscription: $1/week recurring payment
- Backend subscription tracking: store each user's subscription status and expiry timestamp
- Backend functions: `getSubscriptionStatus`, `recordSubscriptionSuccess`, `checkSubscriptionActive`
- Subscription gate: logged-in users without an active subscription are shown a paywall modal/page before accessing the feed, explore, or profile features
- Payment UI: a subscription modal/page with Stripe Checkout integration showing "$1 / week" pricing, triggered when access is blocked
- After successful payment, subscription is marked active for 7 days
- Admins bypass the subscription gate

### Modify
- App routing/layout: wrap protected routes (Feed, Explore, Profile) with subscription check; redirect/block if subscription is not active
- TopNav: show subscription status badge or "Subscribe" button for logged-in users without active subscription

### Remove
- Nothing removed

## Implementation Plan
1. Select Stripe component to install payment infrastructure
2. Regenerate Motoko backend to add:
   - `subscriptions` stable map: principal -> { paidUntil: Int }
   - `getSubscriptionStatus()` -> returns { isActive: Bool; paidUntil: ?Int }
   - `recordSubscriptionSuccess(durationSeconds: Nat)` -> () -- called after Stripe confirms payment (7 days = 604800 seconds)
   - Admin check bypasses subscription gate
3. Frontend:
   - `useSubscription` hook: queries `getSubscriptionStatus`, re-fetches on login
   - `SubscriptionGate` component: wraps protected content; if user logged in and no active subscription, renders `SubscriptionModal`
   - `SubscriptionModal`: fullscreen paywall with Stripe Checkout button for $1/week plan, success handler calls `recordSubscriptionSuccess` then refetches status
   - Wrap Feed, Explore, Profile routes in `SubscriptionGate`
   - TopNav: show "Active" badge or "Subscribe" CTA based on subscription state
