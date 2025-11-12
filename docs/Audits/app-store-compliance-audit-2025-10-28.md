# NailGlow iOS App Store Compliance Audit — 28 Oct 2025

## Snapshot
- **Repo branch scanned:** current working tree inside `nail-app-mobile/`
- **Primary build stack:** Expo SDK 53 / React Native 0.79.5, EAS build profiles (`preview`, `payments`, `production`)
- **Device support:** iPhone only (see “iPhone‑only packaging” notes below)
- **Last policy check:** 28 Oct 2025 (Apple App Store Review Guidelines, Privacy Manifest, and build requirements)

### Compliance Heatmap
| Area | Status | Key Notes |
| --- | --- | --- |
| Build & Tooling | ⚠️ Needs work | Xcode 16 + iOS 18 SDK not pinned for `production`; Info.plist minimum OS misaligned with Podfile target. |
| Privacy & Data Use | 🔴 High risk | Privacy manifest lacks collected data types; unused sensitive permissions present; deletion/purge completeness needs proof. |
| Account Management | 🔴 High risk | Account deletion is reachable but end‑to‑end purge (incl. storage) not verified against production. |
| Payments & Subscriptions | ⚠️ Needs work | Restore Purchases relies on modal; add explicit in‑app Restore entry. Manage link is covered. |
| Legal Disclosures | ⚠️ Needs work | In‑app Privacy Policy date stale; ensure EU DSA trader info and contacts in App Store Connect metadata.

## High-Risk Findings

1. **Account deletion not proven end‑to‑end (Guideline 5.1.1)**
   - Evidence: UI is reachable from Profile (“Delete Account” navigates to `DeleteAccount`) and the flow calls `delete_user_account()` plus a Supabase Edge Function to remove the auth user. However, `12_account_deletion.sql` attempts to delete from `storage.objects`, which typically requires service‑role context. If that function isn’t deployed or storage purge isn’t handled server‑side, residual images may remain.
   - Impact: Apple expects account deletion to remove all user data (including remotely stored content). Partial deletion is grounds for rejection.
   - Fix: Ensure `12_account_deletion.sql` is applied in production, and perform storage deletion using a server function with service role. Validate by creating a test account, adding images/looks, deleting, and confirming all rows and objects are removed. Capture a screen recording for review notes.

2. **Privacy manifest omits collected data types (May 2025 requirement)**
   - Evidence: `ios/nailappmobile/PrivacyInfo.xcprivacy` sets `NSPrivacyCollectedDataTypes` to an empty array while the app collects email, photos, and usage data.
   - Impact: Apps must declare collected data types and purposes in the privacy manifest; omission leads to rejection or removal.
   - Fix: Populate collection categories (e.g., Contact Info → Email; User Content → Photos; Identifiers → User ID; Usage Data → Product Interaction) and purposes, exactly matching your App Store privacy questionnaire. Re‑aggregate third‑party SDK manifests.

3. **Deletion flow re‑auth blocks Apple‑only accounts (Guideline 5.1.1)**
   - Evidence: `DeleteAccountScreen.tsx` requires password re‑authentication via `signInWithPassword`. Accounts created with Sign in with Apple won’t have a password, so deletion can fail even with a valid session.
   - Impact: Users must be able to delete the account within the app without undue friction; requiring a non‑existent password will be flagged.
   - Fix: Use the current session token to authorize deletion, or re‑authenticate with Apple (native `expo-apple-authentication`) when the provider is Apple. Keep the “type DELETE” confirmation as the final guard.

4. **Sensitive permissions declared but unused**
   - Evidence: `Info.plist` declares Face ID and Microphone usage, and Add‑to‑Library. The app uses camera and picker but no biometric auth or mic capture is present, and there’s no confirmed saving to Photos.
   - Impact: Unused permission strings can cause review questions and guideline 2.5.1 friction.
   - Fix: Remove `NSFaceIDUsageDescription`, `NSMicrophoneUsageDescription`, and `NSPhotoLibraryAddUsageDescription` unless the related features ship. Keep `NSPhotoLibraryUsageDescription` for picker access.

