# Pulse Social

## Current State
Full-stack social media app on ICP with:
- Internet Identity authentication
- User profiles with avatar, bio, follower/following stats, dark mode preference
- Feed (posts from followed users), Explore (all posts + people to follow), post interactions (like, comment, image upload)
- Admin Panel with tabs: Posts, Users, Activity (user activity tracking + anonymous visitor counter with 7-day bar chart), Settings (Razorpay Key ID stored in backend)
- Subscription paywall: 7-day free trial for new users, then ₹1/week via Razorpay checkout
- Black and white theme with dark mode toggle (moon/sun icon in nav)
- Animated silver shimmer on Pulse logo
- Nav shows trial countdown badge or Active/Subscribe status
- Dismissible trial expiry banner
- Visitor tracking (page views, daily breakdown)
- "Open in browser" notice when in-app browser (webview) is detected

## Requested Changes (Diff)

### Add
- "Open in browser" detection and notice for users opening the app inside in-app browsers (Threads, Instagram, WhatsApp, etc.) -- show a prominent banner/modal telling them to open in Chrome/Safari/Firefox to log in

### Modify
- Full rebuild from scratch preserving all existing features

### Remove
- Nothing

## Implementation Plan
1. Select components: authorization, blob-storage, stripe (replaced by Razorpay frontend-only), user-approval not needed
2. Generate Motoko backend with all social features + subscription + activity tracking + Razorpay key storage
3. Build frontend with all features including in-app browser detection notice
