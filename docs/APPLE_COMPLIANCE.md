# Apple App Store Compliance Audit — nail-app-mobile (iOS)

Audit date: 2025-09-12
Scope: /Users/imraan/Downloads/NailApp/nail-app-mobile only

Executive Summary
- Overall: Close to review-ready. No critical blockers found, but 3 items should be addressed before submission.
- High priority (fix before submit):
  1) Remove unused Face ID permission from Info.plist (or add real biometric auth).
  2) Complete account deletion by deleting the Supabase auth user via a server endpoint (client currently deletes app data only).
  3) Provide an in‑app “Manage Subscriptions” link to Apple’s subscription settings.
- Medium priority (strongly recommended):
  - Avoid storing image base64 in AsyncStorage; use FileSystem cache or in‑memory.
  - Gate nonessential console logging to __DEV__ only.
- Passed: Camera/photo permissions, ATS config, secure token storage (Keychain), privacy/terms screens, purchase/restore flow via RevenueCat.

App Identity & Config
- Bundle ID: com.nailglow.app (nail-app-mobile/app.json:16)
- Permissions declared (iOS): NSCameraUsage, NSPhotoLibraryUsage, NSPhotoLibraryAddUsage, NSFaceIDUsage (nail-app-mobile/app.json:18)
- ATS: Arbitrary loads disabled; exceptions for supabase.co + workers.dev over HTTPS (nail-app-mobile/app.json:22)
- Native iOS project generated (ios/ present via prebuild)

Data Flow & Third‑Party SDKs
- Auth/DB/Storage: Supabase (@supabase/supabase-js)
- Purchases: RevenueCat (react-native-purchases)
- Camera & Gallery: expo-camera, expo-image-picker
- Secure storage: expo-secure-store (Keychain on iOS) (nail-app-mobile/lib/keychainStorage.ts:1)
- AI: @google/genai (image generation/transformation requests)

Guideline Mapping and Findings
1) Guideline 3.1.1 — In‑App Purchase
- Status: Pass
  - Purchases implemented with RevenueCat; products show via Offerings; restore supported (nail-app-mobile/lib/revenuecat.ts:1, nail-app-mobile/screens/UpgradeScreen.tsx:1)
  - No external payment links.
- Action: Add an in‑app “Manage Subscriptions” link to Apple settings for clarity: itms-apps://apps.apple.com/account/subscriptions (suggest placing on Profile and on Delete Account screen).

2) Guideline 5.1 — Privacy (Data Collection & Permissions)
- Status: Pass with notes
  - Privacy Policy and Terms are present in‑app (nail-app-mobile/screens/PrivacyPolicyScreen.tsx:1, nail-app-mobile/screens/TermsOfServiceScreen.tsx:1)
  - Camera/Photo usage strings present and accurate (nail-app-mobile/app.json:18)
  - Tokens stored in Keychain via SecureStore (nail-app-mobile/lib/supabase.ts:1, nail-app-mobile/lib/keychainStorage.ts:1)
  - ATS configured to HTTPS only with specific exceptions (nail-app-mobile/app.json:22)
- Issues:
  - NSFaceIDUsageDescription declared but no biometric auth in code. Apple can flag unused sensitive permission.
  - CameraScreen stores base64 image temporarily in AsyncStorage (unencrypted) (nail-app-mobile/screens/CameraScreen.tsx:100, 140). Lower risk but avoidable.
- Remediation:
  - Remove NSFaceIDUsageDescription from app.json unless you add expo-local-authentication/biometric lock.
  - Replace AsyncStorage base64 persistence with Expo FileSystem cache file path or keep in navigation params/memory.

3) Guideline 5.1.1 — Account Deletion (mandatory)
- Status: Partial
  - Client invokes delete_user_account RPC (nail-app-mobile/screens/DeleteAccountScreen.tsx:73; nail-app-mobile/supabase/12_account_deletion.sql:1) which deletes user data and logs an audit record.
  - SQL explicitly states auth.users deletion must be done via Admin API/server (nail-app-mobile/supabase/12_account_deletion.sql:66).
  - Current client implementation signs the user out but does not delete auth.users.