5. **Minimum OS/build tool mismatch**
   - Evidence: `Info.plist` hard‑codes `LSMinimumSystemVersion` 12.0, while the Podfile targets 15.1. Apple requires builds with Xcode 16 + iOS 18 SDK.
   - Impact: Inconsistent deployment targets risk submission issues.
   - Fix: Remove the `LSMinimumSystemVersion` override or raise it to match the Podfile (≥15.1). Pin the EAS `production` image to Xcode 16 (see Medium‑Risk section) and verify the archived app metadata.

## Medium-Risk Observations

- Build pipeline not pinned to Xcode 16: `eas.json` lacks an explicit image for `production`. Add `"image": "sdk-53"` (or the current Xcode 16 image) under `build.production.ios` and verify Expo SDK 53 compatibility.
- Required‑reason APIs: `PrivacyInfo.xcprivacy` includes File Timestamp/Disk Space/System Boot Time reasons. Ensure each corresponds to real usage or remove the reason to avoid privacy review questions.
- Privacy Policy freshness & EU trader info: `screens/PrivacyPolicyScreen.tsx` shows “Last Updated: January 2025.” Update to the submission month and ensure App Store Connect metadata includes legal entity/trader details and contact.
- ATS `localhost` exception: Present in `Info.plist`. Remove for release builds or gate behind a debug configuration.
- Restore Purchases CTA: Add a visible “Restore Purchases” entry (e.g., Profile → Subscription) that calls `restorePurchases()`; don’t rely solely on RevenueCat’s modal.
- Wire Profile → Privacy/Terms: The Profile menu has stub handlers; link to the in‑app Privacy Policy and Terms screens for ongoing discoverability post‑onboarding.
- iPhone‑only packaging: Expo’s `supportsTablet: false` is set, but `UIRequiresFullScreen` is currently `false`. Align Info.plist with iPhone‑only packaging by setting full‑screen to `true` for consistency and to avoid iPad listing/compat issues.
- Debug/diagnostic screens in release: `ConnectionTest` is registered in the main navigator. Hide this route behind a debug flag or remove it from `production` builds to avoid 2.1 “App Completeness” concerns during review.

## Low-Risk Items / Housekeeping

- App display name: `CFBundleDisplayName` is `nail-app-mobile`; change to “NailGlow”.
- Logging: Ensure no sensitive keys/URLs are logged in release builds.

## Recommended Next Steps
1. Prove end‑to‑end deletion: Apply `12_account_deletion.sql` in production, move storage deletions to a service‑role function if needed, and validate by test account. Attach a screen recording and backend logs in review notes.
2. Complete Privacy Manifest: Populate `NSPrivacyCollectedDataTypes` with actual categories/purposes and re‑aggregate third‑party SDKs. Ensure App Store privacy questionnaire matches exactly.
3. Remove unused permissions: Drop Face ID/Microphone/Photo Add unless shipping those features. Keep `NSPhotoLibraryUsageDescription` for picker.
4. Align build targets: Remove or raise `LSMinimumSystemVersion` to ≥15.1 and pin `eas.json` production to an Xcode 16 image. Create a fresh archive to verify metadata.
5. Legal surfaces: Update “Last Updated” on Privacy Policy; wire Profile → Privacy/Terms; ensure App Store Connect has DSA trader info and contacts.
6. Payments UX: Add explicit “Restore Purchases” in Profile → Subscription calling `restorePurchases()`; keep Manage Subscriptions deep‑link.
7. iPhone‑only: Keep `supportsTablet: false` and set `UIRequiresFullScreen` to `true` to align packaging with iPhone‑only intent.

## Compliance Action Checklist (Submit‑Ready Plan)
- [ ] Privacy Manifest: declare collected data
  - [x] Populate `NSPrivacyCollectedDataTypes` in `nail-app-mobile/ios/nailappmobile/PrivacyInfo.xcprivacy` with: Contact Info (email), User Content (photos), Identifiers (user ID), Usage Data (product interaction); include purposes matching App Store privacy questionnaire.
  - [x] Validate required‑reason APIs: keep only reasons actually used (removed System Boot Time reason). 
  - [ ] Re‑aggregate third‑party privacy manifests and archive to confirm aggregation passes.

