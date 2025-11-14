# Camera Screen Redesign — iOS26 Native Controls Plan

Owner: Mobile • Last updated: 2025-11-14

## Summary
- We will use iOS native camera capabilities via `expo-camera` (AVFoundation under the hood) and keep our UI chrome minimal. Apple’s Camera app UI itself is not embeddable; we will not attempt to import the system camera chrome.
- The preview will be letterboxed to mirror iOS 26: two black bars (top/bottom). Overlays remain ours (badge, guides), and we’ll rely on native gestures (pinch‑to‑zoom) rather than custom zoom widgets.
- The flip camera control moves to the bottom‑right. Shutter stays centered. Top‑left is Close.
- We preserve existing stability guards and the 50 ms navigation delay after capture.

## Non‑Negotiables
- Native preview and behavior (focus, exposure, zoom) via `expo-camera`.
- Letterboxed layout that naturally creates black bars at the top and bottom.
- Bottom‑right flip control, centered shutter, top‑left Close.
- Minimal overlays only: selection badge and subtle framing guides. No heavy custom camera chrome.
- Keep `setTimeout(..., 50)` after capture/navigation to avoid the known initialisation race.

## Constraints & Decisions
- The system Camera UI (zoom ring, placements) is not available as reusable components. We will mimic only minimal affordances while using true native camera features.
- We will not introduce a custom native module or Dev Client in this pass. The goal is speed, parity, and stability across iOS/Android.

## Files (expected)
- Update: `nail-app-mobile/screens/CameraScreen.tsx`
- Optional Add: `nail-app-mobile/components/camera/OverlayGuides.tsx` (four subtle corner guides)

## Implementation Steps
1) Letterboxed Preview
- Keep `CameraView` but constrain its height to a 4:3 box computed from `useWindowDimensions().width`; container background stays pure black, yielding the two bars.
- Respect `useSafeAreaInsets()` for overlay placement.

2) Mount Sequencing & Stability (preserve existing guards)
- Keep `isFocused` + `hasLaidOut` + `InteractionManager.runAfterInteractions` + `active={...}` gating.
- Keep `key={camRetry}` fallback remount.
- Preserve the explicit 50 ms delay before any `navigation.navigate(...)` after capture.

3) Controls & Layout
- Top: Left “Close” only (remove top‑right flip).
- Bottom: Center shutter unchanged; move flip to bottom‑right as a round glass button; keep Upload/Design glass pill centered above the tab bar.
- Ensure `LiquidGlassTabBar` spacing avoids overlap at 390/428 widths.

4) Zoom Behavior (native feel)
- Enable pinch‑to‑zoom to drive `CameraView`’s `zoom` prop.
- Add a small “1x” chip above the shutter that cycles 1x/2x (implemented as zoom presets). This mirrors iOS affordance without rebuilding a full zoom ring.
- For front camera, hide the chip (or keep at 1x) pending design confirmation.

5) Overlays
- Keep the selection badge (`NativeLiquidGlass`) exactly as today, non‑interactive.
- Add optional subtle corner guides via `OverlayGuides` (very low opacity).

6) Accessibility & Haptics
- Shutter/Flip/Upload/Design have labels and roles; keep haptics on shutter and flip.

## Control Mapping
- Shutter: centered (unchanged).
- Bottom‑right: flip camera (moved from top‑right).
- Upload/Design pill: centered above tab bar.
- Top‑left: Close/back.

## Acceptance Criteria
- Two black bars appear (top/bottom) with the camera preview centered between them on iPhone 15/16 (390/428 widths).
- Pinch‑to‑zoom works smoothly; the “1x” chip toggles zoom presets.
- Flip control is bottom‑right; shutter is centered; overlays render above the preview without blocking capture.
- No regressions to the capture flow; navigation after capture still includes a 50 ms delay.
- No crashes on initial mount; respects the existing focus/layout/interaction gates.

## QA Checklist
- iOS simulator (390/428) and a physical iPhone: verify letterboxing, controls, overlays, and pinch‑to‑zoom.
- Android device: verify parity (pinch‑to‑zoom, flip, shutter, overlays). Black bars may differ slightly but layout remains stable.
- VoiceOver labels for shutter, flip, upload, design.
- `npm run lint` and `npm run type-check` pass; smoke test on device.

## Out of Scope (for this pass)
- Flash/torch UI.
- Hardware lens switching UI (0.5×/1×/2× buttons). We’ll approximate via zoom presets only.
- Custom native module or Dev Client changes.

## Open Questions
- Should the “1x” chip be hidden on the front camera?
- Do we need a tap‑to‑focus indicator, or is system focus sufficient for v1?
- Any flash/torch requirement for near‑term capture scenarios?

## Rollout
- Single PR updating `CameraScreen.tsx` (plus optional `OverlayGuides.tsx`).
- Attach screenshots at 390 and 428 widths; include a short screen recording of pinch‑to‑zoom and the bottom‑right flip.
- Device smoke test before TestFlight.
