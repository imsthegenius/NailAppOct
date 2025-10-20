#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTLog.h>
#import <React/RCTAssert.h>
#import <React/RCTBridge.h>
#import <React/RCTBridgeModule.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  // Observe JS load success/failure to surface silent errors in Release
  [[NSNotificationCenter defaultCenter] addObserverForName:RCTJavaScriptDidLoadNotification
                                                    object:nil
                                                     queue:[NSOperationQueue mainQueue]
                                                usingBlock:^(__unused NSNotification *n) {
    NSLog(@"[RN] JavaScript did load");
  }];
  [[NSNotificationCenter defaultCenter] addObserverForName:RCTJavaScriptDidFailToLoadNotification
                                                    object:nil
                                                     queue:[NSOperationQueue mainQueue]
                                                usingBlock:^(NSNotification *n) {
    NSLog(@"[RN] JavaScript failed to load: %@", n.userInfo);
  }];
#pragma clang diagnostic pop

#ifndef NDEBUG
  RCTSetFatalHandler(^(__unused NSError *error) {
    NSLog(@"RCTFatal: %@", error);
  });
  RCTSetLogFunction(^(RCTLogLevel level, RCTLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
    if (level >= RCTLogLevelError) {
      NSLog(@"RCTLogError [%ld]: %@:%@ %@", (long)level, fileName, lineNumber, message);
    }
  });
#else
  RCTSetFatalHandler(^(__unused NSError *error) {
    NSLog(@"RCTFatal: %@", error);
  });
  RCTSetLogFunction(^(RCTLogLevel level, RCTLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
    if (level >= RCTLogLevelError) {
      NSLog(@"RCTLogError [%ld]: %@:%@ %@", (long)level, fileName, lineNumber, message);
    }
  });
#endif

#if DEBUG
  // Configure Metro dev server location for on-device debugging.
  // If JS_DEV_SERVER is supplied (e.g. run arguments), use it; otherwise defer to RN's discovery.
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
  BOOL ok = [super application:application didFinishLaunchingWithOptions:launchOptions];
  // Ensure a key window exists when not using UIScene. Prevents a black screen on some setups.
  if (self.window == nil) {
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *vc = [UIViewController new];
    vc.view.backgroundColor = [UIColor colorWithRed:0.965 green:0.957 blue:0.941 alpha:1.0];
    self.window.rootViewController = vc;
    [self.window makeKeyAndVisible];
    NSLog(@"[RN] Created fallback UIWindow");
  }
  return ok;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  NSString *envHost = [[[NSProcessInfo processInfo] environment] objectForKey:@"JS_DEV_SERVER"];
  if (envHost.length > 0) {
    [[RCTBundleURLProvider sharedSettings] setJsLocation:envHost];
  } else {
    [[RCTBundleURLProvider sharedSettings] resetToDefaults];
  }
  NSURL *url = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
  NSLog(@"[JS BUNDLE URL return] %@", url.absoluteString);
  return url;
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

@end
