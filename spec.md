# Pulse Social

## Current State
The app has a full social media platform with feed, explore, profiles, admin panel, and subscription system. There is no dedicated sharing page or shareable link card with the app logo.

## Requested Changes (Diff)

### Add
- A `/share` route that renders a standalone sharing page
- The sharing page displays the Pulse Social logo (silver shine icon + wordmark), a short tagline, the app URL as a copyable link, and a "Copy Link" button with success feedback
- A "Share App" button in the TopNav dropdown menu (visible to all logged-in users) that navigates to `/share`
- The share page also includes social share shortcuts (WhatsApp, Twitter/X, copy) with the app URL

### Modify
- TopNav dropdown: add a "Share App" menu item above the Sign out button
- Router: add the `/share` route

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/pages/SharePage.tsx` — standalone page with logo, tagline, app URL display, copy-to-clipboard button, and social share buttons (WhatsApp, Twitter/X)
2. Add `/share` route to the router in `App.tsx`
3. Add "Share App" dropdown item to `TopNav.tsx` dropdown menu
4. The share page should work for both logged-in and logged-out users (no subscription gate needed)
