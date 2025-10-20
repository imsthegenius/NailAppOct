# Expo Dev Client Reset Plan

## Objective
Return the iOS project to the configuration that Expo SDK 53 expects so that `expo-dev-client` builds and runs without custom shims. Once this baseline is restored we can attach Metro, surface the JS runtime error, and finish the RevenueCat verification.

---

## Current Fix Implementation (2025-09-17)
- Removed the iOS autolinking exclusion for `expo-blur` and the install exclusion for `expo-dev-client` in `nail-app-mobile/package.json` (see `package.json:1`).
- Added the Expo config plugins supplied by our dependencies to `nail-app-mobile/app.json` (only the packages that actually ship plugins: secure store, camera, image picker) and excluded `expo-dev-client` in `package.json` so Expo Doctor accepts the version we must keep for iOS 18.
- Added `scripts/patch-expo-dev-client-swiftui.js` to the postinstall; it inserts the missing `ExpoModulesCore` import **and** rewrites `Color.expo…` calls to their UIKit equivalents (e.g., `Color(UIColor.secondarySystemBackground)`) so the dev menu/launcher compiles even when the Expo color helpers are absent.
- Pinned `ExpoBlur` alongside `ExpoModulesCore` in `nail-app-mobile/ios/Podfile` so all Expo pods resolve from `../node_modules` on both local and EAS runners.
- Restored `ios/Podfile.lock` to the SDK 53 lock that already records `ExpoBlur (14.1.5)` from `node_modules/expo-blur/ios`; rerunning `pod install` on macOS will refresh this file after the Podfile change.
- Cleared `node_modules` and `ios/Pods`, ran `npm install`, and attempted `pod install`. The CocoaPods step now fails inside this sandbox because it cannot download Hermes artifacts (no network/CMake). Run `pod install` locally with CMake installed (`brew install cmake`) to regenerate Pods + the lockfile with the new ExpoBlur pin.
- `npx expo-doctor` also requires network access; run it locally immediately after pods install to confirm there is no dependency drift.

**Next actions for the team**
1. On a networked Mac (with `cmake` available), execute `cd ios && pod install` and commit the refreshed `ios/Podfile.lock` (confirm it still shows `ExpoBlur (14.1.5)` from the workspace path).
2. Run `npx expo-doctor` and resolve any warnings, then rebuild the dev client (`npx expo run:ios --device`) to verify the launcher opens.
3. Once Metro is attached, capture the redbox for the preview black screen so we can address the JS runtime fault.

---

## Why We Are Doing This
- We disabled `expo-blur` and added ad‑hoc patches to stop EAS from drifting. That solved the preview build but left the dev launcher running against a custom native bootstrap.
- `expo-dev-launcher` now fails because the Expo AppDelegate lifecycle is no longer the stock one (missing `autoSetupPrepare`, window lookup, etc.).
- Restoring the standard Expo wiring keeps the native stack predictable and removes the need for fragile node_modules patches.

### Original ExpoBlur Failure (Root Cause Reference)
- EAS occasionally resolved `ExpoBlur` against a different `ExpoModulesCore`, so any Swift source calling helpers such as `Color.expoSystemGray6` failed to compile (`Color` "has no member …").
- The issue was deterministic whenever `pod install` ran without a lockfile or `:path` pin, because the cloud resolver picked whatever version matched the semver range.
- Disabling blur masked the symptom but cost us the glass UI and pushed us into custom dev-launcher shims. The long-term fix is to **lock both pods** to the versions shipped with SDK 53 and ensure every build—local or EAS—uses those same artifacts.

---

## Guiding Principles
1. **Match Expo’s expected dependency graph.** Allow `expo-blur` to link on iOS and pin it explicitly so the cloud runner cannot drift.
2. **Keep Pod resolution deterministic.** Every pod that matters (`ExpoModulesCore`, `ExpoBlur`, `expo-dev-*`, etc.) must come from `node_modules` and be captured in `ios/Podfile.lock`.
3. **Avoid custom native shims unless absolutely required.** The stock `EXAppDelegateWrapper` + ReactDelegate should work once the dependencies match.
4. **Validate at each stage.** Run `npx expo-doctor`, inspect `ios/Podfile.lock`, and build locally before touching EAS.

---

## Prerequisites & Safety
- Ensure current work is committed or stashed. Create a safety branch (e.g. `git checkout -b dev-client-reset`) before making changes.
- Have Apple Developer credentials and a trusted physical device available (Developer Mode ON).
- Xcode 15.x (from the EAS clean-build doc) and CocoaPods installed.

---

## Step-by-Step Plan

### 1. Inventory & Backup
- `git status` and note all modified files.
- `git branch dev-client-reset` (or another scratch branch).
- Copy the current `ios/Podfile`, `Podfile.lock`, and `package.json` somewhere safe for reference.

### 2. Re-enable iOS Blur Autolinking
- Edit `package.json`:
  - Remove `"expo" → "autolinking" → "ios" → "exclude": ["expo-blur"]`.
  - Keep the lazy import fallback that already exists in `NativeLiquidGlass.tsx` to avoid crashes on platforms without the native module.
