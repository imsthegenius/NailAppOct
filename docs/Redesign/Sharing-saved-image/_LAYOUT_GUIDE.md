# Sharing Saved Image — Layout Guide

Implement the share action in `nail-app-mobile/screens/ResultsScreen.tsx` (primary) and optionally reuse from the Saved Images preview.

This design uses the **iOS native Share sheet** (system UI). Do not build a custom share modal; trigger the OS share dialog on press.

## Hierarchy (bottom → top)

```
SafeAreaView (root)
└─ View: Screen Background (z:0)
   ├─ Preview Container (z:1)
   │   └─ <Image/> or <ImageBackground/> showing the image to share
   ├─ Top Info Bar (glass) + Back/Close (z:6)
   ├─ Bottom Nav Cluster (glass) – Design / Feed (z:8)
   └─ [System] iOS Share Sheet (OS overlay) (z:∞)
```

## Stacking & Positioning
- The native Share sheet slides up over content; it is **not** part of the React layout.
- Keep top info and bottom nav visible under the sheet (system will obscure them when shown).
- Respect safe areas; ensure bottom cluster has padding to avoid the home indicator.

## Containers & Constraints
- Target widths: 390 and 428.
- Absolute overlays; preview underneath does not scroll.
- Consider temporarily disabling background taps during the share flow to avoid double interactions.

## Components (map to docs)
- Top info capsule/back: `docs/Redesign/Sharing-saved-image/colour-choice-overlay-and-back-button copy.md`
- Bottom nav cluster: `docs/Redesign/Sharing-saved-image/share-pop-up.md` (visual reference only; behavior is native share)

## Share Action (behavioral spec)
- Use the OS sheet via one of the following:
  - `Share` from `react-native` when you have a `file://` URL or HTTP(S) URL that iOS can handle.
  - `Sharing.shareAsync` from `expo-sharing` if you need to share a **local file** (recommended in Expo). If you only have a remote URL or base64, download or write it to a temporary file then share.
- Suggested flow when you have base64:
  1) Write base64 to temp path using `expo-file-system`.
  2) Call `Sharing.shareAsync(tempPath, { mimeType: 'image/jpeg' })`.
  3) Clean up temp file when done.
- Provide a single entry point handler, e.g., `onSharePress(imageUriOrBase64)`.

## React Native Structure (reference only)

```tsx
// Pseudocode — do not copy verbatim
return (
  <SafeAreaView style={s.root}>
    <View style={s.container}>
      <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />

      <View style={s.topBar}>
        <BackButton onPress={onBack} />
        <GlassInfoCapsule>
          <Text style={s.title}>{colorTitle}</Text>
          <Text style={s.meta}>{brand}</Text>
          <Text style={s.meta}>{category}</Text>
        </GlassInfoCapsule>
      </View>

      <View style={s.bottomRow}>
        <BottomGlassNav onDesign={goDesign} onFeed={goFeed} />
        <ShareButton onPress={() => onSharePress({ imageUri, base64 })} />
      </View>
    </View>
  </SafeAreaView>
)
```

## Implementation Notes
- If `imageUri` is an HTTPS link, iOS can often share directly via `Share.share({ url: imageUri })`.
- If you only have base64, prefer the temp-file approach with `expo-file-system` + `expo-sharing`.
- Keep analytics/logging out of the UI thread; if needed, defer with `InteractionManager`.
- Ensure share button is reachable (a11y label and hit slop).

## Layout Spacing (baseline)
- Top bar offset: ~12–16 from top safe area; height ~36–40.
- Bottom nav pinned to bottom safe area with horizontal padding ~16–20.
- Share button integrated with the bottom cluster per visual spec.

## Theming & Primitives
- Use existing glass primitives:
  - `components/ui/GlassmorphicView`
  - `components/ui/NativeLiquidGlass`
  - `components/ui/LiquidGlassTabBar` where applicable
- Colors from `src/theme/colors` and app tokens.

## Definition of Done (Share)
- Tapping Share opens the **native iOS share sheet** with the target image.
- No custom share UI is implemented beyond the trigger.
- Overlays respect safe areas; nav remains stable when the system sheet appears.
- `npm run type-check`, `npm run lint`, and `npm run ios` pass.