- [ ] Account deletion (5.1.1) — end‑to‑end proof
  - [ ] Apply `nail-app-mobile/supabase/12_account_deletion.sql` to production.
  - [x] Ensure storage object deletion is executed with service‑role privileges (Edge Function or DB function with appropriate security context).
  - [ ] QA: Create test user → upload looks/images → delete account → verify DB rows and storage objects removed → capture screen recording and server logs for Review Notes.
  - [x] Remove password re‑auth requirement for Apple SSO users: authorize deletion with the current session, or re‑auth via `expo-apple-authentication` when provider is Apple.

- [ ] Permissions hygiene (2.5.1)
  - [x] Remove unused `NSFaceIDUsageDescription` and `NSMicrophoneUsageDescription` from `nail-app-mobile/ios/nailappmobile/Info.plist`.
  - [x] Remove `NSPhotoLibraryAddUsageDescription` unless saving to camera roll is implemented. Keep `NSPhotoLibraryUsageDescription` for picker access.
  - [ ] Verify no runtime prompts appear beyond camera/photo picker.

- [ ] Build & tooling alignment
  - [x] Remove or raise `LSMinimumSystemVersion` in `nail-app-mobile/ios/nailappmobile/Info.plist` to ≥15.1 (or rely on Xcode‑generated value) to match `ios/Podfile`.
  - [x] Pin EAS production image to Xcode 16 (e.g., add `"image": "sdk-53"`) in `nail-app-mobile/eas.json` under `build.production.ios`.
  - [ ] Create a fresh archive and verify the archived app reports the expected minimum OS and SDK.

- [ ] Payments & subscriptions (3.1.1)
  - [x] Add visible “Restore Purchases” entry in Profile → Subscription calling `restorePurchases()` from `nail-app-mobile/lib/revenuecat.ts`.
  - [ ] Keep Manage Subscriptions deep‑link; confirm RevenueCat modal also exposes Restore.
  - [ ] Ensure paywall copy discloses price, period, trial details, auto‑renewal, and links to Privacy Policy and Terms (configure in RevenueCat offering/paywall).
  - [ ] QA on TestFlight: purchase, restore, and cancellation flows.

- [ ] Legal & metadata
  - [x] Update “Last Updated” date in `nail-app-mobile/screens/PrivacyPolicyScreen.tsx` to match submission month.
  - [x] Wire Profile menu items to open Privacy Policy and Terms screens (replace stub handlers in `nail-app-mobile/screens/ProfileScreen.tsx`).
  - [ ] In App Store Connect: ensure EU DSA trader info, support email/URL, and accurate Age Rating questionnaire.
  - [ ] Complete App Store privacy questionnaire to exactly match the privacy manifest.

- [ ] iPhone‑only packaging
  - [x] Keep `supportsTablet: false` in `nail-app-mobile/app.json`.
  - [x] Set `UIRequiresFullScreen` to `true` in `nail-app-mobile/ios/nailappmobile/Info.plist` for iPhone‑only packaging consistency.

- [ ] ATS/networking
  - [x] Remove `localhost` ATS exception from release Info.plist or gate it behind debug only.
  - [ ] Confirm all production endpoints use HTTPS without insecure exceptions.

- [ ] Remove debug/diagnostic screens from release
  - [x] Hide or exclude `ConnectionTest` route from the production navigator (keep it dev‑only).

- [ ] Branding/metadata polish
  - [x] Change `CFBundleDisplayName` to “NailGlow” in `nail-app-mobile/ios/nailappmobile/Info.plist`.
  - [ ] Verify icons, screenshots, and description align with shipped features (no placeholder text).

- [ ] Export compliance & submission materials
  - [ ] Fill encryption/export compliance questions in App Store Connect.
  - [ ] Attach deletion flow screen recording and brief note describing where to find the feature (Profile → Delete Account).
  - [ ] Confirm contact details and support links are present and accurate.

## References
- App Store Review Guidelines: 5.1.1 (Data Deletion), 2.3 (Accurate Metadata), 2.5.1 (Permissions), 3.1.1 (In‑App Purchase “Restore”).
- Privacy Manifests for iOS and required‑reason APIs (Apple Developer Documentation).
- Upcoming build requirements for App Store submissions (Xcode 16 + iOS 18 SDK).
