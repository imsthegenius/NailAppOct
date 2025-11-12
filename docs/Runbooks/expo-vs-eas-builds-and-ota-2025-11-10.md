# Expo Dev Build vs EAS Build vs EAS Update

This is a plain‑English guide to why something can work in an Expo development build but fail in a TestFlight build, and how to iterate quickly without shipping a new binary for every fix.

## The moving pieces

Expo gives you two fundamentally different ways to run your app:

1) Development server (Expo Go or a dev client)
- Your code is streamed live from `expo start` with hot reload, dev menu, and rich logs. It is fantastic for UI and logic iteration, but it is not an App Store–signed environment.
- In this environment, In‑App Purchases (StoreKit/RevenueCat) are not available. Apple blocks IAP in Expo Go, on simulators, and in ad‑hoc/dev builds. You can still mock the entitlement state if you need to (we expose `EXPO_PUBLIC_DISABLE_PAYWALL`).

2) EAS build (a real binary)
- This produces an iOS app that goes through the normal Apple code signing paths. There are a few flavors:
  • Ad Hoc/dev build: installs on devices you provision; IAP is not allowed.
  • TestFlight build: distributed through App Store Connect; IAP works in Apple Sandbox and so does RevenueCat.
  • App Store/Production: live users.

On top of an EAS build, you can use EAS Update (OTA) to ship JavaScript and asset changes instantly to an already‑installed binary. OTA does not change native code or Info.plist/entitlements, but it is perfect for most UI and logic fixes.

## Why you saw “works in Expo, breaks in TestFlight”

- Expo dev builds are permissive and run with different boot flags, logging, and sometimes different bundling than a production bundle. They also skip IAP entirely. It’s common for timing, bundle size, or feature flags to mask issues locally.
- TestFlight is closer to production: the JS bundle is minified, Hermes behaves like release, and native modules (StoreKit/RevenueCat) are actually present. If a bug appears only here, you must debug against the TestFlight binary.

## Where RevenueCat actually works

- Expo Go / Dev Client: no real purchases. You can import the SDK, but StoreKit flows won’t transact. Use our flag to fake premium: `EXPO_PUBLIC_DISABLE_PAYWALL=1`.
- Ad Hoc/dev builds: still no purchases; Apple blocks IAP here.
- TestFlight: purchases work in Sandbox. This is the right place to test RevenueCat and entitlement changes.
- Production: real purchases. Use cautiously with gating and feature flags.

If you push an OTA update to a TestFlight build, RevenueCat continues to work: you’re still running inside the same signed TestFlight binary, just with newer JS.

If you set `EXPO_PUBLIC_DISABLE_PAYWALL=1`, you are intentionally bypassing all IAP logic (that’s the point). Turn it off to test RevenueCat.

## The fast iteration loop that balances both needs

- Build once for TestFlight. Ensure `expo-updates` and a stable `runtimeVersion` are set in `nail-app-mobile/app.json` so OTA updates can apply to that binary.
- Install that TestFlight app on test devices.
- For UI/logic fixes: push OTA to the `testflight` branch. No new build needed; changes arrive in seconds.
  `npm run update:testflight`
- For IAP testing (RevenueCat): make sure the paywall is enabled in the OTA you publish.
  In `.env`: `EXPO_PUBLIC_DISABLE_PAYWALL=0` (or remove it), then publish the OTA, launch TestFlight app, and test purchase/restore.
- For flows you can’t test with OTA (new native modules, Info.plist, permissions, entitlements): cut a new EAS build and upload to TestFlight. Those require a binary.

## Common pitfalls and fixes

- “RevenueCat doesn’t work with EAS Update”: It does, provided you’re updating a TestFlight build. If you’re testing via Expo Go or an Ad Hoc build, purchases won’t work by Apple policy.
- “My OTA didn’t apply”: OTA updates require the app’s `runtimeVersion` to match the server’s update. If you bump `runtimeVersion`, you must ship a new binary first.
- “It works locally but not in TestFlight”: log more and ship via OTA to TestFlight. Add temporary logs/guards, publish an OTA, reproduce quickly on the same binary.
- “I need to test premium features without IAP”: set `EXPO_PUBLIC_DISABLE_PAYWALL=1` and ship an OTA. Remember to turn it off when you test actual purchases.

## Minimal command cheat‑sheet

- Publish OTA to TestFlight channel: `npm run update:testflight`
- Roll back OTA: `npx eas update --rollback --branch testflight`
- Build a new iOS binary (when native changes are needed): `eas build --platform ios --profile production` then submit via `eas submit --platform ios`.

