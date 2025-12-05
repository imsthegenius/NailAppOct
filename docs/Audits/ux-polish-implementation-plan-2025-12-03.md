# UX Polish Implementation Plan

**Date:** 2025-12-03  
**Status:** Planning  
**Estimated Total Effort:** 8-12 hours  
**Last Updated:** 2025-12-04 (Re-audited for snappiness)

---

## Executive Summary

This plan addresses UX polish items to make the app feel "super modern, smooth, and well put together" without any redesigns. Focus is on:

1. **🚀 Snappiness** - Faster animation timing, tighter spring tensions, reduced delays
2. **📳 Haptic Feedback** - Consistent tactile response across all interactions
3. **🔧 Bug Fixes** - Scanner range, progress curve timing

### ✅ APPROVED Changes (Timing/Haptics Only)
| Change | Impact | File |
|--------|--------|------|
| DesignScreen spring tension 40→65 | High | `DesignScreen.tsx` |
| SplashScreen delay 800→500ms | High | `SplashScreen.tsx` |
| ProcessingScreen fade 800→400ms | Medium | `ProcessingScreen.tsx` |
| ProcessingScreen pulse 1000→700ms | Medium | `ProcessingScreen.tsx` |
| Scanner line range fix | Medium | `ProcessingScreen.tsx` |
| Progress exponential decay | Medium | `ProcessingScreen.tsx` |
| Onboarding swipe haptic | Low | `OnboardingScreen.tsx` |
| Pull-to-refresh in Feed | Low | `FeedScreen.tsx` |
| GlassToast duration 1500→2000ms | Low | `GlassToast.tsx` |

### ❌ SKIPPED Changes (Design Changes)
| Item | Reason |
|------|--------|
| SkeletonShimmer component | New visual component |
| Skeleton grid in DesignScreen | Requires new component |
| GlassToast → NativeLiquidGlass | Glass element change |
| Camera capture flash effect | New visual effect |
| Animate active dot (scale 1.3) | Design change |
| Gradient continue button | Design/color change |
| ResultsScreen entrance animation | New animation code |
| SplashScreen exit fade | New animation wrapper |
| Shape sheet slide-up animation | New animation code |
| lib/haptics.ts utility | New file, refactor needed |

---

## ⚠️ Scope Limitations

### DO NOT TOUCH
- `MainNavigator.tsx` - The tab swipe flow (Design ↔ Camera ↔ Feed)
- `MainTabs` component
- Any navigation logic in `DesignScreen`, `CameraScreen`, `FeedScreen`
- The `transitionFrom` parameter system
- `navigation.jumpTo()` calls in main tabs
- Gesture handlers for tab swiping
- `cardStyleInterpolator` configurations

### SAFE TO MODIFY (Timing Only)
- `ProcessingScreen.tsx` - Animation timing, scanner range, progress curve
- `SplashScreen.tsx` - Delay timing only (800→500ms)
- `FeedScreen.tsx` - Pull-to-refresh only (NOT navigation)
- `DesignScreen.tsx` - Spring tension only (NOT navigation)
- `OnboardingScreen.tsx` - Swipe haptic only
- `components/ui/GlassToast.tsx` - Duration only (1500→2000ms)

### Navigation Rules
- Never modify `navigation.jumpTo()` behavior
- Never change `navigation.replace()` to `navigation.navigate()` in main app flow
- Never alter the spatial model: Design (left) ↔ Camera (center) ↔ Feed (right)
- Keep all `setTimeout(..., 50)` delays in CameraScreen for mount safety

---

## Phase 1: ProcessingScreen Animation Fixes (1.5 hours)
*Highest impact – directly affects perceived performance*

### File: `screens/ProcessingScreen.tsx`

### Problem
1. Scanner line doesn't reach bottom of screen
2. Progress jumps to 95% too quickly (~2-3 seconds)
3. Users feel "stuck" at 95% waiting for Gemini response

### Changes

#### 1.1 Fix Scanner Line Range
```tsx
// Location: ~line 348-350
// Current:
outputRange: [-100, height - 200],

// Change to:
outputRange: [-100, height + 100],
```
**Rationale:** Scanner should sweep fully off-screen at bottom

