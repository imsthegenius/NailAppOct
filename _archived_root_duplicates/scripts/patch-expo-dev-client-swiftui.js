const fs = require('fs');
const path = require('path');

const swiftUITargets = [
  'expo-dev-menu/ios/SwiftUI/DevMenuAppInfo.swift',
  'expo-dev-menu/ios/SwiftUI/HostUrl.swift',
  'expo-dev-menu/ios/SwiftUI/DevMenuButtons.swift',
  'expo-dev-menu/ios/SwiftUI/DevMenuRNDevMenu.swift',
  'expo-dev-menu/ios/SwiftUI/DevMenuDeveloperTools.swift',
  'expo-dev-menu/ios/SwiftUI/HeaderView.swift',
  'expo-dev-menu/ios/SwiftUI/CustomItems.swift',
  'expo-dev-launcher/ios/SwiftUI/UpdatesTab/UpdatesListView.swift',
  'expo-dev-launcher/ios/SwiftUI/UpdatesTab/UpdateRow.swift',
  'expo-dev-launcher/ios/SwiftUI/DevServerInfoModal.swift',
  'expo-dev-launcher/ios/SwiftUI/Navigation/Navigation.swift',
  'expo-dev-launcher/ios/SwiftUI/Utils/Utils.swift',
  'expo-dev-launcher/ios/SwiftUI/DevServersView.swift',
  'expo-dev-launcher/ios/SwiftUI/HomeTabView.swift',
  'expo-dev-launcher/ios/SwiftUI/DevLauncherViews.swift',
  'expo-dev-launcher/ios/SwiftUI/SettingsTabView.swift',
  'expo-dev-launcher/ios/SwiftUI/ErrorView.swift',
];

const colorReplacements = {
  'Color.expoSecondarySystemBackground': 'Color(UIColor.secondarySystemBackground)',
  'Color.expoSecondarySystemGroupedBackground': 'Color(UIColor.secondarySystemGroupedBackground)',
  'Color.expoSystemBackground': 'Color(UIColor.systemBackground)',
  'Color.expoSystemGroupedBackground': 'Color(UIColor.systemGroupedBackground)',
  'Color.expoSystemGray6': 'Color(UIColor.systemGray6)',
  'Color.expoSystemGray5': 'Color(UIColor.systemGray5)',
  'Color.expoSystemGray4': 'Color(UIColor.systemGray4)',
};

function patchSwiftUIFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[patch-expo-dev-client] Skipped (missing): ${filePath}`);
    return;
  }

  let source = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (!source.includes('import SwiftUI')) {
    console.log(`[patch-expo-dev-client] No SwiftUI import found, skipping: ${filePath}`);
    return;
  }

  if (!source.includes('import ExpoModulesCore')) {
    source = source.replace('import SwiftUI', 'import SwiftUI\nimport ExpoModulesCore');
    modified = true;
  }

  for (const [needle, replacement] of Object.entries(colorReplacements)) {
    if (source.includes(needle)) {
      source = source.split(needle).join(replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, source, 'utf8');
    console.log(`[patch-expo-dev-client] Patched: ${filePath}`);
  } else {
    console.log(`[patch-expo-dev-client] No changes needed: ${filePath}`);
  }
}

function patchDevLauncherController(root) {
  const controllerPath = path.join(root, 'expo-dev-launcher/ios/EXDevLauncherController.m');
  if (!fs.existsSync(controllerPath)) {
    console.log('[patch-expo-dev-client] Controller file missing, skipping');
    return;
  }

  let source = fs.readFileSync(controllerPath, 'utf8');
  let modified = false;

  if (!source.includes('EX_DEV_LAUNCHER_HAS_RCT_RELEASE_LEVEL')) {
    const importToken = '@import EXDevMenu;\n\n';
    const shimBlock = `@import EXDevMenu;\n\n#if __has_include(<React-RCTAppDelegate/RCTReleaseLevel.h>)\n#import <React-RCTAppDelegate/RCTReleaseLevel.h>\n#define EX_DEV_LAUNCHER_HAS_RCT_RELEASE_LEVEL 1\n#elif __has_include(<React_RCTAppDelegate/RCTReleaseLevel.h>)\n#import <React_RCTAppDelegate/RCTReleaseLevel.h>\n#define EX_DEV_LAUNCHER_HAS_RCT_RELEASE_LEVEL 1\n#else\n#define EX_DEV_LAUNCHER_HAS_RCT_RELEASE_LEVEL 0\n#endif\n\n#if !EX_DEV_LAUNCHER_HAS_RCT_RELEASE_LEVEL\ntypedef NS_ENUM(NSInteger, EXDevLauncherRCTReleaseLevel) {\n  EXDevLauncherRCTReleaseLevelStable,\n  EXDevLauncherRCTReleaseLevelCanary,\n  EXDevLauncherRCTReleaseLevelExperimental,\n};\ntypedef EXDevLauncherRCTReleaseLevel RCTReleaseLevel;\nstatic const RCTReleaseLevel Stable = EXDevLauncherRCTReleaseLevelStable;\nstatic const RCTReleaseLevel Canary = EXDevLauncherRCTReleaseLevelCanary;\nstatic const RCTReleaseLevel Experimental = EXDevLauncherRCTReleaseLevelExperimental;\n#endif\n\n`;

    if (source.includes(importToken)) {
      source = source.replace(importToken, shimBlock);
      modified = true;
    }
  }

  const initNeedle = '    self.dependencyProvider = [RCTAppDependencyProvider new];\n    self.reactNativeFactory = [[EXDevLauncherReactNativeFactory alloc] initWithDelegate:self releaseLevel:[self getReactNativeReleaseLevel]];';
  if (source.includes(initNeedle)) {
    const initReplacement = `    self.dependencyProvider = [RCTAppDependencyProvider new];\n    if ([[EXDevLauncherReactNativeFactory class] instancesRespondToSelector:@selector(initWithDelegate:releaseLevel:)]) {\n      self.reactNativeFactory = [[EXDevLauncherReactNativeFactory alloc] initWithDelegate:self releaseLevel:[self getReactNativeReleaseLevel]];\n    } else if ([[EXDevLauncherReactNativeFactory class] instancesRespondToSelector:@selector(initWithDelegate:)]) {\n      self.reactNativeFactory = [[EXDevLauncherReactNativeFactory alloc] initWithDelegate:self];\n    } else {\n      self.reactNativeFactory = [[EXDevLauncherReactNativeFactory alloc] init];\n      self.reactNativeFactory.delegate = self;\n    }`;
    source = source.replace(initNeedle, initReplacement);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(controllerPath, source, 'utf8');
    console.log('[patch-expo-dev-client] Patched EXDevLauncherController.m');
  } else {
    console.log('[patch-expo-dev-client] No controller changes needed');
  }
}

function run() {
  const root = path.join(__dirname, '..', 'node_modules');
  swiftUITargets.forEach(relative => patchSwiftUIFile(path.join(root, relative)));
  patchDevLauncherController(root);
}

try {
  run();
} catch (error) {
  console.warn('[patch-expo-dev-client] Failed:', error?.message || error);
}
