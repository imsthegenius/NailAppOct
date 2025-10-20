Incident Identifier: EAB21E8D-2530-40E4-B4AB-3CA26DFE40E3
CrashReporter Key:   c52214845baed63427b5f4ee14671d91b2cb8c68
Hardware Model:      iPhone15,3
Process:             nailappmobile [1873]
Path:                /private/var/containers/Bundle/Application/55C3826C-C34F-4389-BE05-5C949CEF6035/nailappmobile.app/nailappmobile
Identifier:          com.nailglow.app
Version:             1.0.0 (1)
Code Type:           ARM-64 (Native)
Role:                Foreground
Parent Process:      launchd [1]
Coalition:           com.nailglow.app [1119]

Date/Time:           2025-09-14 11:38:56.5238 +0400
Launch Time:         2025-09-14 11:38:56.4768 +0400
OS Version:          iPhone OS 18.5 (22F76)
Release Type:        User
Baseband Version:    3.60.02
Report Version:      104

Exception Type:  EXC_BREAKPOINT (SIGTRAP)
Exception Codes: 0x0000000000000001, 0x00000001911888c4
Termination Reason: SIGNAL 5 Trace/BPT trap: 5
Terminating Process: exc handler [1873]

Triggered by Thread:  0

Thread 0 name:   Dispatch queue: com.apple.main-thread
Thread 0 Crashed:
0   libswiftCore.dylib            	       0x1911888c4 _assertionFailure(_:_:file:line:flags:) + 172
1   nailappmobile                 	       0x10435e3d0 ExpoDevLauncherAppDelegateSubscriber.application(_:didFinishLaunchingWithOptions:) + 940
2   nailappmobile                 	       0x10435e630 @objc ExpoDevLauncherAppDelegateSubscriber.application(_:didFinishLaunchingWithOptions:) + 220
3   nailappmobile                 	       0x102c2e4c4 partial apply + 32
4   nailappmobile                 	       0x102c229c8 thunk for @escaping @callee_guaranteed (@unowned UIApplication, @unowned NSDictionary?) -> (@unowned Bool) + 180
5   nailappmobile                 	       0x102c22e7c closure #1 in ExpoAppDelegate.application(_:didFinishLaunchingWithOptions:) + 328
6   nailappmobile                 	       0x102c22ec0 partial apply for closure #1 in ExpoAppDelegate.application(_:didFinishLaunchingWithOptions:) + 28
7   libswiftCore.dylib            	       0x191237098 Sequence.forEach(_:) + 751
8   nailappmobile                 	       0x102c22cd4 ExpoAppDelegate.application(_:didFinishLaunchingWithOptions:) + 176
9   nailappmobile                 	       0x102c22fa8 @objc ExpoAppDelegate.application(_:didFinishLaunchingWithOptions:) + 220
10  nailappmobile                 	       0x102c1cd8c -[EXAppDelegateWrapper application:didFinishLaunchingWithOptions:] + 84
11  nailappmobile                 	       0x102bfc0c4 -[AppDelegate application:didFinishLaunchingWithOptions:] + 152
12  UIKitCore                     	       0x1954c7e0c -[UIApplication _handleDelegateCallbacksWithOptions:isSuspended:restoreState:] + 319
13  UIKitCore                     	       0x1954c9990 -[UIApplication _callInitializationDelegatesWithActions:forCanvas:payload:fromOriginatingProcess:] + 2987
14  UIKitCore                     	       0x1954c5908 -[UIApplication _runWithMainScene:transitionContext:completion:] + 971
15  UIKitCore                     	       0x1954c5474 -[_UISceneLifecycleMultiplexer completeApplicationLaunchWithFBSScene:transitionContext:] + 131
16  UIKitCore                     	       0x1954fc46c _UIScenePerformActionsWithLifecycleActionMask + 111
17  UIKitCore                     	       0x195500870 __101-[_UISceneLifecycleMultiplexer _evalTransitionToSettings:fromSettings:forceExit:withTransitionStore:]_block_invoke + 251
18  UIKitCore                     	       0x1955005e0 -[_UISceneLifecycleMultiplexer _performBlock:withApplicationOfDeactivationReasons:fromReasons:] + 211
19  UIKitCore                     	       0x1955002c8 -[_UISceneLifecycleMultiplexer _evalTransitionToSettings:fromSettings:forceExit:withTransitionStore:] + 607
20  UIKitCore                     	       0x1954fff30 -[_UISceneLifecycleMultiplexer uiScene:transitionedFromState:withTransitionContext:] + 243
21  UIKitCore                     	       0x1954fca5c __186-[_UIWindowSceneFBSSceneTransitionContextDrivenLifecycleSettingsDiffAction _performActionsForUIScene:withUpdatedFBSScene:settingsDiff:fromSettings:transitionContext:lifecycleActionType:]_block_invoke + 147
22  UIKitCore                     	       0x1954fd078 +[BSAnimationSettings(UIKit) tryAnimatingWithSettings:fromCurrentState:actions:completion:] + 735
23  UIKitCore                     	       0x1954fc99c _UISceneSettingsDiffActionPerformChangesWithTransitionContextAndCompletion + 223
24  UIKitCore                     	       0x1954fc64c -[_UIWindowSceneFBSSceneTransitionContextDrivenLifecycleSettingsDiffAction _performActionsForUIScene:withUpdatedFBSScene:settingsDiff:fromSettings:transitionContext:lifecycleActionType:] + 315
25  UIKitCore                     	       0x1954fc224 __64-[UIScene scene:didUpdateWithDiff:transitionContext:completion:]_block_invoke.229 + 615
26  UIKitCore                     	       0x1954fbb7c -[UIScene _emitSceneSettingsUpdateResponseForCompletion:afterSceneUpdateWork:] + 207
27  UIKitCore                     	       0x1954fb9f4 -[UIScene scene:didUpdateWithDiff:transitionContext:completion:] + 243
28  UIKitCore                     	       0x1954cb770 -[UIApplication workspace:didCreateScene:withTransitionContext:completion:] + 763
29  UIKitCore                     	       0x1954cb408 -[UIApplicationSceneClientAgent scene:didInitializeWithEvent:completion:] + 287
30  FrontBoardServices            	       0x1ad4a4528 __95-[FBSScene _callOutQueue_didCreateWithTransitionContext:alternativeCreationCallout:completion:]_block_invoke + 287
31  FrontBoardServices            	       0x1ad4a46fc -[FBSScene _callOutQueue_coalesceClientSettingsUpdates:] + 67
32  FrontBoardServices            	       0x1ad4a434c -[FBSScene _callOutQueue_didCreateWithTransitionContext:alternativeCreationCallout:completion:] + 435
33  FrontBoardServices            	       0x1ad4a3ecc __93-[FBSWorkspaceScenesClient _callOutQueue_sendDidCreateForScene:transitionContext:completion:]_block_invoke.197 + 287
34  FrontBoardServices            	       0x1ad4a3d38 -[FBSWorkspace _calloutQueue_executeCalloutFromSource:withBlock:] + 167
35  FrontBoardServices            	       0x1ad4a3ac0 -[FBSWorkspaceScenesClient _callOutQueue_sendDidCreateForScene:transitionContext:completion:] + 471
36  libdispatch.dylib             	       0x19aa46584 _dispatch_client_callout + 15
37  libdispatch.dylib             	       0x19aa31ab0 _dispatch_block_invoke_direct + 283
38  FrontBoardServices            	       0x1ad4a38ac __FBSSERIALQUEUE_IS_CALLING_OUT_TO_A_BLOCK__ + 51
39  FrontBoardServices            	       0x1ad4a3748 -[FBSMainRunLoopSerialQueue _targetQueue_performNextIfPossible] + 239
40  FrontBoardServices            	       0x1ad4a37b0 -[FBSMainRunLoopSerialQueue _performNextFromRunLoopSource] + 27
41  CoreFoundation                	       0x192ab0a8c __CFRUNLOOP_IS_CALLING_OUT_TO_A_SOURCE0_PERFORM_FUNCTION__ + 27
42  CoreFoundation                	       0x192ab08a4 __CFRunLoopDoSource0 + 171
43  CoreFoundation                	       0x192ab0764 __CFRunLoopDoSources0 + 331
44  CoreFoundation                	       0x192ab1080 __CFRunLoopRun + 839
45  CoreFoundation                	       0x192ab2c3c CFRunLoopRunSpecific + 571
46  GraphicsServices              	       0x1dfc91454 GSEventRunModal + 167
47  UIKitCore                     	       0x1954c5274 -[UIApplication _run] + 815
48  UIKitCore                     	       0x195490a28 UIApplicationMain + 335
49  nailappmobile                 	       0x102bfc8bc main + 96
50  dyld                          	       0x1b9987f08 start + 6039

