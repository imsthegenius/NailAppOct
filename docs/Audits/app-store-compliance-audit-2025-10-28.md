# NailGlow iOS App Store Compliance Audit — 28 Oct 2025

## Snapshot
- **Repo branch scanned:** current working tree inside `nail-app-mobile/`
- **Primary build stack:** Expo SDK 53 / React Native 0.79.5, EAS build profiles (`preview`, `payments`, `production`)
- **Last policy check:** 28 Oct 2025 (aligned with Apple’s latest App Store Review Guidelines, privacy manifest, and build requirements)

### Compliance Heatmap
| Area | Status | Key Notes |
| --- | --- | --- |
| Build & Tooling | ⚠️ Needs work | Xcode 16 + iOS 18 SDK enforcement isn’t pinned in `production` EAS profile; deployment target mismatch in `Info.plist`. citeturn11search0turn6search0 |
| Privacy & Data Use | 🔴 High risk | Privacy manifest omits collected data types; several sensitive permissions aren’t used; account deletion storage purge not yet verified. citeturn10search5 |
| Account Management | 🔴 High risk | Account deletion screen exists but is unreachable, violating Guideline 5.1.1. citeturn0search0 |
| Payments & Subscriptions | ⚠️ Needs work | RevenueCat paywall present, but restore UX depends on modal; App Store subscription manage link covered. |
| Legal Disclosures | ⚠️ Needs work | In-app privacy policy dated Jan 2025; should align with submission date and EU Digital Services Trader info (handled in App Store Connect metadata). |

## High-Risk Findings

1. **Account deletion UI is unreachable (Guideline 5.1.1 – Legal)**  
   - **Evidence:** `DeleteAccount` screen is registered in the navigators but no menu item or CTA navigates to it from Profile or any other surface; `handleSettingPress` in `screens/ProfileScreen.tsx:49-52` is a stub.  
   - **Impact:** Apple will reject because account deletion must be “easy to find” anywhere an account can be created or managed. citeturn0search0  
   - **Fix:** Add an explicit “Delete Account” button in the Profile settings list, routing to `DeleteAccount`. Document the discovery path in release notes/screenshots.

2. **Privacy manifest doesn’t declare collected data types (Privacy manifest requirement effective 1 May 2025)**  
   - **Evidence:** `ios/nailappmobile/PrivacyInfo.xcprivacy` leaves `NSPrivacyCollectedDataTypes` empty while the app collects email, photos, usage analytics, etc.  
   - **Impact:** Submissions after 1 May 2025 must describe first-party data collection in the manifest; omitting it triggers rejection or post-review removal. citeturn10search5  
   - **Fix:** Populate the manifest with each data category (contact info, user content, identifiers, usage data) and purposes, matching the App Store privacy questionnaire. Regenerate aggregated manifests to include third-party SDK declarations.

3. **Sensitive permissions declared without feature support**  
   - **Evidence:** `ios/nailappmobile/Info.plist:87-118` declares Face ID, Microphone, and Photo Library Add usage. The app only uses camera/image picker; there is no biometric auth (`react-native-keychain` is not used with Face ID) nor audio capture, and no code writes to the photo library.  
   - **Impact:** Apple flags unused permission strings as misleading.  
   - **Fix:** Remove `NSFaceIDUsageDescription`, `NSMicrophoneUsageDescription`, and (if export-to-library remains unimplemented) `NSPhotoLibraryAddUsageDescription`. Re-run QA to ensure no runtime prompts surface unexpectedly.

4. **Deployment target mismatch with Apple’s 2025 build rule**  
   - **Evidence:** `Info.plist` hard-codes `LSMinimumSystemVersion` 12.0 (`ios/nailappmobile/Info.plist:43-45`), while the Podfile defaults to 15.1 (`ios/Podfile:10`). Apple now requires iOS apps to be built with Xcode 16 and the iOS 18 SDK; minimum OS versions lower than 15 are no longer accepted for new updates. citeturn6search0  
   - **Impact:** Submission can be rejected for inconsistent deployment settings when notarized with Xcode 16.  
   - **Fix:** Remove the manual `LSMinimumSystemVersion` override (let Xcode supply it) or raise it to match the deployment target (>=15.1). Verify `expo build:ios` emits the correct minimum OS in the Info.plist.

## Medium-Risk Observations

- **Build pipeline not pinned to Xcode 16 image:** `eas.json` omits an explicit macOS image for the `production` profile, so CI may fall back to an older Xcode version. Set the image to `macos-13-xcode-16.2` (or later) and confirm Expo SDK 53 compatibility. citeturn11search0turn6search0
- **Required-reason API coverage needs validation:** `PrivacyInfo.xcprivacy` lists reasons for File Timestamp, Disk Space, System Boot Time. Confirm each reason has direct app usage (e.g., `FileSystem.getInfoAsync` in `screens/FeedScreen.tsx:182-333` justifies file timestamp, but System Boot Time reason must map to actual API calls). Remove any unused reasons to avoid review questions. 
- **Account deletion back end may leave storage objects:** `supabase/12_account_deletion.sql` attempts to delete from `storage.objects`, which requires elevated privileges; confirm the function succeeds in production and purge assets via the `delete-auth-user` edge function if needed. 
- **Privacy policy freshness & EU trader info:** `screens/PrivacyPolicyScreen.tsx:34` still states “Last Updated: January 2025”. Update the text (and App Store Connect metadata) to match the release submission and include customer support contacts per DSA if distributing in the EU. 
- **App Transport Security exception for `localhost`:** `Info.plist:80-84` allows insecure loads. Keep it behind a debug-only flag or remove it from release builds to matching App Review expectations.
- **RevenueCat paywall restore UX:** The `react-native-purchases-ui` modal typically includes a restore button, but provide an explicit in-app “Restore Purchases” CTA (e.g., Profile > Subscription) to satisfy 3.1.1.

## Low-Risk Items / Housekeeping

- **App display name:** `CFBundleDisplayName` is `nail-app-mobile` instead of the brand (“NailGlow”). Update before shipping. 
- **Tablet support toggle:** `app.json` sets `supportsTablet: false` yet `Info.plist` leaves `UIRequiresFullScreen` false; align settings if you intend to ship iPhone-only. 
- **Logging:** `lib/supabase.ts` logs configuration (in `__DEV__` only); verify no sensitive URLs leak in release builds.

## Recommended Next Steps
1. Wire the Profile screen to the account deletion flow; record QA evidence (screen recording) before resubmission.
2. Update the privacy manifest and App Store privacy questionnaire together; run Apple’s `privacyreport` build step to confirm aggregation. 
3. Trim Info.plist permissions, regenerate Expo resources, and rerun `expo prebuild` to ensure the settings persist. 
4. Pin the EAS `production` build image to Xcode 16+, remove the stale `LSMinimumSystemVersion`, and run a fresh archive to confirm the deployment target. 
5. Validate account deletion end-to-end on production Supabase (including storage purge) and capture server logs for App Review. 
6. Refresh policy documents (Privacy, Terms), update “Last Updated” timestamps, and double-check App Store Connect metadata (contact info, EU trader status, Age Rating questionnaire).

## References
- Apple Developer — `Upcoming requirements for App Store submissions` (Xcode 16 + iOS 18 SDK). citeturn6search0
- Expo SDK 53 release notes — Xcode 16.2+ required. citeturn11search0
- Apple Developer — `Privacy updates for App Store submissions` (privacy manifest timeline). citeturn10search5
- Apple Developer — `Account deletion requirements` (Guideline 5.1.1). citeturn0search0