#### 1.2 Slow Down Progress Curve with Exponential Decay
```tsx
// Location: ~lines 85-100
// Current:
const progressInterval = setInterval(() => {
  setProgress(prev => {
    const newProgress = Math.min(prev + Math.random() * 15 + 5, 95);
    // ...
  });
}, 200);

// Change to:
const progressInterval = setInterval(() => {
  setProgress(prev => {
    // Exponential decay: slows down as it approaches 95%
    const remaining = 95 - prev;
    const increment = Math.max(remaining * 0.08, 0.5);
    const newProgress = Math.min(prev + increment, 95);
    
    if (selectedColor && selectedShape) {
      setProcessingMessage(getProcessingMessage(newProgress, selectedColor.name, selectedShape.name));
    }
    
    if (newProgress >= 95) {
      clearInterval(progressInterval);
    }
    
    return newProgress;
  });
}, 350);
```
**Rationale:** Progress now takes ~10-12 seconds to reach 95%, matching typical Gemini response time

#### 1.3 Slow Scanner Animation
```tsx
// Location: ~lines 237-250
// Current:
duration: 2000,

// Change to:
duration: 2800,
```
**Rationale:** Slower sweep feels more premium and relaxed

#### 1.4 Stagger Sparkle Animations
```tsx
// Location: ~lines 273-276
// Current:
animateSparkle(sparkle1Anim, 0);
animateSparkle(sparkle2Anim, 400);
animateSparkle(sparkle3Anim, 800);
animateSparkle(sparkle4Anim, 1200);

// Change to:
animateSparkle(sparkle1Anim, 0);
animateSparkle(sparkle2Anim, 700);
animateSparkle(sparkle3Anim, 1400);
animateSparkle(sparkle4Anim, 2100);
```
**Rationale:** More varied timing feels organic, less mechanical

### Testing Checklist
- [ ] Progress bar reaches 95% in ~10-12 seconds (not 2-3)
- [ ] Scanner line sweeps fully from top to bottom and off-screen
- [ ] Sparkles feel varied and organic
- [ ] Navigation to Results still works after Gemini completes
- [ ] Back navigation still works if user cancels

---

## Phase 2: Loading States & Shimmer Components ~~(2 hours)~~ ❌ SKIPPED
*~~Eliminates flicker and improves perceived performance~~*

> **SKIPPED:** This phase involves creating new visual components (SkeletonShimmer) which is a design change, not a timing improvement. Only **2.2 Pull-to-Refresh** is approved.

### ✅ APPROVED: 2.2 Pull-to-Refresh Only

### New File: `components/ui/SkeletonShimmer.tsx`

```tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonShimmerProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonShimmer: React.FC<SkeletonShimmerProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};
```

### File: `screens/FeedScreen.tsx`

#### 2.1 Replace Opacity Trick with Shimmer
```tsx
// Location: renderLookItem function
// Current:
<SmartImage ... style={[styles.lookImage, !loaded && { opacity: 0.01 }]} />
{!loaded && (
  <View style={styles.imagePlaceholder}>
    <Ionicons name="image-outline" size={20} color="rgba(255,255,255,0.65)" />
  </View>
)}

// Change to:
{!loaded && (
  <SkeletonShimmer
    width="100%"
    height="100%"
    borderRadius={0}
    style={StyleSheet.absoluteFillObject}
  />
)}
<SmartImage
  ...
  style={[styles.lookImage, { opacity: loaded ? 1 : 0 }]}
/>
```

#### 2.2 Add Pull-to-Refresh
```tsx
// Add import:
import { RefreshControl } from 'react-native';

// In FlatList:
<FlatList
  ...
  refreshControl={
    <RefreshControl
      refreshing={loading}
      onRefresh={refresh}
      tintColor="#E70A5A"
      colors={['#E70A5A']}
    />
  }
/>
```

**⚠️ DO NOT MODIFY:** `navigation.jumpTo()` calls, `handleNavigateFromPreview`, or any navigation logic

### File: `screens/DesignScreen.tsx`

#### 2.3 Add Skeleton Grid During Initial Load
```tsx
// Location: renderEmpty function
// Current:
{initialising ? (
  <ActivityIndicator color={theme.accent} />
) : (
  // empty state
)}

// Change to:
{initialising ? (
  <View style={styles.skeletonGrid}>
    {Array.from({ length: 12 }).map((_, i) => (
      <SkeletonShimmer
        key={i}
        width={CARD_WIDTH}
        height={CARD_WIDTH}
        borderRadius={12}
        style={{ marginRight: i % 4 !== 3 ? GRID_GAP : 0, marginBottom: GRID_GAP }}
      />
    ))}
  </View>
) : (
  // existing empty state
)}

// Add style:
skeletonGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: GRID_SIDE_INSET,
  paddingTop: 20,
},
```

**⚠️ DO NOT MODIFY:** `handleContinue`, `navigation.jumpTo()`, `navigation.getParent()?.navigate()`, or any navigation logic

