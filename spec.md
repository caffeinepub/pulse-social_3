# Pulse Social

## Current State
The app is a full-stack social media platform with posts, follows, likes, comments, user profiles, subscriptions (Razorpay ₹1/week), dark mode synced to backend, and an Admin Panel with Posts, Users, and Settings tabs.

The backend tracks `loginRecords` (first login timestamp per principal) and `userProfiles`. There is no tracking of how many times a user has visited the app or when they were last seen.

The Admin Panel has no activity-monitoring tab.

## Requested Changes (Diff)

### Add
- Backend: `lastSeenRecords` map (Principal → Int nanoseconds) to track the most recent visit timestamp per user
- Backend: `visitCounts` map (Principal → Int) to count total visits per user
- Backend: `recordVisit()` — shared update method called on every app load for authenticated users; updates lastSeenRecords and increments visitCounts
- Backend: `getActivityData()` — admin-only query that returns an array of activity records: `{ principalId: Text; lastSeen: Int; visitCount: Int }` for all users who have visited
- Admin Panel frontend: New "Activity" tab (4th tab) showing a table with columns: User avatar+name, Last Seen (human-readable relative time), Total Visits, and a status badge (Active: visited in last 24h; Recent: last 7 days; Inactive: older)
- Admin Panel stats row: Add "Active Today" stat card showing count of users seen in the last 24 hours

### Modify
- App.tsx: Call `actor.recordVisit()` on every authenticated session load (not just first login), fire-and-forget

### Remove
- Nothing removed

## Implementation Plan
1. Backend: Add `lastSeenRecords` and `visitCounts` maps; add `recordVisit()` (updates both maps, callable by any authenticated user); add `getActivityData()` (admin only, returns array of `{ principalId; lastSeen; visitCount }`)
2. Frontend App.tsx: Add a `useEffect` that calls `actor.recordVisit()` whenever actor+identity are ready (every session, not just first login)
3. Frontend AdminPage.tsx: Add a 4th "Activity" tab with a table of user activity data fetched via `actor.getActivityData()`, with columns for user info (looked up from socialStore profiles), last seen (relative), visit count, and activity badge; add "Active Today" to the stats grid