Thread 1:
0   libsystem_pthread.dylib       	       0x21d1c4aa4 start_wqthread + 0

Thread 2:
0   libsystem_pthread.dylib       	       0x21d1c4aa4 start_wqthread + 0

Thread 3:
0   libsystem_pthread.dylib       	       0x21d1c4aa4 start_wqthread + 0

Thread 4:
0   libsystem_pthread.dylib       	       0x21d1c4aa4 start_wqthread + 0

Thread 5:
0   libsystem_pthread.dylib       	       0x21d1c4aa4 start_wqthread + 0

Thread 6:
0   libsystem_pthread.dylib       	       0x21d1c4aa4 start_wqthread + 0

Thread 7 name:  com.apple.uikit.eventfetch-thread
Thread 7:
0   libsystem_kernel.dylib        	       0x1e3cbfce4 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x1e3cc339c mach_msg2_internal + 75
2   libsystem_kernel.dylib        	       0x1e3cc32b8 mach_msg_overwrite + 427
3   libsystem_kernel.dylib        	       0x1e3cc3100 mach_msg + 23
4   CoreFoundation                	       0x192ab2900 __CFRunLoopServiceMachPort + 159
5   CoreFoundation                	       0x192ab11f0 __CFRunLoopRun + 1207
6   CoreFoundation                	       0x192ab2c3c CFRunLoopRunSpecific + 571
7   Foundation                    	       0x19172a79c -[NSRunLoop(NSRunLoop) runMode:beforeDate:] + 211
8   Foundation                    	       0x191730020 -[NSRunLoop(NSRunLoop) runUntilDate:] + 63
9   UIKitCore                     	       0x1954af56c -[UIEventFetcher threadMain] + 423
10  Foundation                    	       0x191790804 __NSThread__start__ + 731
11  libsystem_pthread.dylib       	       0x21d1c7344 _pthread_start + 135
12  libsystem_pthread.dylib       	       0x21d1c4ab8 thread_start + 7

