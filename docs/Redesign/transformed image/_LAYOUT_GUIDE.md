# Transformed Image (Results) — Layout Guide

Implement in `nail-app-mobile/screens/ResultsScreen.tsx`. This guide defines the hierarchy, stacking order, and layout constraints for the main transformed image view.

## Hierarchy (bottom → top)

```
SafeAreaView (root)
└─ View: Screen Background (z:0)
   ├─ Image/Preview Container (z:1)
   │   └─ <Image/> or <ImageBackground/> showing transformed result
   ├─ Top Info Bar (glass) + Back button (z:6)
   ├─ Save CTA (glass, centered above nav) (z:8)
   ├─ Bottom Navigation (glass) – Design / Feed (z:10)
   └─ Share Button (glass, circular, right of nav cluster) (z:12)
```

## Stacking & Positioning
- **Preview** fills available vertical space below the status bar and above the bottom overlay zone.
- **Top Info Bar** is a rounded glass capsule centered near the top, with a back/close button on the left.
- **Save CTA** is a wide rounded glass button, centered horizontally, positioned above the bottom nav (respect bottom safe area).
- **Bottom Navigation** is absolutely positioned at the bottom, floating above content with `zIndex: 10`.
- **Share Button** is a separate circular glass button aligned to the right baseline of the bottom nav.

## Containers & Constraints
- Target widths: 390 and 428. Center overlays and maintain consistent vertical spacing across both.
- Apply bottom padding/margins so Save and nav never collide with the home indicator.
- Use absolute positioning for the overlays; preview content underneath should not scroll.

## Components (map to docs)
- Top info + back: `docs/Redesign/transformed image/colour-choice-overlay-and-back-button.md`
- Save CTA: `docs/Redesign/transformed image/save-button.md`
- Bottom nav cluster: `docs/Redesign/transformed image/bottom-nav.md`

## React Native Structure (reference only)

```tsx
// Pseudocode — implement structure, not exact code
return (
  <SafeAreaView style={s.root}>
    <View style={s.container}>
      {/* Result preview */}
      <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />

      {/* Top info bar with back */}
      <View style={s.topBar}>
        <BackButton onPress={onBack} />
        <GlassInfoCapsule>
          <Text style={s.title}>{colorTitle}</Text>
          <Text style={s.meta}>{brand}</Text>
          <Text style={s.meta}>{category}</Text>
        </GlassInfoCapsule>
      </View>

      {/* Save CTA */}
      <SaveButton style={s.save} onPress={onSave} label="Save" />

      {/* Bottom overlays */}
      <View style={s.bottomRow} pointerEvents="box-none">
        <BottomGlassNav onDesign={goDesign} onFeed={goFeed} />
        <ShareButton onPress={onShare} />
      </View>
    </View>
  </SafeAreaView>
)
```

## Implementation Notes
- **Navigation**
  - Back: returns to prior screen or camera, preserving pending state if present.
  - Save: persists transformed image (existing logic in ResultsScreen should remain intact).
  - Share: invokes the platform share sheet with transformed image.
- **Data contract**
  - Continue using `route.params`: `{ imageUri, transformedBase64?, originalBase64?, originalImageUri? }`.
  - If both `base64` and `uri` exist, prefer `uri` for preview due to memory usage.
- **Performance**
  - Use `resizeMode="cover"` and avoid re-renders by memoizing props.
  - Defer expensive operations (analytics, network) until after first render with `InteractionManager` if needed.

## Layout Spacing (baseline)
- Top bar offset: ~12–16 from top safe area; glass capsule height ~36–40.
- Save CTA: ~24–32 above bottom nav.
- Bottom nav: pinned to bottom safe area with horizontal padding matching design (e.g., 16–20).
- Share button: right-aligned, vertically centered to nav cluster.

## Theming & Primitives
- Use existing primitives where applicable:
  - `components/ui/GlassmorphicView`
  - `components/ui/NativeLiquidGlass`
  - `components/ui/LiquidGlassTabBar` (if reusing patterns; for this screen, nav is a custom glass cluster per spec)
- Colors from `src/theme/colors` (e.g., `BRAND_COLORS`).

## Definition of Done (Results)
- Visual parity with Figma at 390/428 widths.
- Back, Save, and Share are functional; bottom cluster actions (Design/Feed) wired.
- Overlays respect safe areas; no overlap with home indicator.
- `npm run type-check`, `npm run lint`, and `npm run ios` pass.
