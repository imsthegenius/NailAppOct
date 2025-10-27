# App Store Compliance Audit — NailGlow (2025-10-11)

## Executive Summary
- The previously identified blocking issues are resolved, but new gaps remain before the app is submission-ready. Two items qualify as **blocking** under Apple guidelines: the lack of an accessible account-deletion affordance and misleading references to Apple/Google sign-in.
- Several **high-priority** UX/IAP issues need tightening—most notably the paywall’s hard-coded fallback pricing and missing subscription disclosures that Apple routinely checks during review.
- Overall craftsmanship is solid (secure auth storage, new Supabase Edge Function, Manage Subscription deep link), yet the areas below should be addressed quickly to avoid rejection and polish the experience to the “iOS26” visual bar.

## Blocking Issues

### 1. Account deletion flow is not discoverable
- **Guideline:** 5.1.1(v) — Users must be able to delete their account from within the app.
- **Evidence:** Although `DeleteAccountScreen` is wired and the Supabase Edge Function now removes the auth record, there is no UI navigation to the route. `ProfileScreen` only exposes “My Space,” “Settings,” and “Subscription” cards with informational rows—no “Delete account” entry or CTA.【nail-app-mobile/screens/ProfileScreen.tsx:169-217】 A project-wide search shows no `navigation.navigate('DeleteAccount')` call.
- **Impact:** Reviewers will fail the guideline because users cannot locate the delete affordance without a deep link or manual navigation override.
- **Recommendation:** Add a dedicated “Delete Account” row/button in Profile > Settings (or an equivalent path) that leads directly to `DeleteAccountScreen`. Ensure it is visually on-par with other actions and reachable in ≤2 taps.

### 2. Onboarding advertises Apple/Google login without providing those flows _(Resolved 2025-10-26)_
- **Guidelines:** 4.8 & 5.1.1 — Apps offering third-party sign-in must implement Sign in with Apple and cannot mislead users about available authentication methods.
- **Evidence (original):** The final onboarding slide rendered “Apple” and “Google” buttons with platform icons while routing users to email signup; no SIWA workflow existed in `LoginScreen.tsx`.
- **Current state:** Onboarding & Login now call the new `signInWithApple()` helper which performs nonce-based SIWA and falls back gracefully when Apple returns an “unknown” error. The Google affordance was removed.
- **Recommendation:** None—keep Smoke testing SIWA (device + simulator) to ensure the fallback path stays green.

## High-Priority Issues

### 3. Paywall displays hard-coded fallback prices and misses mandatory disclosures
- **Guideline:** 3.1.2 & App Store Review FAQ — price shown in-app must match App Store Connect metadata; subscription screens must describe auto-renew details and management links.
- **Evidence:** `UpgradeScreen` falls back to `'£9.99'` and `'£29.99'` when RevenueCat has not loaded products, which produces stale or incorrect pricing for non-GBP locales.【nail-app-mobile/screens/UpgradeScreen.tsx:85-95】 The screen also omits the required copy about auto-renewal, cancellation, and post-purchase management.
- **Recommendation:** Hide purchase CTAs until `priceString` is available, localise pricing via RevenueCat metadata, and add the standard subscription disclosure (duration, auto-renew clause, cancellation path, privacy/terms links).

### 4. Restore/Not-now buttons remain active during purchase attempts
- **Observation:** When `handlePurchase` sets `loading` state, the Restore and Not now buttons remain tappable; the plan card re-renders “Loading” but the CTA stays active.【nail-app-mobile/screens/UpgradeScreen.tsx:39-110】 Users can trigger overlapping purchase/restore flows, creating risk of duplicate prompts or half-finished transactions.
- **Recommendation:** Disable secondary actions while a purchase/restore is in progress and surface a spinner/toast so the flow feels deliberate.

### 5. Feed look caching can grow unbounded
- **Evidence:** `FeedScreen.ensureCachedAssets` eagerly downloads every transformed/original image to `FileSystem.cacheDirectory` but never trims or prunes the directory.【nail-app-mobile/screens/FeedScreen.tsx:120-214】 Large collections will accumulate hundreds of MBs, potentially leading to App Store rejection under “excessive storage”.
- **Recommendation:** Introduce cache limits (e.g., LRU eviction after N files/MB) or reuse React Native FastImage-style caching to keep footprint predictable.

### 6. Edge Function security hardening
- **Evidence:** The new `delete-auth-user` edge function validates the caller and user match, but it also exposes `Access-Control-Allow-Origin: *` and returns a generic 500 if the service-role key is missing.【supabase/functions/delete-auth-user/index.ts:1-82】 Apple’s App Review team often checks for overly permissive CORS on account-deletion endpoints.
- **Recommendation:** Restrict CORS to the production domain(s) and add structured error responses/logging for deployment misconfigurations.

## Additional UX / Quality Risks
- **Processing memory pressure:** `ProcessingScreen` rehydrates base64 via `FileSystem.readAsStringAsync` for every transformation, duplicating large payloads in JS memory.【nail-app-mobile/screens/ProcessingScreen.tsx:94-144】 Consider streaming uploads or passing URIs to the Gemini proxy to keep mid-range devices responsive.
- **Connection banner loops:** `App.tsx` pings Supabase and Google on launch and logs errors in production when the proxy is down.【nail-app-mobile/App.tsx:68-145】 Add exponential backoff or rate-limiting so spotty networks don’t flood the console/retry loop.
- **Profile design polish:** The refreshed cream + pink profile screen looks visually aligned, but text contrast for secondary copy (`rgba(193,25,97,0.7)`) is borderline for accessibility. Consider bumping contrast and ensuring the “Upgrade” CTA respects dynamic type.【nail-app-mobile/screens/ProfileScreen.tsx:275-356】

## Positive Controls
- ✅ Account deletion now removes both application data and the Supabase auth user via the edge function, satisfying Guideline 5.1.1.【supabase/functions/delete-auth-user/index.ts:1-82】【nail-app-mobile/screens/DeleteAccountScreen.tsx:35-210】
- ✅ Manage Subscriptions deep link lives on both Profile and Delete Account screens, guiding users to Apple’s cancellation UI.【nail-app-mobile/screens/ProfileScreen.tsx:213-223】【nail-app-mobile/screens/DeleteAccountScreen.tsx:35-210】
- ✅ Base64 nail photos are no longer persisted in AsyncStorage; flows now rely on URIs with optional in-memory conversion only.【nail-app-mobile/screens/CameraScreen.tsx:106-210】【nail-app-mobile/screens/ProcessingScreen.tsx:85-152】
- ✅ `RevenueCat` integration syncs entitlements back to Supabase and logs in returning users, keeping server state aligned with purchase status.【nail-app-mobile/lib/revenuecat.ts:1-120】

## Next Steps
1. Add a prominent Delete Account entry point and verify it is reachable within two taps.
2. Remove or implement the Apple/Google onboarding buttons—if kept, integrate real SIWA/Google auth.
3. Redesign the paywall copy to remove price fallbacks and include Apple’s required subscription language; disable controls while purchases/restores execute.
4. Add cache pruning to `FeedScreen` so downloads don’t balloon storage usage during review testing.
5. Tighten the account-deletion edge function’s CORS policy and deployment checks.
6. Run `npm run lint`, `npm run type-check`, and device smoke tests (paywall, account deletion, camera pipeline) once the fixes land; attach updated screenshots for App Store Connect.
