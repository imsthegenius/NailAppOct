# Saved Images Screen - Implementation Notes

**Date**: November 17, 2025  
**File Modified**: `nail-app-mobile/screens/MyLooksScreen.tsx`  
**Status**: ✅ Completed

## Changes Implemented

### Overview
Updated the full-screen preview modal to match exact Figma specifications from `colour-choice-overlay-and-back-button copy 2.md` and `bottom-nav copy.md`.

### Known Issue: Preview not showing glass overlays on device
- **Date observed:** Nov 18, 2025
- **Symptoms:** On physical devices launched via `expo start --lan` + Cloudflare tunnel, the close button, capsule, and LiquidGlassTabBar occasionally fail to render (screenshot attached by Imraan). The grid renders, but the preview modal keeps the old black overlay.
- **Cause:** Metro served an older bundle from cache when Expo Go reconnected through a new tunnel URL. The app didn’t reload the latest `MyLooksScreen.tsx` changes, so the preview fell back to pre-redesign styles.
- **Workaround:** Force a full reload after connecting through the new tunnel: shake device ➝ “Reload” or kill Expo Go and re-scan the QR/exp link. Always run `npx expo start --clear` after editing preview components so stale bundles aren’t reused when switching tunnels.

### Known Issue: Feed → Saved Look Preview still shows legacy UI
- **Scenario:** From `FeedScreen`, tapping a saved design opens the preview handled inside `FeedScreen`’s modal (added months ago for saved looks inside Feed).
- **Status:** That modal still uses the legacy overlay (plain close button, white text at bottom). The redesign work in `MyLooksScreen.tsx` does not affect this codepath, so users coming from Feed will continue to see the old UI until `FeedScreen` adopts the same Liquid Glass components.
- **Action:** Track separately as “Feed preview parity” and update `FeedScreen`’s modal to reuse the Saved Images primitives once the Feed redesign stabilizes.

## 1. Top Bar - Back Button + Info Capsule

### Back/Close Button
**Figma Spec**: 44x44px circular glass button

```tsx
<View style={styles.closeButtonGlass}>
  <Ionicons name="close" size={15} color="white" />
</View>
```

**Styling**:
- Dimensions: 44x44px
- Border radius: 100px (fully circular)
- Background: `rgba(0,0,0,0)` (transparent)
- Border: 1px, `rgba(255,255,255,0.40)`
- Shadow: `rgba(0,0,0,0.13)`, offset (0, -1), radius 1
- Icon size: 15px (reduced from 24px)

### Info Capsule
**Figma Spec**: 321x38px centered capsule with horizontal text layout

```tsx
<View style={styles.previewGlassCapsule}>
  <Text style={styles.previewTitle}>Colour Title</Text>
  <Text style={styles.previewMeta}>Brand</Text>
  <Text style={styles.previewMeta}>Category</Text>
</View>
```

**Styling**:
- Dimensions: 321x38px
- Position: Absolutely centered `left: (width - 321) / 2`
- Border radius: 10px
- Background: `rgba(0,0,0,0)` (transparent)
- Border: 1px, `rgba(255,255,255,0.40)`
- Shadow: `rgba(0,0,0,0.13)`, offset (0, -1), radius 9
- Gap between text: 65px (horizontal spacing)

**Typography**:
- Title: 14px, semibold (600), white, centered
- Meta: 12px, medium (500), white, centered

**Changes from Previous**:
- ❌ Removed: `NativeLiquidGlass` wrapper
- ❌ Removed: Color dot indicator
- ❌ Removed: Vertical text layout with metadata row
- ✅ Added: Horizontal text layout with fixed gaps
- ✅ Added: Exact Figma dimensions and positioning

## 2. Bottom Navigation Cluster

### Tab Bar (Design/Feed)
**Figma Spec**: Glass tab bar with selected state for Design

```tsx
<View style={styles.previewBottomNavGlass}>
  <TouchableOpacity style={styles.previewNavButton}>
    <View style={styles.previewNavButtonSelected}>
      <Ionicons name="expand" size={24} color="#E70A5A" />
      <MaskedView maskElement={...}>
        <LinearGradient colors={[...]}>
          <Text style={styles.previewNavLabel}>Design</Text>
        </LinearGradient>
      </MaskedView>
    </View>
  </TouchableOpacity>
  
  <TouchableOpacity style={styles.previewNavButton}>
    <Ionicons name="heart" size={24} color="#999999" />
    <Text style={styles.previewNavLabelInactive}>Feed</Text>
  </TouchableOpacity>
</View>
```

**Container Styling**:
- Border radius: 28px
- Background: `rgba(0,0,0,0)` (transparent)
- Border: 1px, `rgba(255,255,255,0.40)`
- Shadow: `rgba(0,0,0,0.20)`, offset (0, -1), radius 2
- Padding: 10px horizontal, 4px vertical

**Button Styling**:
- Dimensions: 102px width per button
- Layout: Column (icon above text)
- Gap: 1px between icon and text
- Padding: 6px top, 7px bottom, 8px horizontal

**Selected State (Design)**:
- Background: `#ededed` rounded pill (100px radius)
- Position: Absolute inset (4px from edges)
- Icon color: `#E70A5A`
- Text: Gradient fill using `MaskedView`
  - Colors: `rgba(255,161,186,0.7)` → `rgba(231,10,90,0.7)`
  - Font: 10px, bold (700), 12px line height

**Inactive State (Feed)**:
- Icon color: `#999999`
- Text color: `#999999`
- Font: 10px, medium (500), 12px line height

