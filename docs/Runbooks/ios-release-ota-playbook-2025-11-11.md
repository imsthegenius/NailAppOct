# iOS Release + OTA Update Playbook (11 Nov 2025)

This is the exact process we use now that the TestFlight build and camera are working. It’s written in plain English and designed to avoid confusion between QR/internal builds and the TestFlight app.

## What We Ship

- The binary (EAS Build): a real iOS app that goes to TestFlight once, then to the App Store. This is where native code, Info.plist permissions, entitlements, and the update channel/runtime are set.
- The updates (EAS Update): JavaScript and assets only, delivered over‑the‑air (OTA) to the already‑installed TestFlight app. No Apple review, lands in seconds when the app launches online.

## Channels We Use

- `production` channel: used by the TestFlight build. Publish OTAs here to update the TestFlight app.
- `preview` channel: used by internal QR/ad‑hoc builds. Useful for quick device smoke tests but has no IAP. Do not use this for TestFlight.

## One‑Time Setup (Base Binary)

Do this whenever native config changes or the TestFlight app isn’t picking up OTAs.

1) Bump iOS build number
- Files to update:
  - `nail-app-mobile/app.json`: `ios.buildNumber` → increment (string)
  - `nail-app-mobile/ios/nailappmobile/Info.plist`: `CFBundleVersion` → same new number

2) Build and submit from the correct folder
- `cd nail-app-mobile`
- Build: `eas build -p ios --profile production`
- Submit: `eas submit -p ios` → “Select a build from EAS” → pick the new production build

3) Install from TestFlight on device and open once online
- This wires the device to the production channel and current runtime version.

## Daily Fixes via OTA (No Apple Involved)

1) Set any environment flags in `nail-app-mobile/.env` (they are baked at publish time):
- Internal testing only: `EXPO_PUBLIC_DISABLE_PAYWALL=1` (unlocks premium UI; do NOT ship to real users)
- Optional diagnostic overlay: `EXPO_PUBLIC_DIAGNOSTICS=1`

2) Publish OTA to the production channel
- `cd nail-app-mobile`
- `npm run update:production`

3) On the device
- Force‑quit and relaunch the TestFlight app while online.
- Expect updates to load within seconds on first screen.

## Verifying On Device

- With `EXPO_PUBLIC_DIAGNOSTICS=1`, a small overlay appears showing:
  - `ch:production` (channel)
  - `rv:1.0.0` (runtimeVersion from `app.json`)
  - `paywallOff:true|false` (whether premium gating is bypassed)
- Shapes: with the bypass flag on, all shapes are unlocked and default to Almond for new users.
- Camera: preview initializes; if not, the Camera screen overlay (diagnostics on) shows which gate is stuck (permission, focus, layout, activation, ready).

## When To Cut A New Binary

- You changed native modules/plugins, Info.plist, entitlements, icons/splash, or `runtimeVersion`.
- OTA doesn’t apply (wrong channel/runtime on the installed app) and you need to realign.
- Apple rejected a duplicate upload: bump `ios.buildNumber` and rebuild.

## Troubleshooting (Fast)

- No changes after OTA:
  - You likely published to the wrong channel. TestFlight listens to `production`. Use `npm run update:production`.
  - Or the binary was built from the wrong place. Always build from `nail-app-mobile/`.
- Duplicate build error on submit:
  - Bump `ios.buildNumber` in `app.json` and `CFBundleVersion` in `Info.plist`, rebuild, resubmit.
- Camera stays black in release:
  - Confirm iOS Settings → NailGlow → Camera is ON.
  - Ensure you’re on the new TestFlight build (then publish OTA to `production`).
  - If still stuck, rebuild once to realign native bits; then OTA is instant going forward.
- Shapes locked or Continue disabled for new users during internal testing:
  - Make sure `EXPO_PUBLIC_DISABLE_PAYWALL=1` is set before publishing the OTA.

## Command Cheat Sheet

- Build TestFlight binary: `eas build -p ios --profile production`
- Submit to TestFlight: `eas submit -p ios`
- Publish OTA (TestFlight): `npm run update:production`
- Publish OTA (internal QR build only): `eas update --branch preview`
- Rollback OTA: `npx eas update --rollback --branch production`

## Non‑Negotiables

- Always operate from `nail-app-mobile/` for builds and updates.
- Never ship `EXPO_PUBLIC_DISABLE_PAYWALL=1` to real users.
- If you change `runtimeVersion`, you must cut a new binary before OTA will apply again.

This is the current, working process. If anything deviates, assume the installed app isn’t on the expected channel/runtime and fix it with one fresh production build, then return to OTA for speed.
