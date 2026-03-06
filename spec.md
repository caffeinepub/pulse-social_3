# Pulse Social

## Current State
Full social media app with Internet Identity auth, posts/follows/likes/comments, Razorpay ₹1/week subscription, admin panel with Settings/Users/Posts/Activity tabs, dark mode sync, free trial tracking, visitor analytics, share page with QR code.

The backend currently uses in-memory Maps (not stable), so all data including admin roles, Razorpay key, dark mode prefs, login records, and activity data is lost on every canister upgrade/redeploy. This means admin access is lost after every deployment, and users see "Access Denied, user not found" errors.

## Requested Changes (Diff)

### Add
- Nothing new UI-wise

### Modify
- **Backend**: Convert ALL in-memory Maps to stable storage so data persists across upgrades. Specifically:
  - `accessControlState` (userRoles map + adminAssigned flag) must be stable
  - `razorpayKeyId` must be stable var
  - `stripeConfig` must be stable var  
  - `darkModePreferences` map must be stable
  - `loginRecords` map must be stable
  - `lastSeenRecords` map must be stable
  - `visitCounts` map must be stable
  - `userProfiles` map must be stable

### Remove
- Nothing

## Implementation Plan
1. Regenerate the Motoko backend with all state declared as `stable` so it survives upgrades.
2. Keep all existing endpoints and logic exactly the same.
3. No frontend changes needed.
