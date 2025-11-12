# Internal Testing: Paywall Disabled — Runbook (10 Nov 2025)

Goal
- Enable premium UI for internal testing where IAP is unavailable (Ad Hoc) or while waiting for TestFlight install.

What changed
- Added an environment flag to bypass the paywall in the mobile app:
  - `EXPO_PUBLIC_DISABLE_PAYWALL=1`
- Code path already respects this flag via `nail-app-mobile/lib/paywall.ts` and `useSubscriptionStatus`, so UI unlocks without RevenueCat.
- `UpgradeScreen` auto-closes when the paywall is disabled and avoids the “Subscriptions unavailable” alert.

How to enable (internal only)
- Edit `nail-app-mobile/.env` and add:
  - `EXPO_PUBLIC_DISABLE_PAYWALL=1`
- Push an OTA to your internal channel (TestFlight):
  - From `nail-app-mobile/`: `npm run update:testflight`

Why this works
- Ad Hoc builds cannot use IAP; TestFlight builds support StoreKit/RevenueCat and embed `expo-updates`.
- Once TestFlight is installed, OTA updates can be shipped to the same app instance in seconds without burning build quota.

Rollback
- If an OTA breaks something, roll back immediately:
  - `npx eas update --rollback --branch testflight` (for the internal channel)
  - Or for production: `npx eas update --rollback --branch production`
- To re-enable the paywall in future OTAs, set `EXPO_PUBLIC_DISABLE_PAYWALL=0` (or remove the line) and push a new update.

Verification checklist
- Open app (TestFlight build), navigate features previously behind paywall (e.g., alternate shapes, premium flows) — available without redirecting to Upgrade.
- `Profile` shows status as “Premium” (driven by `useSubscriptionStatus`).
- `Upgrade` route immediately dismisses without showing RevenueCat paywall UI.

Notes
- The flag is public (non-secret) and safe to include in `.env.template`.
- Production OTAs must not include this flag set to `1`.
- For local Expo Go sessions, paywall is also disabled automatically (by design) to speed up dev.
