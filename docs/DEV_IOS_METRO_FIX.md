# iOS Debug Bundle Fix — Metro Host Auto Detection

**Date:** 2025-09-19  
**Relevant code:** `nail-app-mobile/ios/nailappmobile/AppDelegate.mm:57`

## Problem
Debug builds were hard-coded to fetch the JavaScript bundle from `http://192.168.0.60:8081`. Whenever Metro ran on a different host, device, or network interface, React Native failed to download `index.bundle`. The native app finished launching with an empty window, so developers only saw a black screen and no Metro logs.

## Fix
We removed the hard-coded host and now let `RCTBundleURLProvider` resolve Metro automatically unless an explicit host is supplied.

```objc
#if DEBUG
  NSString *envHost = [[[NSProcessInfo processInfo] environment] objectForKey:@"JS_DEV_SERVER"];
  if (envHost.length > 0) {
    [[RCTBundleURLProvider sharedSettings] setJsLocation:envHost];
    NSLog(@"[JS DEV] Using explicit dev server: %@", envHost);
  } else {
    [[RCTBundleURLProvider sharedSettings] resetToDefaults];
    NSLog(@"[JS DEV] Using default Metro resolution");
  }
  NSURL *debugURL = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
  NSLog(@"[JS BUNDLE URL] %@", debugURL.absoluteString);
#endif
```

## Usage Notes
- For most local debugging, just run `npx expo start --dev-client --lan` and launch the app; the host is discovered automatically.
- If you need a fixed host (e.g. a custom tunnel), set the `JS_DEV_SERVER` environment variable in Xcode’s **Scheme → Run → Environment Variables** before launching.
- This behavior only applies to Debug builds. Release/IPAs still load the embedded `main.jsbundle`.

## Rollback
Restore the previous AppDelegate logic that hard-coded `192.168.0.60:8081` (see git history for this file). Only do this if you absolutely need a fixed host, because it brings back the silent black-screen failure whenever Metro runs elsewhere.