### Testing Checklist
- [ ] Feed images show shimmer while loading (no flicker)
- [ ] Pull-to-refresh works in Feed
- [ ] Design screen shows skeleton grid during initial load
- [ ] Tab navigation still works: Design ↔ Camera ↔ Feed
- [ ] Swipe gestures still work between tabs

---

## Phase 3: Haptic Feedback Standardization ~~(1 hour)~~ ✅ PARTIAL
*Consistent tactile feedback across the app*

> **PARTIAL:** Skip creating `lib/haptics.ts` utility file. Only implement **3.1 Onboarding Swipe Haptic** directly.

### ❌ SKIPPED: New File `lib/haptics.ts`
*(Creating new utility files is out of scope)*

### ✅ APPROVED: File `screens/OnboardingScreen.tsx`

#### 3.1 Add Haptic on Page Swipe
```tsx
// Location: onViewableItemsChanged callback
// Current:
const onViewableItemsChanged = useRef(
  ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }
).current;

// Change to:
const prevIndexRef = useRef(0);
const onViewableItemsChanged = useRef(
  ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== prevIndexRef.current) {
        Haptics.selectionAsync();
        prevIndexRef.current = newIndex;
      }
      setCurrentIndex(newIndex);
    }
  }
).current;
```

### Haptic Usage Guide

| Screen | Action | Haptic Type | Status |
|--------|--------|-------------|--------|
| OnboardingScreen | Page swipe | `selection` | ⬜ Add |
| OnboardingScreen | Skip button | `light` | ✅ Exists |
| CameraScreen | Photo capture | `medium` | ✅ Exists |
| CameraScreen | Flip camera | `light` | ✅ Exists |
| DesignScreen | Color select | `light` | ✅ Exists |
| DesignScreen | Shape select | `light` | ✅ Exists |
| FeedScreen | Look tap | `light` | ✅ Exists |
| ResultsScreen | Save | `medium` | ✅ Exists |
| GlassToast | Show | `success` | ✅ Exists |

### Testing Checklist
- [ ] Haptic fires on onboarding page swipe
- [ ] No double-haptics on any action
- [ ] Haptics feel consistent across the app

---

## Phase 4: Screen Transitions & Entrance Animations ~~(2 hours)~~ ❌ SKIPPED
*~~Premium feel on screen changes~~*

> **SKIPPED:** All items in this phase involve adding new animation code/wrappers which are design changes, not timing tweaks.

### ❌ SKIPPED: File `screens/ResultsScreen.tsx`

#### ~~4.1 Add Entrance Animation for Result Image~~
```tsx
// Add refs at top of component:
const imageScale = useRef(new Animated.Value(0.95)).current;
const imageOpacity = useRef(new Animated.Value(0)).current;

// Add useEffect for entrance animation:
useEffect(() => {
  Animated.parallel([
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }),
    Animated.spring(imageScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start();
}, []);

// Wrap Image component:
<Animated.View
  style={[
    styles.resultImage,
    {
      opacity: imageOpacity,
      transform: [{ scale: imageScale }],
    },
  ]}
>
  <Image
    source={{ uri: imageUri }}
    style={StyleSheet.absoluteFillObject}
    resizeMode="cover"
  />
</Animated.View>
```

**⚠️ DO NOT MODIFY:** `navigation.navigate('MainTabs', ...)`, `navigation.replace()`, or any navigation calls

### File: `screens/SplashScreen.tsx`

#### 4.2 Add Exit Animation
```tsx
// Add ref:
const exitAnim = useRef(new Animated.Value(1)).current;

// Replace direct navigation with animated exit:
const navigateAway = useCallback((route: NextRoute) => {
  Animated.timing(exitAnim, {
    toValue: 0,
    duration: 250,
    useNativeDriver: true,
  }).start(() => {
    navigation.replace(route);
  });
}, [navigation, exitAnim]);

// In the async effect, replace:
navigation.replace('Main');
// With:
navigateAway('Main');

// Wrap container:
<Animated.View style={[styles.container, { opacity: exitAnim }]}>
  ...
</Animated.View>
```

### File: `screens/DesignScreen.tsx`