- Remove `expo.install.exclude: ["expo-dev-client"]` unless we have a specific reason to keep it; Expo CLI now respects pinned versions.

### 3. Pin the ExpoBlur Pod
- Update `ios/Podfile` (inside the main target, near the existing `ExpoModulesCore` pin):
  ```ruby
  pod 'ExpoModulesCore', :path => "../node_modules/expo-modules-core"
  pod 'ExpoBlur', :path => "../node_modules/expo-blur/ios"
  ```
- Ensure no other manual edits remain from prior experiments (remove custom window code, etc., if present).
- After running `npx pod-install`, open `ios/Podfile.lock` and confirm:
  - `ExpoBlur (14.1.5)` is sourced from `../node_modules/expo-blur/ios`.
  - No additional `ExpoBlur` entries exist (only the pinned path).
- This guarantees the helper functions `Color.expoSystemGray6`, etc., are present so the Swift compiler no longer fails.

### 4. Simplify the Postinstall Patch
- Revert `scripts/patch-expo-file-system.js` back to the minimal Expo-provided patch (only the `ExpoAppDelegateSubscriberRepository` substitution). Remove dev-launcher/window logic; Expo will handle that once dependencies align.

### 5. Clean Native & JS Dependencies
- Delete generated artifacts:
  ```bash
  rm -rf node_modules ios/Pods ios/Podfile.lock
  rm -rf ios/build ios/nailappmobile.xcworkspace/xcuserdata
  ```
- Optionally clear DerivedData (`rm -rf ~/Library/Developer/Xcode/DerivedData/nailappmobile-*`).
- Install fresh JS deps: `npm install` (postinstall will run the trimmed patch).
- Re-run autolinking & pods: `npx pod-install` (or `npx expo prebuild --clean` *only if* we want Expo to regenerate ios—otherwise stick to pod-install to avoid overwriting manual files).

### 6. Capture the Locked Versions
- Open `ios/Podfile.lock` and confirm:
  - `ExpoModulesCore (2.5.0)`
  - `ExpoBlur (14.1.5)`
  - `expo-dev-client (6.0.12)` and associated pods (dev-launcher 6.0.x / dev-menu 7.0.x).
- Commit `Podfile.lock` so EAS will resolve the same versions.
- If the lockfile ever changes unexpectedly, diff it before committing—changes to `ExpoBlur` or `ExpoModulesCore` almost always signal the original problem returning.

### 7. Health Check
- Run `npx expo-doctor` and confirm only the expected “app.json vs native folders” warning appears.
- Optionally run `npx expo doctor --fix-dependencies` if any drift is reported.

### 8. Local Dev Client Build
- With the device connected and unlocked:
  ```bash
  npx expo run:ios --device "Your Device Name"
  ```
- Trust the developer certificate if prompted (Settings → General → VPN & Device Management).
- Once the app installs, start Metro with `npx expo start --dev-client --lan --port 8081` (or `--tunnel` if LAN discovery fails) and confirm the launcher resolves the JS bundle without crashing.

### 9. EAS Builds (Preview + Development)
- Commit the clean state (Podfile, Podfile.lock, package.json changes, any doc updates).
- Trigger EAS preview & development builds:
  ```bash
  eas build -p ios --profile preview --clear-cache
  eas build -p ios --profile development --clear-cache
  ```
- Verify the “Installing Pods” section lists `ExpoModulesCore (2.5.0)` and `ExpoBlur (14.1.5)` with the correct paths.
- If EAS still resolves a different blur/core pair, download the build logs, inspect `Podfile.lock` on the worker, and ensure the `:path` pin is present—missing pins mean the worker pulled from CocoaPods specs instead of the workspace.

### 10. Validate RevenueCat Flow
- Install the dev client build on device, attach Metro, reproduce the previous black screen, and capture the JS stack trace.
- Once the runtime error is fixed, run through the RevenueCat purchase flow to confirm functionality.

### 11. Document & Monitor
- Update `docs/EAS_IOS_CLEAN_BUILD.md` (or linked doc) with the restored blur configuration and dev-client notes.
- Consider adding CI checks (`npx expo-doctor`, `grep` for pod versions) to prevent future drift.

---

## Risks & Mitigations
- **EAS still drifts:** Locked `Podfile.lock` + `:path` pins prevent remote resolution changes. Monitor build logs for pod versions.
- **Prebuild overwrites local edits:** Avoid `expo prebuild --clean` unless necessary; otherwise keep manual ios files backed up.
- **Certificate trust loops on public Wi‑Fi:** Use hotspot/VPN if the network blocks Apple OCSP.
- **Runtime regressions after re-enabling blur:** The JS fallback remains in place; if blur fails to load, UI still renders with the safe path.

---

## Done Criteria
- `npx expo-doctor` passes (minus the known warning).
- Local `npx expo run:ios --device` installs the dev client and launches without native crashes.
- Metro attaches, and the JS runtime error responsible for the black screen is observable.
- EAS preview & development builds succeed and list the pinned pod versions.
- RevenueCat purchase flow verified on the dev client build.
