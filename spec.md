# Pulse Social

## Current State
Full social media app with feed, explore, profiles, posting, likes, comments, admin panel, and a ₹1/week subscription gate powered by Razorpay. The Razorpay Key ID is currently stored in browser localStorage, meaning it only persists on the device where it was entered and is lost if the browser data is cleared.

## Requested Changes (Diff)

### Add
- `setRazorpayKeyId(keyId: Text)` backend method — admin-only, stores the Razorpay Key ID in stable backend state
- `getRazorpayKeyId()` backend query — returns `?Text`, callable by any authenticated user (needed to load the key for payment)

### Modify
- Admin Panel → Settings tab: save/load the Razorpay Key ID via backend calls instead of localStorage
- `useSubscription` hook: fetch the Razorpay key from the backend instead of localStorage when initiating payment
- `isRazorpayConfigured` helper: check backend for key presence rather than localStorage

### Remove
- All localStorage reads/writes for `razorpay_key_id`

## Implementation Plan
1. Add `razorpayKeyId : ?Text` stable variable to backend
2. Add `setRazorpayKeyId` (admin-only) and `getRazorpayKeyId` (query) methods to backend
3. Update `AdminPage.tsx` RazorpaySettingsTab to call `actor.setRazorpayKeyId` on save and `actor.getRazorpayKeyId` on load
4. Update `useSubscription.ts` to call `actor.getRazorpayKeyId()` before opening Razorpay checkout
5. Remove all `localStorage.getItem/setItem("razorpay_key_id")` references
