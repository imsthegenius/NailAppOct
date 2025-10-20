# EAS iOS Clean Build — NailGlow

## Quick Runbook — Payments (Internal IPA)
- Install deps: `cd nail-app-mobile && npm ci`
- Build IPA: `eas build -p ios --profile payments --clear-cache`
- Install on device from EAS page; sign into Sandbox Apple ID
- Start app and test purchases; if a black screen occurs, see fixes below


This doc captures the final, working setup that produced a clean EAS iOS build (installable on device, no USB, suitable for RevenueCat testing) and how to debug the first‑run black screen.

## Summary

- Toolchain: Expo SDK 53 + React Native 0.79.5
- EAS image: `sdk-53`
- Distribution: `preview` (internal) — not a Dev Client
- Pods locked via committed `ios/Podfile.lock`
- Glass: `expo-blur@14.1.5` (native blur) retained
- Fixes applied for compile/link issues and JS runtime

## Final Configuration (Files + Lines)

- `nail-app-mobile/eas.json:18` — pin iOS image to SDK 53
  - `"image": "sdk-53"`
- `nail-app-mobile/package.json:10` — run postinstall patch
  - `"postinstall": "node scripts/patch-expo-file-system.js"`
- `nail-app-mobile/package.json:25` — Expo SDK 53
  - `"expo": "~53.0.22"`
- `nail-app-mobile/package.json:26` — expo‑blur pinned
  - `"expo-blur": "14.1.5"`
- `nail-app-mobile/package.json:53` — align Expo core
  - `"overrides": { "expo-modules-core": "2.5.0" }`
- `nail-app-mobile/scripts/patch-expo-file-system.js:1` — patch expo‑file‑system
  - Replaces `ExpoAppDelegate.getSubscriberOfType(` with `ExpoAppDelegateSubscriberRepository.getSubscriberOfType(` at install time.
- `nail-app-mobile/ios/nailappmobile/AppDelegate.h:1` — clean AppDelegate imports
  - Uses RN/Expo standard headers only; no custom Swift bridging imports.
- `nail-app-mobile/ios/Podfile.properties.json:3` — disable dev inspector
  - `"EX_DEV_CLIENT_NETWORK_INSPECTOR": "false"`
- `nail-app-mobile/babel.config.js:1` — add Reanimated plugin (must be last)
  - Prevents RN 0.79 release black screen due to missing plugin.

## Why Earlier Builds Failed

- Version drift in cloud vs local: pods resolved different versions → missing iOS symbols in `expo-blur`/Expo core.
- `expo-file-system` used an internal API name not present in that build → `ExpoAppDelegate` not found.
- Dev Client code tangling with RN 0.79 → `rootViewFactory` / `RCTDevSettings` compile errors.
- Over‑eager Swift bridging in AppDelegate → header not found / superclass not found.

## What We Changed To Stabilize

- Pinned the EAS image to `sdk-53` so the macOS/Xcode runner matches Expo SDK 53.
- Kept pods deterministic by committing `ios/Podfile.lock` and aligning `expo-modules-core`.
- Patched `expo-file-system` at install to use the supported repository API.
- Excluded Dev Client paths from this build (internal preview IPA only).
- Cleaned AppDelegate (Obj‑C) to default RN/Expo imports only.
- Added the Reanimated Babel plugin to prevent a runtime crash on app start in release.

## One‑Time Setup

1) Verify the files above match the config (lines listed).
2) Ensure `ios/Podfile.lock` is committed.
3) Install deps so the postinstall patch runs:
   - `cd nail-app-mobile && npm install`

## Building (Internal IPA)

- Command:
  - `eas build -p ios --profile preview --clear-cache`
- What to look for in logs:
  - Pods contain `ExpoModulesCore (2.5.0)` and `ExpoBlur (14.1.5)`
  - No references to `expo-dev-menu`/`expo-dev-launcher` compile errors
  - No `ExpoAppDelegate` missing symbol

## Installing + Testing Purchases

- Install from the EAS build page (link/QR). Use a Sandbox Apple ID on device.
- Preview/internal builds (not Dev Client) support RevenueCat purchases.

## Black Screen On Launch — Quick Fixes

- Most common cause: Reanimated plugin missing in release → fixed by `babel.config.js`.
- If it persists, you need runtime logs:
  - Option A: Create a development build (`eas build -p ios --profile development`), start Metro (`npx expo start`), open on device, and read errors in your terminal.
  - Option B: Capture device logs (Xcode > Devices and Simulators, or Apple Console app) filtering by bundle ID.
- Optional: add a temporary ErrorBoundary to show JS errors on‑screen during startup.

## Where The Glass UI Is Used

- Wrapper: `nail-app-mobile/components/ui/NativeLiquidGlass.tsx:1`
- Tab bar: `nail-app-mobile/components/ui/LiquidGlassTabBar.tsx:153`
- Design screen blocks: `nail-app-mobile/screens/DesignScreen.tsx:579`, `:633`, `:639`, `:652`
- Camera screen: `nail-app-mobile/screens/CameraScreen.tsx:22`

## FAQ

- Why not update Xcode to latest?
  - SDK 53 is validated on Xcode 15.x; using `sdk-53` avoids new toolchain regressions.
- Why remove Dev Client here?
  - Internal IPA is required for IAP testing; Dev Client pulls in dev‑only native code that conflicted with RN 0.79.

## Rebuild Checklist

- `eas.json` uses `sdk-53` for the preview iOS profile.
- `package.json` pins `expo ~53.0.22`, `expo-blur 14.1.5`, override `expo-modules-core 2.5.0`.
- Postinstall patch exists and runs.
- `babel.config.js` has `react-native-reanimated/plugin` as the last plugin.
- `ios/Podfile.lock` is committed.