Thread 8:
0   libsystem_pthread.dylib       	       0x21d1c4aa4 start_wqthread + 0

Thread 9:
0   libsystem_pthread.dylib       	       0x21d1c4aa4 start_wqthread + 0


Thread 0 crashed with ARM Thread State (64-bit):
    x0: 0x80000001045dbfb0   x1: 0xffffffffb0000000   x2: 0x0000000000000058   x3: 0xfffff0007fc00000
    x4: 0x000000010a0640c0   x5: 0x0000000000000013   x6: 0x0000000000000020   x7: 0xde986cd1a1d917df
    x8: 0x0000000000000000   x9: 0x000000007fbab7f9  x10: 0x0000000000000000  x11: 0x0000000000000000
   x12: 0x0001800b80454806  x13: 0x0001700000454400  x14: 0x0000000000054800  x15: 0x0000000000000015
   x16: 0x952d00010a064060  x17: 0x0000000017000400  x18: 0x0000000000000000  x19: 0x0000000000000000
   x20: 0x000000016d204880  x21: 0x0000000000000000  x22: 0x00000001ff30e368  x23: 0x00000001ff30e350
   x24: 0x00000001fd814378  x25: 0x000000016d204af0  x26: 0x000000016d204ae0  x27: 0x00000001914f1464
   x28: 0x00000001ff30e378   fp: 0x000000016d2047b0   lr: 0x00000001911888c4
    sp: 0x000000016d204730   pc: 0x00000001911888c4 cpsr: 0x00001000
   far: 0x0000000000000000  esr: 0xf2000001 (Breakpoint) brk 1

Binary Images:
       0x102bf8000 -        0x10474bfff nailappmobile arm64  <c09c1e4b4beb39aebee12fafeb155c55> /var/containers/Bundle/Application/55C3826C-C34F-4389-BE05-5C949CEF6035/nailappmobile.app/nailappmobile
       0x10864c000 -        0x1089cbfff hermes arm64  <1ab81354ee2c3de5814bfacb466e4fd5> /private/var/containers/Bundle/Application/55C3826C-C34F-4389-BE05-5C949CEF6035/nailappmobile.app/Frameworks/hermes.framework/hermes
       0x109578000 -        0x109583fff libobjc-trampolines.dylib arm64e  <9136d8ba22ff3f129caddfc4c6dc51de> /private/preboot/Cryptexes/OS/usr/lib/libobjc-trampolines.dylib
       0x191155000 -        0x1916be19f libswiftCore.dylib arm64e  <b215a4918bca3d2d81cd39e3c145ea07> /usr/lib/swift/libswiftCore.dylib
       0x195390000 -        0x1972d1b5f UIKitCore arm64e  <96636f64106f30c8a78082dcebb0f443> /System/Library/PrivateFrameworks/UIKitCore.framework/UIKitCore
       0x1ad485000 -        0x1ad5588bf FrontBoardServices arm64e  <e5499075ab013028bcb53d19f26ff7ed> /System/Library/PrivateFrameworks/FrontBoardServices.framework/FrontBoardServices
       0x19aa2b000 -        0x19aa70b1f libdispatch.dylib arm64e  <395da84f715d334e8d41a16cd93fc83c> /usr/lib/system/libdispatch.dylib
       0x192aa1000 -        0x19301dfff CoreFoundation arm64e  <7821f73c378b3a10be90ef526b7dba93> /System/Library/Frameworks/CoreFoundation.framework/CoreFoundation
       0x1dfc90000 -        0x1dfc98c7f GraphicsServices arm64e  <5ba62c226d3731999dfd0e0f7abebfa9> /System/Library/PrivateFrameworks/GraphicsServices.framework/GraphicsServices
       0x1b9949000 -        0x1b99e3857 dyld arm64e  <86d5253d4fd136f3b4ab25982c90cbf4> /usr/lib/dyld
               0x0 - 0xffffffffffffffff ??? unknown-arch  <00000000000000000000000000000000> ???
       0x21d1c4000 -        0x21d1d03f3 libsystem_pthread.dylib arm64e  <b37430d8e3af33e481e1faed9ee26e8a> /usr/lib/system/libsystem_pthread.dylib
       0x1e3cbf000 -        0x1e3cf8ebf libsystem_kernel.dylib arm64e  <9e195be11733345ea9bf50d0d7059647> /usr/lib/system/libsystem_kernel.dylib
       0x19171b000 -        0x19238eddf Foundation arm64e  <34de055d8683380a9198c3347211d13d> /System/Library/Frameworks/Foundation.framework/Foundation

EOF

