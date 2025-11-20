# Camera Screen — Layout Guide

This document defines the canonical hierarchy, stacking order, and layout constraints for the Camera screen. Implement in `nail-app-mobile/screens/CameraScreen.tsx` using the existing primitives. Do not rewrite lifecycle logic.

## Hierarchy (bottom → top)

```
SafeAreaView (root)
└─ View: Screen Background (black, z:0)
   ├─ CameraView Container (z:1)
   │   └─ <CameraView ref={cameraRef} .../>
   ├─ Corner Framing Overlay (z:5)
   ├─ Controls Stack (z:8)
   │   ├─ Zoom Chip (centered, above shutter)
   │   └─ Shutter Button (center bottom)
   ├─ Flip Camera Button (right-bottom, above tab bar)
   └─ LiquidGlassTabBar (absolute, fixed to bottom, z:10)
```

## Stacking & Positioning
- **CameraView** fills available area; respect safe areas.
- **Corner Overlay** sits atop the preview (do not intercept touches).
- **Controls** are absolutely positioned inside the preview region:
  - Zoom chip centered horizontally, ~80–120 px above shutter.
  - Shutter is centered at bottom; large circular button.
- **Flip Camera** action sits bottom-right, vertically aligned with shutter.
- **LiquidGlassTabBar** is fixed at the very bottom (outside the preview touch zone), `zIndex: 10`.
- Add `contentContainerStyle.paddingBottom` / bottom insets so scrollable content (if any) never overlaps the tab bar.

## Containers & Constraints
- Target widths: 390 px and 428 px. Keep controls centered and responsive across both.
- `CameraView` should use a cover strategy to avoid pillarboxing.
- Safe Area: honor top/bottom safe areas; shutter must not intrude into home indicator area.

## Lifecycle & Guardrails (DO NOT CHANGE)
- Mount sequence must remain: `onLayout` → set `hasLaidOut` → only then mount/activate `CameraView` when `isFocused` and permission is granted.
- Preserve `canActivateCamera` / `shouldRenderCamera` gates and delays; this prevents native crashes.
- Keep the 50 ms navigation delay after capture before navigating away (stability on iOS).
- Do not remove `onCameraReady` usage; ensure `isCameraReady` gates `takePicture`.

## Components (map to docs)
- Corner Overlay — `docs/Redesign/Camera Screen/Cameraoverlay.md`
- Capture + Zoom — `docs/Redesign/Camera Screen/Camera-capture-zoom.md`
- Bottom Nav + Flip Camera — `docs/Redesign/Camera Screen/Bottom-nav-flip-camera.md`

## React Native Structure (reference only)

```tsx
// Pseudocode — implement structure, not exact code
return (
  <SafeAreaView style={s.root}>
    <View style={s.container} onLayout={onLayout}>
      {shouldRenderCamera ? (
        <View style={s.previewArea}>
          <CameraView
            ref={cameraRef}
            facing={facing}
            onCameraReady={() => setIsCameraReady(true)}
            // other props: zoom, enableShutterSound, etc.
          />

          {/* Corner guides overlay */}
          <View pointerEvents="none" style={s.cornerOverlay}>
            <CornerGuides />
          </View>

          {/* Controls stack */}
          <View style={s.controls}>
            <ZoomChip />
            <Shutter onPress={takePicture} disabled={!isCameraReady || isCapturing} />
          </View>

          {/* Flip camera button */}
          <FlipButton onPress={toggleFacing} />
        </View>
      ) : (
        <View style={s.loader} />
      )}

      {/* Fixed bottom tab */}
      <LiquidGlassTabBar onCameraPress={() => nav.navigate('Camera')} />
    </View>
  </SafeAreaView>
)
```

## Implementation Notes
- **Zoom chip** toggles (e.g., 1x/2x); connect to `CameraView` `zoom` prop and pinch gesture if enabled.
- **Shutter** triggers `takePictureAsync({ quality: ~0.65, base64: true, skipProcessing: iOS })`.
- After capture, if color/shape are selected, navigate to `Processing`; otherwise store pending photo and navigate to `Design`. Maintain the 50 ms delay before navigating.
- **Flip** toggles `facing` between `back` and `front`.
- **Haptics** on shutter press (Medium impact).

## Theming & Primitives
- Use existing primitives:
  - `components/ui/LiquidGlassTabBar`
  - `components/ui/GlassmorphicView` (if needed for overlays)
  - `components/ui/NativeLiquidGlass`
- Colors: import from `src/theme/colors` (e.g., `BRAND_COLORS`).

## Definition of Done (Camera)
- Full-bleed camera preview with overlays and controls positioned per spec at 390/428 widths.
- Shutter, zoom chip, flip button functional; tab bar fixed.
- Lifecycle gates intact; no crashes when navigating away/back.
- `npm run type-check`, `npm run lint`, and `npm run ios` pass.
