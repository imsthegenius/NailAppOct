# App Store Compliance Audit — NailGlow (2025-10-04)

## Executive Summary
- **Status:** Not review-ready. One critical blocker and three additional must-fix issues remain before submission to Apple.
- **Blocking defect:** Release builds short-circuit into a diagnostic "Boot OK" placeholder, so reviewers cannot reach the actual app experience (Guideline 2.1 — App Completeness).
- **Additional must-fix items:** Remove the unused Face ID permission, complete Supabase account deletion by removing the `auth.users` record, and surface an in-app "Manage Subscriptions" deep link.
- **High-priority improvements:** Stop persisting base64 photos in AsyncStorage, gate verbose logging for production, and double-check that customer support flows cover AI proxy outages.
- **Positive findings:** Camera/photo permissions are accurate, ATS restricts traffic to HTTPS + declared domains, auth tokens use iOS Keychain, RevenueCat powers IAP with restore support, and privacy/legal screens ship in-app.

## Must-Fix Before Submission

### 1. Release build returns a diagnostic stub
- **Guideline:** 2.1 — App Completeness
- **Evidence:** `FORCE_RELEASE_BOOT_OK` short-circuits non-DEV builds to a static `<Text>Boot OK</Text>` view, bypassing the rest of the navigator.【F:nail-app-mobile/App.tsx†L31-L74】
- **Impact:** App Review cannot exercise any feature; the binary will be rejected as non-functional.
- **Action:** Remove the guard or flip it to `false` so release builds load the actual navigation stack before cutting a submission build.

### 2. Face ID permission declared without biometric auth
- **Guideline:** 5.1.1 — Data Collection & Storage
- **Evidence:** `NSFaceIDUsageDescription` is declared in both Expo configs, but no Face ID / LocalAuthentication usage exists in the codebase.【F:app.json†L18-L46】【F:nail-app-mobile/app.json†L18-L46】
- **Impact:** Apple flags unused sensitive permissions and may reject the build for misleading Info.plist entries.
- **Action:** Either remove the Face ID usage description from both `app.json` files or ship real biometric authentication via `expo-local-authentication` and a lock screen.

### 3. Account deletion leaves the Supabase auth user intact
- **Guideline:** 5.1.1 — Account Deletion
- **Evidence:** The client clears tables and local storage but never deletes `auth.users` after calling the RPC. The SQL itself documents the gap.【F:nail-app-mobile/screens/DeleteAccountScreen.tsx†L64-L142】【F:nail-app-mobile/supabase/12_account_deletion.sql†L66-L160】
- **Impact:** Apple requires complete account removal, including credentials. Users remain able to authenticate, which fails guideline 5.1.1.
- **Action:** Add a trusted backend (Edge Function / API route) that calls Supabase's Admin API to delete the auth user once the RPC succeeds, then invoke that endpoint from `performAccountDeletion`.

### 4. No in-app "Manage Subscriptions" deep link
- **Guideline:** 3.1.1 — In-App Purchase
- **Evidence:** The profile screen exposes upgrade/restore flows but no navigation option to `itms-apps://apps.apple.com/account/subscriptions` for subscription management.【F:nail-app-mobile/screens/ProfileScreen.tsx†L18-L186】
- **Impact:** Apple expects users to find subscription cancellation inside the app. Missing links are a common review rejection.
- **Action:** Add a prominent "Manage Subscription" button (Profile and Delete Account screens) that opens the App Store subscriptions URL.

## High-Priority Improvements (Recommended pre-submission)

1. **Stop caching raw base64 photos in AsyncStorage.** Camera and gallery flows persist full-resolution images under `pendingPhoto`, leaving personal content unencrypted at rest.【F:nail-app-mobile/screens/CameraScreen.tsx†L102-L200】 Use a short-lived file path via `expo-file-system` or keep the payload in memory/navigation params.
2. **Gate verbose logs for production.** Camera, Gemini proxy, and AI transforms log detailed payload metadata regardless of build type.【F:nail-app-mobile/screens/CameraScreen.tsx†L54-L157】【F:nail-app-mobile/lib/geminiService.ts†L104-L190】 Wrap these with `if (__DEV__)` or remove them for release to avoid leaking usage telemetry.
3. **Document proxy failure handling.** `testProxyConnection`/Gemini requests assume the Cloudflare worker is reachable and surface console errors only.【F:nail-app-mobile/lib/checkSupabase.ts†L1-L62】【F:nail-app-mobile/lib/geminiService.ts†L104-L190】 Ensure the UI communicates outages so support can point reviewers to expected behavior.
4. **Android storage permission audit.** The Android manifest (via Expo config) still declares legacy external storage permissions.【F:app.json†L48-L59】 Confirm they are required post-SDK 33 or remove them to satisfy Play Store parity before the next dual-platform submission.

## Verified Compliance & Supporting Controls

- **Secure token handling:** Authentication storage uses an iOS Keychain-backed adapter with AsyncStorage fallbacks only when SecureStore is unavailable (Expo Go), satisfying Apple’s secure credential expectations.【F:nail-app-mobile/lib/keychainStorage.ts†L20-L128】
- **Network security:** ATS blocks arbitrary HTTP and only whitelists Supabase/Cloudflare domains plus localhost for development.【F:app.json†L23-L43】
- **In-app purchases:** RevenueCat integration provides product fetching, purchase, and restore flows, and updates Supabase with entitlement status.【F:nail-app-mobile/lib/revenuecat.ts†L1-L137】【F:nail-app-mobile/screens/UpgradeScreen.tsx†L1-L112】
- **Privacy & legal disclosures:** Dedicated screens surface Privacy Policy and Terms with contact details and retention statements, meeting guideline 5.1 content expectations.【F:nail-app-mobile/screens/PrivacyPolicyScreen.tsx†L21-L124】【F:nail-app-mobile/screens/TermsOfServiceScreen.tsx†L21-L148】
- **Email/password auth only:** Login relies solely on Supabase email/password (plus optional proxy), so Sign in with Apple is not yet triggered.【F:nail-app-mobile/screens/LoginScreen.tsx†L1-L120】
- **Permission prompts match functionality:** Camera and photo library usage strings describe the actual capture and save flows.【F:app.json†L18-L22】

## Next Steps Checklist

1. Remove the release short-circuit and produce a testable archive build.
2. Decide between dropping Face ID or adding biometric auth, then update both Expo configs accordingly.
3. Implement the Supabase Admin deletion step and retest account removal end-to-end (include backend logs in review notes).
4. Add "Manage Subscription" deep links and mention them in App Review notes.
5. Refactor camera/gallery persistence and strip production logs before cutting the next build.
6. Re-run lint/type-check plus on-device smoke tests once the fixes land, capturing updated screenshots for App Store Connect.
