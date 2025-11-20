# Saved Images — Layout Guide

Implement in `nail-app-mobile/screens/MyLooksScreen.tsx`.

This guide covers the full-screen Saved Image preview shown when a user taps a look in the gallery. Keep the existing grid screen (gallery) but replace the preview modal’s layout with the glass treatment below.

## Hierarchy (bottom → top)

```
SafeAreaView (root)
└─ View: Screen Background (z:0)
   ├─ Preview Container (z:1)
   │   └─ <Image/> or <ImageBackground/> showing saved/transformed image
   ├─ Top Info Bar (glass) + Close/Back (z:6)
   ├─ Bottom Nav Cluster (glass) — Design / Feed (z:8)
   └─ Optional Share Button (glass, circular, right-aligned) (z:10)
```

## Stacking & Positioning
- **Preview** fills the available space; content below is not scrollable.
- **Top Info Bar**: rounded glass capsule, centered near top. Left-aligned close/back button.
- **Bottom Nav**: floating at bottom safe area; `zIndex: 8` and absolute positioning.
- **Share Button**: circular glass button, aligned to the right baseline of the bottom nav.

## Containers & Constraints
- Target widths: 390 and 428. Maintain even vertical spacing across both.
- Respect safe areas; add bottom spacing so elements don’t collide with the home indicator.
- Absolute overlays; preview underneath remains static.

## Components (map to docs)
- Top info + back: `docs/Redesign/Saved Images/colour-choice-overlay-and-back-button copy 2.md`
- Bottom nav cluster: `docs/Redesign/Saved Images/bottom-nav copy.md`

## React Native Structure (reference only)

```tsx
// Pseudocode — adapt inside MyLooksScreen when preview is open
return (
  <SafeAreaView style={s.root}>
    {/* Existing gallery grid remains unchanged above this point */}

    {previewLook ? (
      <View style={s.previewContainer}>
        <Image source={{ uri: selectLookImageUri(previewLook) }} style={s.preview} resizeMode="cover" />

        {/* Top info bar */}
        <View style={s.topBar}>
          <CloseButton onPress={() => setPreviewLook(null)} />
          <GlassInfoCapsule>
            <Text style={s.title}>{previewLook.colorName}</Text>
            {!!previewLook.colorBrand && <Text style={s.meta}>{previewLook.colorBrand}</Text>}
            {!!previewLook.collection && <Text style={s.meta}>{previewLook.collection}</Text>}
          </GlassInfoCapsule>
        </View>

        {/* Bottom overlays */}
        <View style={s.bottomRow} pointerEvents="box-none">
          <BottomGlassNav onDesign={() => navigation.navigate('Design')} onFeed={() => navigation.navigate('Feed')} />
          <ShareButton onPress={() => {/* share saved image */}} />
        </View>
      </View>
    ) : null}
  </SafeAreaView>
)
```

## Implementation Notes
- Use your existing `previewLook` state to toggle visibility; replace the current modal card with a full-bleed preview + glass overlays.
- `selectLookImageUri(previewLook)` already prefers transformed image; keep that behavior.
- Keep delete logic accessible (context menu or long-press on grid item) — do not add destructive actions to the preview glass cluster.
- Ensure images are preloaded where possible (`Image.prefetch`) to avoid flash.

## Layout Spacing (baseline)
- Top bar offset: ~12–16 from top safe area; height ~36–40.
- Bottom nav pinned to bottom safe area; horizontal padding ~16–20.
- Share button aligned to the right of the nav cluster, vertically centered.

## Theming & Primitives
- Use existing glass primitives:
  - `components/ui/GlassmorphicView`
  - `components/ui/NativeLiquidGlass`
- Colors and typography from `src/theme/colors` and app tokens.

## Definition of Done (Saved Images)
- Gallery grid behavior unchanged; tap opens full-screen preview with the new glass layout.
- Top info, bottom nav, and (if used) share button match Figma at 390/428.
- All overlays respect safe areas; no overlap with home indicator.
- `npm run type-check`, `npm run lint`, and `npm run ios` pass.