### Share Button
**Figma Spec**: 48x48px circular glass button

```tsx
<View style={styles.previewShareButtonGlass}>
  <Ionicons name="share-social-outline" size={27} color="white" />
</View>
```

**Styling**:
- Dimensions: 48x48px
- Border radius: 296px (fully circular)
- Background: `rgba(0,0,0,0)` (transparent)
- Border: 1px, `rgba(255,255,255,0.40)`
- Shadow: `rgba(0,0,0,0.20)`, offset (0, -1), radius 2
- Icon size: 27px

## 3. Layout & Positioning

### Overall Structure
```
SafeAreaView (root)
└─ Modal (visible when previewLook is set)
   └─ View (previewContainer)
      ├─ SmartImage (full-bleed preview)
      ├─ SafeAreaView (previewTopSection, z:10)
      │  └─ View (previewTopBar)
      │     ├─ Back Button (44x44)
      │     └─ Info Capsule (321x38, centered)
      └─ SafeAreaView (previewBottomSection, z:10)
         └─ View (previewBottomRow)
            ├─ Tab Bar (Design/Feed)
            └─ Share Button (48x48)
```

### Spacing
- Top bar: `paddingHorizontal: 16`, `paddingTop: 0`, `height: 44`
- Info capsule: `top: 3` offset from top bar
- Bottom row: `paddingHorizontal: 28`, `paddingTop: 16`, `paddingBottom: 32`
- Bottom layout: `justifyContent: 'space-between'` (tab bar left, share right)

## Dependencies Added
- `@react-native-masked-view/masked-view`: For gradient text in tab labels
- `expo-linear-gradient`: Already in project, used for gradients

## Styles Added/Modified

### New Styles
- `closeButtonGlass`: Exact Figma glass effect for back button
- `previewBottomNavGlass`: Glass container for tab bar
- `previewNavButtonSelected`: Selected state background pill
- `previewNavLabel`: Base style for tab labels
- `previewNavLabelMask`: Mask element styling
- `previewNavLabelGhost`: Ghost text for gradient dimensions
- `previewNavLabelInactive`: Inactive tab label styling
- `previewShareButtonGlass`: Exact Figma glass effect for share button

### Modified Styles
- `previewTopBar`: Updated dimensions and padding
- `closeButton`: Removed glass wrapper, updated to container only
- `previewGlassCapsule`: Complete restructure for centered positioning and horizontal layout
- `previewTitle`: Updated font specs to match Figma
- `previewMeta`: Updated font specs and removed row wrapper
- `previewBottomRow`: Updated padding and justification
- `previewBottomNav`: Simplified to container only
- `previewNavButton`: Updated dimensions and layout
- `previewShareButton`: Updated to container only

### Removed Styles
- `previewColorDot`: No longer used (color dot removed)
- `previewInfoBlock`: No longer needed (flat layout)
- `previewMetaRow`: No longer needed (horizontal layout)
- `previewNavText`: Replaced with specific label styles
- `previewNavDivider`: No longer needed (separate buttons)

### Removed Components
- `NativeLiquidGlass`: Replaced with manual glass styling using `View` components
  - Reason: Precise control over Figma specifications
  - Glass effects now use exact border, shadow, and backdrop values from Figma

## Visual Changes Summary

| Element | Before | After |
|---------|--------|-------|
| **Back button icon** | 24px | 15px |
| **Info capsule layout** | Vertical with color dot | Horizontal text only |
| **Info capsule width** | Flexible | Fixed 321px centered |
| **Info capsule gaps** | 8px row gaps | 65px horizontal gaps |
| **Tab bar buttons** | Horizontal icons+text | Vertical stacked |
| **Selected tab background** | None | #ededed pill |
| **Selected tab text** | White | Gradient fill |
| **Tab icons** | 20px | 24px |
| **Share icon** | 22px | 27px |
| **Share button size** | 56px | 48px |

## Glass Effect Specifications

All glass effects now use exact Figma values:

### Top Elements (Back button, Info capsule)
- Border: `rgba(255,255,255,0.40)`
- Shadow color: `rgba(0,0,0,0.13)`
- Shadow offset: `(0, -1)`
- Shadow radius: 1-9 (varies by element)

### Bottom Elements (Tab bar, Share button)
- Border: `rgba(255,255,255,0.40)`
- Shadow color: `rgba(0,0,0,0.20)`
- Shadow offset: `(0, -1)`
- Shadow radius: 2

## Testing
- ✅ `npm run lint` - No errors
- ✅ TypeScript type check - No errors
- ✅ Visual inspection - Matches Figma designs
- ⏳ Device testing pending

## Functional Behavior
- ✅ Tap image in grid → Opens full-screen preview
- ✅ Close button → Dismisses preview
- ✅ Design button → Navigates to Design screen
- ✅ Feed button → Navigates to Feed screen
- ✅ Share button → Opens native share sheet
- ✅ Long-press on grid item → Delete confirmation

## Notes
- The info capsule text layout uses fixed 65px gaps per Figma spec
- Text may overflow if content is too long (relies on `numberOfLines={1}`)
- Selected state is hardcoded to "Design" tab (matches typical usage from saved looks)
- Share functionality preserves existing behavior (native sheet, temp file for base64)
- Gallery grid behavior remains completely unchanged

## Figma Component References
- Top bar: `docs/Redesign/Saved Images/colour-choice-overlay-and-back-button copy 2.md`
- Bottom nav: `docs/Redesign/Saved Images/bottom-nav copy.md`
- Layout guide: `docs/Redesign/Saved Images/_LAYOUT_GUIDE.md`

