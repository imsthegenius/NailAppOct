# NailGlow – Subscriptions & RevenueCat Integration Plan

This document tracks everything required to launch subscriptions using RevenueCat, including items already completed and what remains. Use it as the single source of truth while we integrate and ship.

## Status Legend
- [x] Completed
- [~] In progress
- [ ] Not started

## 1) App Store Connect Setup (Apple)
- [x] Create Subscription Group: “NailGlow Membership” (internal name)
- [x] Create auto‑renewable subscriptions (products)
  - `com.nailglow.premium.monthly`
  - `com.nailglow.premium.yearly`
- [ ] Add localized display names/descriptions and review screenshots if required by Apple
- [ ] Submit IAPs for review or include them in the app’s next submission
- [ ] Add Sandbox Testers in App Store Connect and sign into device with tester Apple ID

Notes:
- Group holds mutually exclusive tiers/periods. Keep group name stable and generic.

## 2) RevenueCat Project Setup
- [x] Create a RevenueCat project and retrieve Public SDK Key (iOS)
  - Example provided: `appl_…`
- [x] Add Store App (Apple) with correct bundle identifier
- [x] Add Products: map App Store products to RevenueCat
  - `com.nailglow.premium.monthly`
  - `com.nailglow.premium.yearly`
- [x] Create Entitlement: `premium`
- [x] Create Offering (e.g., `default`) and set as Current
  - Add packages for Monthly and Annual mapped to the products above
- [ ] (Optional) Connect App Store Connect API credentials for improved metadata syncing
- [~] (Recommended) Create Webhook + secret to notify backend of renewals/refunds/expirations
  - Endpoint added: `nail-app-mobile/supabase/functions/revenuecat-webhook.sql` *(planned serverless route)*
  - Add `REVENUECAT_WEBHOOK_SECRET` in `nail-app-mobile/.env`

## 3) Supabase Data Model & Policies
- [x] Add subscription fields to `users` table
  - See: `nail-app-mobile/supabase_updates_payments_fixed.sql:16`
  - Fields: `subscription_status TEXT DEFAULT 'free'`, `subscription_plan TEXT`
- [ ] Ensure RLS policy allows authenticated users to update only their own subscription fields
  - Example policy snippet to adapt if RLS is enabled on `public.users`:
    ```sql
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users update own subscription fields" ON users
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
    ```
  - If you prefer server updates only, skip this policy and rely on a server webhook using the service role key.
- [ ] (Optional) Add a secured RPC that updates subscription fields server‑side

## 4) Mobile App Integration (Expo React Native)
- [x] Install SDK (react-native-purchases)
  - `cd nail-app-mobile`
  - `npm i react-native-purchases` (done)
  - `npx expo run:ios` (will generate ios/ and install pods automatically)
- [ ] Enable In‑App Purchases capability in Xcode (target → Signing & Capabilities)
- [x] Add env variables (placeholders added)
  - `nail-app-mobile/.env.example:18`
  - `nail-app-mobile/.env.template:31`
  - Required values to set in `.env` (iOS only for now):
    - `EXPO_PUBLIC_RC_IOS_API_KEY=appl_…`
    - `EXPO_PUBLIC_RC_ENTITLEMENT_ID=premium`
- [x] Initialize RevenueCat on app start and auth changes
  - `nail-app-mobile/App.tsx:11`
- [x] Add client helper for RC init, offerings, purchase/restore, Supabase sync
  - `nail-app-mobile/lib/revenuecat.ts:1`
- [x] Wire Upgrade screen to live offerings and purchase/restore
  - `nail-app-mobile/screens/UpgradeScreen.tsx:1`
- [x] Gate premium features using subscription status
  - Existing gating via `useSubscriptionStatus`: `nail-app-mobile/screens/DesignScreen.tsx:228`
  - Sync path: RevenueCat entitlements → Supabase `users.subscription_status` → app hook
- [ ] Build a custom dev client or release build (Expo Go cannot use IAP)
  - `npx expo run:ios` or use EAS/TestFlight

### 4a) Paywall Strategy
- [x] Preferred: Use RevenueCat Paywalls (you’ve already published one)
  - Keep the current `UpgradeScreen` as a fallback.
  - To switch to RC Paywall UI later, we will:
    - Ensure the project uses the latest `react-native-purchases` (and RC UI bridge if required by their docs).
    - Present the RC paywall from `UpgradeScreen` (placement or identifier configured in the RC dashboard).
    - Close the paywall on purchase/restore and rely on our existing entitlement listener to update UI.
  - Owner action: confirm SDK/UI package requirements per RevenueCat RN Paywalls docs, then I’ll wire the present/dismiss calls.

## 5) Backend Sync (Recommended)
- [~] Implement RevenueCat webhook to keep Supabase in sync for renewals/refunds/expirations
  - Implemented: Next.js API route at `app/api/revenuecat/webhook/route.ts`
  - To finish: set `REVENUECAT_WEBHOOK_SECRET` in env and configure webhook in RevenueCat
  - Behavior: updates `users.subscription_status` to `premium_monthly`/`premium_yearly` or `free` using service role
  - Mapping: inferred from `product_id` containing `month` vs `year|annual`

## 6) QA Test Plan
- [ ] Device setup
  - Install dev client/TestFlight build; sign into App Store with Sandbox tester; sign into app
- [ ] Paywall loads products
  - Upgrade screen shows price strings from App Store
  - `getOfferings()` returns current offering with two packages
- [ ] Purchase flow
  - Buy Monthly; entitlement activates; `users.subscription_status` = `premium_monthly`
  - App gates unlock (colors, shapes) reflect premium
- [ ] Restore flow
  - Delete the app/reinstall → Restore Purchases → status becomes premium again
- [ ] Switch plans (optional)
  - Purchase annual after monthly cancellation window → status becomes `premium_yearly`
- [ ] Sign‑in/out
  - Sign out; ensure no crash; sign in; RevenueCat `logIn(userId)` reconciles and syncs status

## 7) Monitoring & Operations
- [ ] RevenueCat dashboard: monitor charts, active entitlements, customer timelines
- [ ] App logs: verify customer info listener triggers on renewals (for active sessions)
- [ ] (If webhook) log deliveries, retries, and Supabase update results

## Ground Truth in Code (References)
- RC helper: `nail-app-mobile/lib/revenuecat.ts:1`
- App init: `nail-app-mobile/App.tsx:11`
- Upgrade screen: `nail-app-mobile/screens/UpgradeScreen.tsx:1`
- Supabase fields: `nail-app-mobile/supabase_updates_payments_fixed.sql:16`
- Gating example: `nail-app-mobile/screens/DesignScreen.tsx:228`
- Env placeholders: `nail-app-mobile/.env.example:18`, `nail-app-mobile/.env.template:31`

## Open Questions / Decisions
- Client vs webhook updates: We’ll use both.
  - Client: immediate UX updates while the app is open (already wired via `lib/revenuecat.ts`).
  - Webhook: server-of-record updates on renewals/refunds while the app is closed (added route above).
- Final naming for offering (keep `default`?) and package identifiers in RevenueCat.
- Free trials: Not offered by design (confirmed).

---

Once items in sections 2–4 are fully completed (and 6 is verified), subscriptions are functionally ready for production. Section 5 is strongly recommended before launch to ensure backend truth during renewals and refunds.
