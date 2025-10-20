# Expo Dev Build Failure Audit — 2025-09-15

## Overview
This document records the current state of our Expo iOS development build failures and provides a remediation plan so we can ship a working dev client for debugging the preview black screen.

## Key Symptoms
- **Dev client crash on launch:** Crash log (`docs/iphone-logs-expo-dev.md`) shows `ExpoDevLauncherAppDelegateSubscriber` assertion, matching the SDK mismatch we previously resolved. In Expo’s SDK 53 release notes, `expo-dev-client@6.x` is explicitly cited as fixing this crash on iOS 18.
- **Intermittent Swift compile errors on EAS:** Recent preview builds still compile `ExpoBlur` against a mismatched ExpoModulesCore, reviving the original `Color.expoSystemGray6` failures.
- **Config plugin warning:** The reported "expo-linear-gradient does not contain a valid config plugin" warning appears when the plugin array includes packages that do not ship config-plugins.
- **Workspace drift:** A second, generated iOS workspace under `nail-app-mobile/ios/ios/` introduces alternate Podfiles and lockfiles that diverge from the committed configuration.

## Root Causes
1. **Regressed dev client dependency**  
   - `package.json` and `package-lock.json` now pin `expo-dev-client` to `~5.2.4` (`package.json:28`), rolling back the upgrade to 6.x that fixed this exact crash in commit `22eb077`.  
   - Result: EAS builds the dev client with Expo SDK 52-native code, asserting on iOS 18 before Metro attaches.

2. **Lost pod alignment guardrails**  
   - `ios/Podfile` no longer pins `ExpoModulesCore` via `:path` or excludes `expo-blur`, so EAS resolves pods independently of the lockfile.  
   - When `expo-blur` autolinks, the cloud runner may pull a pod compiled against a different ExpoModulesCore version, reintroducing the missing `Color.expoSystemGray6` helper.

3. **Misapplied config-plugin guidance**  
   - `app.json` currently lists only `expo-secure-store` (`app.json:64-66`). Expo automatically runs bundled plugins; `expo-linear-gradient` does not provide one.  
   - Adding it to the `plugins` array produces the "does not contain a valid config plugin" warning mentioned by the agent. The correct resolution is to leave it out.

4. **Duplicate iOS project tree**  
   - `nail-app-mobile/ios/ios/` includes its own `Podfile`, lockfile, and `package.json`, referencing older dependency versions.  
   - EAS caching may pick up those alternate manifests, causing build cache pollution and version drift between local and cloud environments.

## Remediation Plan

1. **Realign the dev client toolchain**
   - Upgrade to the latest Expo SDK 53-compatible dev toolchain: `expo-dev-client@^6.0.12`, `expo-dev-launcher@^6.1.x`, `expo-dev-menu@^7.1.x` (matching Expo’s SDK 53 release notes for iOS 18).  
   - Regenerate lockfiles (`npm install`) and confirm the native pods listed in `ios/Podfile.lock` reflect those versions.  
   - Run `npx expo doctor` and address every warning before touching native builds.

2. **Reapply deterministic pod configuration**
   - Reinstate `pod 'ExpoModulesCore', :path => "../node_modules/expo-modules-core"` in `ios/Podfile`.  
   - Keep `expo` autolinking exclusions for `expo-blur` on iOS so the pod is not compiled; retain the lazy runtime fallback in `NativeLiquidGlass.tsx`.  
   - Reinstall pods cleanly (`rm -rf ios/Pods ios/Podfile.lock && npx pod-install`) and commit the regenerated `Podfile.lock`.  
   - Add a CI check (or local script) enforcing `grep -q "ExpoModulesCore (2.5.0)" ios/Podfile.lock` and `! grep -q "ExpoBlur" ios/Podfile.lock`.

3. **Clean the workspace**
   - Remove or archive the generated `nail-app-mobile/ios/ios/` tree so EAS reads only the canonical project.  
   - Delete the duplicate `ios/package.json` / lockfile if they were created by `expo prebuild`; keep the source tree focused on the managed workflow.

4. **Validate configuration prior to building**
   - Confirm `app.json` lists only supported plugins (`expo-secure-store`).  
   - Run `npx expo config --type public` and inspect the output to ensure no unintended plugins (e.g. `expo-linear-gradient`) are injected.  
   - Execute `npx expo prebuild --platform ios --clean --skip-dependency-update` locally once to verify autolinking exclusions actually prevent `ExpoBlur` from appearing; discard the generated ios/ directory afterward.  
   - Use `npx expo run:ios --device` to produce a local dev-client IPA and launch it immediately on the enrolled device—this confirms the Metro handshake succeeds before we rely on EAS.

5. **Runtime crash diagnostics (the long-standing black screen)**
   Once Metro connectivity is confirmed, we must capture the JS error that preview builds are hitting:
   - Add a temporary global error boundary around the app root that logs errors to `console.error` and POSTs them to a Supabase debug table (so even release builds surface the stack trace).  
   - Enable `LogBox.ignoreAllLogs(false)` and ensure Hermes is configured to output stack traces in Metro.  
   - Launch the dev client (`npx expo start --dev-client --lan --port 8081`) and reproduce the black screen; copy the stack trace from Metro.  
   - Patch the offending modules immediately and add regression tests if possible.

6. **Rebuild and verify**
   - Commit the corrected native configuration and the temporary error instrumentation to `codex/plan-payment-implementation-for-app`.  
   - Run `eas build -p ios --profile development --clear-cache` from that branch.  
   - Inspect the “Installing Pods” section to confirm `ExpoModulesCore (2.5.0)` and the absence of `ExpoBlur`.  
   - Install the dev client via Apple Configurator or `ideviceinstaller`, verify it opens, attaches to Metro, and emits the runtime stack trace if the JS error persists.  
   - After patching the JS issue, rerun both development and preview EAS builds to confirm the production IPA clears the black screen.

7. **Validation checklist before declaring success**
   - ✅ `npx expo doctor` reports no dependency mismatches.  
   - ✅ `git status` shows no untracked `ios/` artefacts.  
   - ✅ `ios/Podfile.lock` contains `ExpoModulesCore (2.5.0)` and no `ExpoBlur`.  
   - ✅ Dev client built locally via `expo run:ios --device` opens and connects to Metro.  
   - ✅ Dev client from EAS build opens, connects to Metro, and surfaces (or confirms the absence of) the runtime error.  
   - ✅ Preview build (`eas build -p ios --profile preview --clear-cache`) succeeds with matching pod versions and no runtime black screen.

8. **Follow-up safeguards**
   - Keep the temporary error boundary until preview builds run clean for multiple iterations.  
   - Consider baking the pod-version checks and `expo doctor` into CI to prevent future regressions.  
   - Once stable, remove temporary instrumentation and document the final configuration in `docs/EAS_IOS_CLEAN_BUILD.md`.

## Status
- Analysis complete; build remains blocked until the remediation plan above is executed. The next tangible milestone is proving a locally built dev client (`expo run:ios --device`) launches and attaches to Metro on the enrolled iOS 18 device.
