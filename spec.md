# Pulse Social

## Current State
- Subscription is tracked in browser localStorage with a `paidUntil` timestamp per principal
- New users see a paywall immediately on login with "1st week free for new users" messaging but the free trial is not actually enforced/tracked
- The SubscriptionGate blocks all logged-in users without an active subscription record
- Backend has no awareness of user sign-up timestamps or trial periods

## Requested Changes (Diff)

### Add
- Backend: `recordFirstLogin(principal)` — stores the timestamp of a user's first ever login, only writes once per principal
- Backend: `getFirstLoginTime()` — returns the first login timestamp for the caller, or null if never recorded
- Frontend: On every login, call `recordFirstLogin` so the timestamp is persisted
- Frontend: In `useSubscription`, fetch `getFirstLoginTime()` and treat users within 7 days of first login as "subscribed" (free trial)
- Frontend: Show a "Free trial active — X days remaining" indicator to trial users in TopNav or SubscriptionGate

### Modify
- `useSubscription.ts` — add `isInFreeTrial` and `trialEndsAt` derived state; include trial users in `isSubscribed`
- `SubscriptionGate.tsx` — show trial users the app (no paywall), display a soft banner about trial ending
- `TopNav.tsx` — show "Trial: X days left" badge instead of "Subscribe" for trial users

### Remove
- Nothing removed