- Remediation (before review):
  - Add a server endpoint (Next.js API or Supabase Edge Function) that, using service role, deletes the Supabase auth user after RPC success; call it from DeleteAccountScreen as final step.
  - Present a “Manage Subscriptions” link for users to cancel auto‑renew in App Store.

4) Sign in with Apple (only required if using 3rd‑party OAuth)
- Status: Not required
  - App uses email/password only; no Google/Facebook OAuth detected.
  - If you add third‑party login later, you must add Sign in with Apple.

5) App Tracking Transparency (ATT)
- Status: Not required
  - No ad SDK/IDFA usage found; do not include ATT prompt.

6) Other Security Observations
- Console logging: Several development logs (e.g., CameraScreen) are unconditional.
  - Remediation: Wrap logs with if (__DEV__) to avoid leaking runtime details in production.
- Privacy manifest: Not present in ios/; not required for approval if you are not using Required Reason APIs and third‑party SDKs provide their own manifests. Optional to add your own PrivacyInfo.xcprivacy.

App Store Connect Data Types (for App Privacy)
- Contact Info: Email address (account).
- User Content: Photos (nail images), Saved Looks metadata.
- Identifiers: User ID.
- Usage Data: Product interaction, diagnostics (if you enable it later).
- Data linked to user: Email, photos, saved looks. No tracking across apps.

Outstanding Items — Action Checklist
- Must fix before submission:
  1) Remove NSFaceIDUsageDescription or implement real Face ID/biometric auth.
     - File: nail-app-mobile/app.json:18
  2) Complete account deletion by removing auth.users via server after RPC.
     - Client: nail-app-mobile/screens/DeleteAccountScreen.tsx:73
     - SQL: nail-app-mobile/supabase/12_account_deletion.sql:66
  3) Add in‑app “Manage Subscriptions” deep link and surface it in Profile and Delete Account screens.
     - URL: itms-apps://apps.apple.com/account/subscriptions

- Strongly recommended:
  4) Replace AsyncStorage base64 image storage with FileSystem cache or in‑memory handoff.
     - File: nail-app-mobile/screens/CameraScreen.tsx:100, 140
  5) Gate console logs with __DEV__ and avoid logging errors with PII.
  6) Ensure iOS “In‑App Purchases” capability is enabled in Xcode/EAS profile.

Verification Steps (Internal QA)
1) Permissions
  - First run prompts for camera/photo access; no Face ID prompt.
2) Purchases (Sandbox)
  - Prices load on Upgrade screen; purchase & restore succeed; entitlement listener updates Supabase (nail-app-mobile/lib/revenuecat.ts:1).
3) Account Deletion
  - With server endpoint enabled, calling Delete Account removes user data (RPC) and deletes auth.users; user signed out and local data cleared.
4) Privacy/Terms
  - Screens open from settings/profile; contact emails present.

Evidence (Code References)
- InfoPlist & ATS: nail-app-mobile/app.json:16
- Secure token storage: nail-app-mobile/lib/supabase.ts:1, nail-app-mobile/lib/keychainStorage.ts:1
- Camera/Gallery usage: nail-app-mobile/screens/CameraScreen.tsx:1
- Account deletion flow: nail-app-mobile/screens/DeleteAccountScreen.tsx:1, nail-app-mobile/supabase/12_account_deletion.sql:1
- RevenueCat integration: nail-app-mobile/lib/revenuecat.ts:1, nail-app-mobile/screens/UpgradeScreen.tsx:1
- Privacy & Terms screens: nail-app-mobile/screens/PrivacyPolicyScreen.tsx:1, nail-app-mobile/screens/TermsOfServiceScreen.tsx:1

Appendix — Recommended Snippets
- Manage Subscriptions link (React Native):
  - `Linking.openURL('itms-apps://apps.apple.com/account/subscriptions')`
- RevenueCat restore (already present): nail-app-mobile/screens/UpgradeScreen.tsx:101

Conclusion
If you: (a) remove the unused Face ID key or add biometric auth, (b) complete auth user deletion via server, and (c) add a Manage Subscriptions link, the app should satisfy Apple’s current privacy and IAP requirements. Remaining items are best‑practice hardening and won’t block review.