#### 4.3 Add Shape Sheet Slide-Up Animation
```tsx
// Add ref:
const shapeSheetTranslateY = useRef(new Animated.Value(100)).current;

// Add useEffect:
useEffect(() => {
  Animated.spring(shapeSheetTranslateY, {
    toValue: 0,
    friction: 8,
    tension: 50,
    useNativeDriver: true,
  }).start();
}, []);

// Wrap shape sheet:
<Animated.View
  style={[
    styles.shapeSheetWrapper,
    {
      bottom: insets.bottom + 80,
      left: shapeDockInsetLeft,
      right: shapeDockInsetRight,
      transform: [{ translateY: shapeSheetTranslateY }],
    },
  ]}
>
  <NativeLiquidGlass ...>
    ...
  </NativeLiquidGlass>
</Animated.View>
```

**⚠️ DO NOT MODIFY:** `handleContinue`, `navigation.jumpTo()`, or any navigation logic

### Testing Checklist
- [ ] Results image scales in smoothly on mount
- [ ] Splash screen fades out before navigation
- [ ] Shape sheet slides up on Design screen mount
- [ ] All navigation still works correctly
- [ ] No animation conflicts with existing transitions

---

## Phase 5: Component Polish ~~(1.5 hours)~~ ✅ PARTIAL
*~~Consistency with iOS26 design language~~*

> **PARTIAL:** Only the duration change is approved. Skip glass element swap and camera flash.

### ✅ APPROVED: File `components/ui/GlassToast.tsx` (Duration Only)

#### 5.1 Increase Duration Only
```tsx
// Change default duration:
duration = 2000, // was 1500
```

### ❌ SKIPPED: NativeLiquidGlass swap
*(Glass element change - out of scope)*

### ❌ SKIPPED: File `screens/CameraScreen.tsx`

#### ~~5.2 Add Capture Flash Effect~~
*(New visual effect - out of scope)*
```tsx
// Add state and ref:
const [showFlash, setShowFlash] = useState(false);
const flashOpacity = useRef(new Animated.Value(0)).current;

// In takePicture, add flash before capture:
const takePicture = async () => {
  if (cameraRef.current && isCameraReady) {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsCapturing(true);
      
      // Flash effect
      setShowFlash(true);
      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.7,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => setShowFlash(false));
      
      const photo = await cameraRef.current.takePictureAsync({
        // ... existing options
      });
      // ... rest of function
    }
  }
};

// Add flash overlay in render (after camera, before controls):
{showFlash && (
  <Animated.View
    style={[
      StyleSheet.absoluteFillObject,
      {
        backgroundColor: '#FFFFFF',
        opacity: flashOpacity,
        zIndex: 100,
      },
    ]}
    pointerEvents="none"
  />
)}
```

**⚠️ DO NOT MODIFY:** `handleTabPress`, `navigation.jumpTo()`, or any navigation logic

### Testing Checklist
- [ ] Toast has blur effect on iOS
- [ ] Toast displays for 2 seconds
- [ ] Camera flash visible on capture
- [ ] Flash doesn't interfere with photo capture
- [ ] Tab navigation still works from Camera

---

## Phase 6: Minor Polish Items ~~(1 hour)~~ ❌ SKIPPED
*~~Quick wins~~*

> **SKIPPED:** All items in this phase are design changes (dot scaling, gradient button), not timing improvements.

### ❌ SKIPPED: File `screens/OnboardingScreen.tsx`

#### ~~6.1 Animate Active Dot~~
*(Design change - dot size modification)*

### ❌ SKIPPED: File `screens/DesignScreen.tsx`

#### ~~6.2 Add Gradient to Continue Button~~
*(Design change - color/gradient modification)*
```tsx
// Location: continueButton in shape sheet
// Current:
<TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.88}>
  <Text style={styles.continueButtonText}>Continue</Text>
  <Ionicons name="arrow-forward" size={18} color="#111" />
</TouchableOpacity>

// Change to:
<TouchableOpacity onPress={handleContinue} activeOpacity={0.88} style={styles.continueButtonWrapper}>
  <LinearGradient
    colors={['#FF80B5', '#FF1F55']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.continueButton}
  >
    <Text style={[styles.continueButtonText, { color: '#FFFFFF' }]}>Continue</Text>
    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
  </LinearGradient>
</TouchableOpacity>

// Update styles:
continueButtonWrapper: {
  borderRadius: 20,
  overflow: 'hidden',
},
continueButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 14,
  paddingHorizontal: 24,
  gap: 8,
},
```

**⚠️ DO NOT MODIFY:** `handleContinue` function logic

### Testing Checklist
- [ ] Active dot is larger than inactive dots
- [ ] Continue button has pink gradient
- [ ] Button text is white on gradient
- [ ] All navigation still works

---

## Implementation Order (APPROVED ONLY)