## Our project conventions

- The paywall flag lives in `.env` as `EXPO_PUBLIC_DISABLE_PAYWALL`. Our code reads it from `lib/paywall.ts`. Expo Go is also treated as “paywall disabled” to speed local dev.
- For internal Ad Hoc testing where IAP is impossible, keep the flag on and focus on non‑purchase features. Switch it off only when validating RevenueCat on TestFlight.

In short: do fast work in Expo dev; validate the real world via OTA onto a single TestFlight build; rebuild only when native changes force you to. That’s how you get both speed and accuracy without burning build time.

---

Plain‑English postmortem for our current confusion (10 Nov 2025)

What actually happened

We ended up with two different binaries on the device at different times and published updates to multiple branches. The QR build (“preview”) is an internal, ad‑hoc distribution signed for your devices. It does not allow IAP and listens to the “preview” update channel. The TestFlight build is Apple‑distributed and listens to its own channel (in our setup, “production”). Over‑the‑air (OTA) updates only reach the binary that matches the channel and runtimeVersion embedded at build time. Pushing updates to the wrong branch (e.g., “testflight”) did not change the TestFlight app because that app wasn’t subscribed to that branch.

Why the camera and paywall fixes didn’t appear

Two separate issues were stacked:

1) The wrong app was being updated. We published OTAs to branches that didn’t match the installed binary’s channel. That’s why the paywall bypass and camera timing changes didn’t show up: the app you opened wasn’t fetching those updates.

2) The camera can genuinely behave differently in a release binary. Even with the right OTA, if the original TestFlight build was created from the wrong folder/config (for example, built from the repo root instead of nail-app-mobile/), the binary can be missing the exact updates configuration or plugin settings we expect. In that case, OTA won’t fix the native mismatch and the camera will still refuse to initialize until we ship one fresh, correctly built TestFlight binary.

“Should I open the app from TestFlight or from the icon?”

If you only have a single binary installed, it doesn’t matter: the home screen icon and the Open button in TestFlight launch the same app. The confusion arose because we also installed an internal (QR) build; that is a different binary built from the “preview” profile. You cannot have two apps with the same bundle id installed at once, but it’s easy to replace one with the other and then forget which channel it listens to. The safest way to know which app you are running is to enable the diagnostics flag and check the overlay (we added this overlay already): it prints the OTA channel, runtimeVersion, and whether the paywall is disabled.

Why you saw “premium account unlocks shapes; new users can’t continue; camera still black”

The premium account had server‑side entitlements so it bypassed gating even on an old binary. A new user relied on the client‑side flag and OTA code paths, which never reached that particular binary, so the UI still showed locked shapes or disabled “Continue” due to missing selections. In parallel, the camera preview stayed stuck because the native bits in that binary didn’t match the JS we were publishing.

The minimal, boring plan from here

1) Install one fresh TestFlight build created from nail-app-mobile/ using the production profile so it subscribes to the “production” channel and has the correct updates URL and plugins. This is a one‑time resync; it does go through Apple, but only once.

2) Leave that TestFlight app on the device. Do not install the QR/internal build over it while testing IAP or camera. For all fixes that don’t touch native code, publish OTA to the production branch and relaunch the app.

3) Keep a tiny diagnostics overlay on while we stabilize: set EXPO_PUBLIC_DIAGNOSTICS=1 in .env before publishing. On launch, the app prints the channel (e.g., production), the runtimeVersion (e.g., 1.0.0), and whether the paywall is disabled. If the overlay shows the wrong channel or never appears, you’re not looking at the expected binary.

4) Only cut a new EAS build when the change is native: new plugins, Info.plist permissions, entitlements, or a needed bump to runtimeVersion. Everything else should ship by OTA in seconds.

One‑sentence definitions you can refer back to

• Expo dev: live dev server; fast UI iteration; no IAP.  
• EAS build: creates a signed binary (TestFlight/Store or internal QR).  
• EAS update (OTA): ships JS/assets to an installed binary that matches its channel/runtime; no Apple review.  
• “Channel”: the label the binary listens to for OTA (ours: preview, production).  
• “runtimeVersion”: must match between the binary and the update or the update won’t apply.

If you need to sanity‑check quickly

1) Delete the app, install the TestFlight build, open it once online.  
2) Publish: npm run update:production from nail-app-mobile/.  
3) Force‑quit and relaunch; the overlay should show ch:production, rv:1.0.0, paywallOff:true.  
4) Camera should initialize; shapes should be unlocked when the paywall flag is on; and the “Continue” button should enable once you pick a shape and color.
