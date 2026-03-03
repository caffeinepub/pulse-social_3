# Pulse Social

## Current State
- Admin Panel has two tabs: Posts and Users
- Stripe configuration (`secretKey`, `allowedCountries`) is set via `setStripeConfiguration` backend call but there is no UI to do this
- Backend already supports `isStripeConfigured()` and `setStripeConfiguration()` endpoints

## Requested Changes (Diff)

### Add
- A third "Settings" tab in the Admin Panel
- A Stripe Settings card with:
  - A masked input for the Stripe Secret Key (show/hide toggle)
  - A text input for Allowed Countries (comma-separated, e.g. "IN, US")
  - A Save button that calls `setStripeConfiguration` on the backend
  - A status badge showing whether Stripe is currently configured or not
  - Success/error toast feedback on save

### Modify
- `AdminPage.tsx` -- extend the Tabs component to include a third "Settings" tab
- Tabs list width updated to accommodate three tabs

### Remove
- Nothing

## Implementation Plan
1. Add a Settings tab trigger alongside Posts and Users in AdminPage.tsx
2. Create the Stripe settings form inside the new TabsContent
3. On mount, read `isStripeConfigured()` to show current status
4. On save, call `actor.setStripeConfiguration({ secretKey, allowedCountries })` with parsed country list
5. Show toast on success/error
6. Add show/hide toggle for the secret key field