| Priority | Item | Time | File |
|----------|------|------|------|
| 🔴 1 | DesignScreen spring tension 40→65 | 5 min | `DesignScreen.tsx` |
| 🔴 2 | SplashScreen delay 800→500ms | 2 min | `SplashScreen.tsx` |
| 🔴 3 | ProcessingScreen fade 800→400ms | 2 min | `ProcessingScreen.tsx` |
| 🔴 4 | ProcessingScreen pulse 1000→700ms | 2 min | `ProcessingScreen.tsx` |
| 🟡 5 | Scanner line range fix | 5 min | `ProcessingScreen.tsx` |
| 🟡 6 | Progress exponential decay | 10 min | `ProcessingScreen.tsx` |
| 🟡 7 | Onboarding swipe haptic | 5 min | `OnboardingScreen.tsx` |
| 🟢 8 | Pull-to-refresh in Feed | 10 min | `FeedScreen.tsx` |
| 🟢 9 | GlassToast duration 1500→2000ms | 2 min | `GlassToast.tsx` |

**Total estimated time: ~45 minutes**

---

## Commit Strategy

```
fix(mobile): improve animation timing for snappier feel

- DesignScreen: spring tension 40→65, fade 350→200ms
- SplashScreen: delay 800→500ms
- ProcessingScreen: fade 800→400ms, pulse 1000→700ms
- ProcessingScreen: fix scanner range, exponential progress decay
- OnboardingScreen: add swipe haptic
- FeedScreen: add pull-to-refresh
- GlassToast: duration 1500→2000ms
```

---

## Pre-Implementation Checklist

- [ ] Run `npm run type-check` – no errors
- [ ] Run `npm run lint` – no errors
- [ ] Test main navigation flow works: Design ↔ Camera ↔ Feed
- [ ] Test swipe gestures work between tabs

## Post-Implementation Checklist

### After Each Phase
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Test on iOS simulator (390px width)
- [ ] Test on iOS simulator (428px width)
- [ ] Test main tab navigation still works
- [ ] Test swipe gestures still work

### Final Verification (Approved Changes Only)
- [ ] Full user flow: Splash → Onboarding → Auth → Camera → Design → Processing → Results → Feed
- [ ] DesignScreen feels snappier on tab switch (spring tension)
- [ ] SplashScreen transitions faster (500ms delay)
- [ ] ProcessingScreen fade-in is quicker (400ms)
- [ ] ProcessingScreen pulse feels more alive (700ms cycle)
- [ ] Scanner line reaches bottom of screen
- [ ] Progress bar takes ~10-12 seconds to reach 95%
- [ ] Onboarding swipe triggers haptic feedback
- [ ] FeedScreen pull-to-refresh works
- [ ] GlassToast displays for 2 seconds
- [ ] Tab navigation: Design ↔ Camera ↔ Feed works perfectly
- [ ] Physical device test (iOS)
- [ ] Physical device test (Android)

### Device-Specific Spacing Verification

**iPhone SE (375px width):**
- [ ] ProcessingScreen: Progress circle centered, no overflow
- [ ] DesignScreen: Shape sheet doesn't overlap tab bar
- [ ] ResultsScreen: Save button (350px) fits with 12.5px margins each side
- [ ] FeedScreen: Grid items don't overlap

**iPhone 14 (390px width):**
- [ ] ProcessingScreen: Scanner line reaches full width
- [ ] DesignScreen: 4-column grid has proper spacing
- [ ] ResultsScreen: Image entrance animation has no black borders
- [ ] OnboardingScreen: Dots properly spaced

**iPhone 14 Pro Max (428px width):**
- [ ] ProcessingScreen: Sparkles positioned correctly
- [ ] DesignScreen: Continue button centered in sheet
- [ ] FeedScreen: Pull-to-refresh indicator centered
- [ ] GlassToast: Centered on screen (not offset)

**Android (various):**
- [ ] All blur effects fall back gracefully
- [ ] Haptics work (or fail silently)
- [ ] No layout shifts from safe area differences

---

## Rollback Plan

If any phase breaks navigation:

1. **Identify the breaking commit** using `git log`
2. **Revert the specific commit**: `git revert <commit-hash>`
3. **Test navigation** before proceeding

If multiple phases need rollback:
```bash
git revert HEAD~N..HEAD  # Revert last N commits
```

---

## References

- Previous onboarding UX plan: `docs/Audits/onboarding-ux-improvement-plan-2025-12-03.md`
- Theme tokens: `nail-app-mobile/src/theme/tokens.ts`
- Liquid Glass components: `nail-app-mobile/components/ui/`
- Navigation types: `nail-app-mobile/navigation/types.ts`
