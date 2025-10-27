# iOS Build Guide: The Source of Truth

This document provides the definitive process for creating a stable iOS build for the NailGlow app. This process is designed to be repeatable and avoid the native configuration issues we have faced in the past.

## Core Principle: Trust the Prebuild

The entire build process relies on Expo's `prebuild` command. We have configured `app.json` to force `prebuild` to generate a modern, pure-Swift iOS project. 

**DO NOT MANUALLY EDIT THE FOLLOWING FILES:**
- `AppDelegate.swift`
- `main.m` (should not exist)
- `AppDelegate.h` / `AppDelegate.mm` (should not exist)

Manual changes to these files will be overwritten and will break the build. The configuration is now handled entirely by `app.json`.

---

## Required `app.json` Configuration

Your `nail-app-mobile/app.json` file must contain the following configuration. The key properties that ensure a correct build are `"language": "swift"` and `"UIApplicationSceneManifest"`.

```json
{
  "expo": {
    "name": "nail-app-mobile",
    "slug": "nail-app-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": false,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "language": "swift",
      "supportsTablet": false,
      "bundleIdentifier": "com.nailglow.app",
      "usesAppleSignIn": true,
      "infoPlist": {
        "UIApplicationSceneManifest": {
          "UIApplicationSupportsMultipleScenes": false,
          "UIApplicationSupportsTabbedSceneCollection": false
        },
        "NSCameraUsageDescription": "NailGlow needs camera access to capture photos of your nails for virtual nail polish try-on and AI transformation.",
        "NSPhotoLibraryUsageDescription": "NailGlow needs photo library access to select nail photos and save your transformed designs.",
        "NSPhotoLibraryAddUsageDescription": "NailGlow saves your transformed nail designs to your photo library so you can share them with your nail technician."
      },
      "appleTeamId": "6VLN4PNWB2"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.nailglow.app",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      "edgeToEdgeEnabled": true
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store",
      "expo-camera",
      "expo-image-picker",
      "expo-apple-authentication"
    ],
    "extra": {
      "eas": {
        "projectId": "61025c3b-d62a-4855-b314-522786643a6d"
      }
    }
  }
}
```

---

## Build Commands

Run these commands from the `nail-app-mobile/` directory.

### Step 1: Clean and Regenerate the iOS Project

This command deletes the old `ios` directory and generates a fresh, correct one based on `app.json`.

```bash
npx expo prebuild --platform ios --clean
```
*If it asks to continue with uncommitted changes, type `Y` and press Enter.*

### Step 2: Install Native Dependencies

This command links all the native code required by the project.

```bash
cd ios && pod install && cd ..
```

### Step 3: Run the App

To run a standard build on the simulator:

```bash
npm run ios
```

---

## Debugging JavaScript Errors (Dev Build)

If you encounter a runtime error (like the red screen in the app), you must run a **development build**.

1.  **Start the Dev Server:**
    This command starts the Metro bundler and tells it you're running a dev client.

    ```bash
    npm start -- --dev-client
    ```
    *Leave this terminal running.*

2.  **Run the App:**
    In a **new terminal**, run the standard `ios` command. The app will automatically connect to the dev server.

    ```bash
    npm run ios
    ```

This process will give you proper error messages and stack traces in the Metro terminal.
