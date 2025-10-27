# Troubleshooting iOS Builds

This document covers common issues and fixes related to building the NailGlow iOS app, particularly when using Expo dev clients.

## Issue: App Crashes on Launch Due to Conflicting App Delegates

**Symptom:**
The application builds successfully in Xcode but crashes immediately on launch. The Xcode logs may show an `unrecognized selector sent to instance` error related to `EXExpoAppDelegate` or `window` during the `application:didFinishLaunchingWithOptions:` phase.

**Root Cause:**
A local `ExpoAppDelegateShim.swift` file exists in the `ios/nailappmobile/` directory. This file defines a custom `ExpoAppDelegate` class that conflicts with (or "shadows") the official `ExpoAppDelegate` provided by Expo's native modules (`ExpoModulesCore`).

The Expo module wrapper expects to interact with the official `ExpoAppDelegate` class, but it finds the shim instead. Because the shim does not implement all the required methods (like the `window` property), the application crashes when the system tries to call a method that doesn't exist on the shim.

**Solution:**
The conflicting shim file must be deleted from the project.

1.  **Delete the file:**
    Remove the file `ios/nailappmobile/ExpoAppDelegateShim.swift` from your project directory.

2.  **Clean and Rebuild:**
    - In Xcode, clean the build folder (**Product** → **Clean Build Folder**).
    - Re-run the build to the simulator or your device.

This ensures that only the correct, official `AppDelegate` from the Expo SDK is used, resolving the crash.
