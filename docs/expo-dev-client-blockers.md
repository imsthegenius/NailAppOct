# Expo Dev Client Blockers — September 2025

## Snapshot of the Current Native Setup
- Project branch: `codex/plan-payment-implementation-for-app`
- Expo SDK: `~53.0.22`
- React Native: `0.79.5`
- Hermes JS engine enabled
- iOS deployment target: 15.1
- Pods pinned via `Podfile` to local workspace copies (`ExpoModulesCore`, `ExpoBlur`) to prevent version drift on EAS.
- Dev client dependency presently set to `expo-dev-client@^6.0.12` (upgraded from the SDK 53 default to resolve the iOS 18 launch crash).
- Custom postinstall script rewrites Expo Dev Menu/Launcher SwiftUI files to replace `Color.expo…` helpers and to shim missing `RCTReleaseLevel` symbols.

## Failures Observed While Building the iOS Dev Client

### 1. SwiftUI Color Helpers Missing
- **Error**: `type 'Color' has no member 'expoSecondarySystemBackground'` (and similar helpers).
- **Where**: `node_modules/expo-dev-menu/ios/SwiftUI/*.swift`, `node_modules/expo-dev-launcher/ios/SwiftUI/*.swift`.
- **Cause**: Expo Dev Client 6.x expects the new color extension API exported by the Expo SDK 55+ Swift shims. SDK 53’s copy of `ExpoModulesCore` does not provide those helpers, so the compiler fails.
- **Attempted Mitigation**: Added a postinstall script that injects `import ExpoModulesCore` and replaces the helper calls with standard UIKit equivalents (`Color(UIColor.systemGray6)`, etc.).
- **Status**: Patching works but introduces ongoing maintenance risk because every Expo update could rename files or change usages.

### 2. Missing `RCTReleaseLevel` Symbols in `EXDevLauncherController`
- **Error**: `expected a type`, `use of undeclared identifier 'RCTReleaseLevel'`, `no visible @interface ... initWithDelegate:releaseLevel:`.
- **Where**: `node_modules/expo-dev-launcher/ios/EXDevLauncherController.m`.
- **Cause**: Expo Dev Client 6.x depends on React Native 0.80+ APIs (`RCTReleaseLevel`, `initWithDelegate:releaseLevel:`) that were not backported to React Native 0.79.5 (the version bundled with SDK 53).
- **Attempted Mitigation**:
  - Added typedef shims for `RCTReleaseLevel`, plus runtime selector guards to fall back to `initWithDelegate:` when `initWithDelegate:releaseLevel:` is unavailable.
  - These patches compile locally but further widen the delta from upstream Expo sources.
- **Status**: The latest build still fails because the factory selector check executes the unavailable initializer before the guard can short-circuit. Root issue remains: the 6.x native sources expect a newer React Native runtime.

### 3. Historical Pod Drift / `Color.expoSystemGray6` Errors
- **Past Error**: Swift compile failure (`type 'Color' has no member 'expoSystemGray6'`) during EAS builds.
- **Cause**: Cloud runners resolved `ExpoBlur` against a different `ExpoModulesCore`, so the Swift helper extensions vanished.
- **Fix Implemented**: Pin `ExpoModulesCore` and `ExpoBlur` pods via `:path => "../node_modules/..."` and commit `Podfile.lock`. This has stabilized preview builds and should remain in place regardless of the dev-client decision.

### 4. Network Limitations in Sandbox Environment
- **Observation**: Commands like `npx expo-doctor` and `npx pod-install` fail in the sandbox due to blocked access to `registry.npmjs.org` and other hosts.
- **Impact**: Automated scripts must be run locally on the developer machine; remote tooling cannot validate the dependency tree within the restricted environment.

## Why Staying on `expo-dev-client@6.x` Is Fragile on SDK 53
- 6.x integrates with RN 0.80+/Expo SDK 55 features (release level enums, new React Native factory APIs, SwiftUI color helpers).
- SDK 53 ships RN 0.79.5 and older Expo shims; those symbols simply do not exist, hence the consecutive compile errors.
- Every manual patch we add (color rewrites, enum shims, initializer guards) increases divergence from the official sources and risks breaking when Expo publishes even a minor update.

## Options Under Consideration
1. **Revert to the SDK 53-compatible dev client (`expo-dev-client@~5.2.4`)**
   - Pros: Matches Expo’s tested toolchain; no native patching required once pods are pinned.
   - Cons: Reintroduces the original iOS 18 launch crash that motivated the upgrade (needs confirmation after the blur/core pinning work).
2. **Upgrade the entire project to Expo SDK 55+**
   - Pros: Aligns all native modules with the 6.x dev client.
   - Cons: Requires significant testing/migration effort (app code, config plugins, pods) and may destabilize the current release build.
3. **Continue patching Expo’s native sources**
   - Pros: Keeps 6.x dev client without upgrading SDK.
   - Cons: High maintenance cost; brittle; any upstream change or postinstall failure reintroduces compile errors.

## Prompt for a Web-Browsing AI Agent
Use the following prompt verbatim when a browsing-capable agent is available:

> "We have an Expo SDK 53 / React Native 0.79.5 project that needs an iOS dev client on iOS 18. Reverting to `expo-dev-client@~5.2.4` avoids compile errors but historically crashed on launch. Upgrading to `expo-dev-client@6.x` fixes the crash but introduces missing Swift color helpers (`Color.expoSecondarySystemBackground`) and missing Objective-C APIs (`RCTReleaseLevel`, `initWithDelegate:releaseLevel:`) because those exist only in React Native 0.80+ / Expo SDK 55+. Please research documented solutions or official guidance for running the Expo dev client on SDK 53 + iOS 18 without upgrading the entire SDK. Focus on release notes, GitHub issues, or Expo forum discussions that address compatibility between Expo SDK 53 and iOS 18 for dev clients. Report back with actionable steps and whether Expo recommends staying on the 5.x dev client, applying specific patches, or jumping straight to a newer SDK."

---

This document captures all known failure modes so the next agent (human or AI) has complete context before attempting further fixes.
