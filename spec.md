# Pulse Social

## Current State

The app tracks activity only for **authenticated users** (those who have logged in via Internet Identity). The `recordVisit` function requires a valid user principal. Anonymous visitors who open the app link but have not signed up are completely invisible to the admin.

The Admin Panel has four tabs: Posts, Users, Settings (Razorpay), and Activity (shows per-user last seen + visit count for registered users only).

## Requested Changes (Diff)

### Add
- **Anonymous visitor counter** -- backend stores a global counter of total app opens and a daily breakdown, callable without authentication.
- **`recordAnonymousVisit` backend function** -- increments total page views and records the timestamp bucketed by day (UTC). Public, no auth required.
- **`getVisitorStats` backend query** -- admin-only; returns total visits, unique session count (estimated via session tokens stored client-side), and a daily visit breakdown for the last 30 days.
- **Visitor Stats section in Admin Panel Activity tab** -- new stat cards above the existing user activity table: "Total Page Views", "Today's Views", "This Week's Views", and a simple daily bar chart for the last 7 days.
- Frontend calls `recordAnonymousVisit` on every page load (before and after login), replacing the current `recordVisit` which is authenticated-only.

### Modify
- **Stats row in Admin Panel** -- add a "Total Views" stat card alongside existing cards.
- **Activity tab** -- add a Visitor Stats section at the top with breakdown cards and a 7-day trend.

### Remove
- Nothing removed.

## Implementation Plan

1. **Backend (`main.mo`)**: Add `totalPageViews : Nat` counter and `dailyViews : Map<Text, Nat>` (key = "YYYY-MM-DD" from nanosecond timestamp). Add public `recordAnonymousVisit()` that increments both. Add admin-only `getVisitorStats()` returning `{ totalViews: Nat; todayViews: Nat; weekViews: Nat; dailyBreakdown: [(Text, Nat)] }`.
2. **Frontend `App.tsx`**: Call `recordAnonymousVisit()` on every mount (unauthenticated and authenticated), replacing the existing authenticated `recordVisit` for the anonymous counting use-case. Keep `recordVisit` for per-user activity tracking.
3. **Frontend `AdminPage.tsx`**: In the Activity tab, fetch visitor stats and render: three stat cards (Total Views, Today, This Week) and a 7-day bar chart using inline SVG or a simple bar layout with Tailwind. Also add "Total Views" card to the top stats row.
