## ⚠️ CRITICAL: WORKSPACE CONTEXT

**The active codebase is `/nail-app-mobile/`. ALL file edits and commands MUST be executed within this directory.** The root directory contains an archived duplicate and must not be used.

---

# Mobile Redesign Implementation Plan — iOS26 (v1 solid colors)

Owner: Mobile • Updated: 2025-11-14

Scope
- Edit existing screens/components only. No new UI folders or primitives.
- Keep all flows and routes intact. No logic rewrites.
- Liquid Glass primitives only: `components/ui/LiquidGlassTabBar`, `components/ui/NativeLiquidGlass`, `components/ui/GlassmorphicView`.
- Gradients deferred to a later pass; v1 uses solid colors.

Authoritative Figma Code Exports
- Design (grid and selected card): `ColourGridSelected`, `Cover`, `CoverUnselected` (Figma export references)
- Feed: bottom tab composition identical to Design (`LiquidGlassTabBar`)
- Camera/Results/Onboarding: see exports under `docs/Redesign/*`

Absolute Rule
- Implement the Figma code visually and behaviorally using the existing React Native files. Do not add new components unless this plan explicitly lists a file under “Files & Anchors”. When code and Figma differ, Figma wins, but realize RN/Expo constraints (e.g., no conic-gradient) — follow the RN mapping below.

Source of Truth & Enforcement
- Implement the exports in `nail-app-mobile/docs/Redesign/**` exactly. These exports are the single source of truth.
- No creative deviations. If code vs. export differ, the export wins.
- Edit existing files only. Do not create/rename/delete components or screens. Do not change routes.
- Keep flows and business logic intact. This is a visual and layout pass.
- Use our existing primitives and theme tokens. No new primitives.

Allowed Touch Points
- Feed: `nail-app-mobile/screens/FeedScreen.tsx` (styles in-file)
- Camera: `nail-app-mobile/screens/CameraScreen.tsx` (styles in-file)
- Results: `nail-app-mobile/screens/ResultsScreen.tsx` (styles in-file)
- Onboarding/auth visuals:
  - `nail-app-mobile/screens/OnboardingScreen.tsx`
  - `nail-app-mobile/screens/AuthLandingScreen.tsx`
  - `nail-app-mobile/screens/LoginScreen.tsx`
  - `nail-app-mobile/screens/SignupScreen.tsx`
  - `nail-app-mobile/screens/PrivacyPolicyScreen.tsx`
  - `nail-app-mobile/screens/TermsOfServiceScreen.tsx`
- Tab bar spacing/layout only: `nail-app-mobile/components/ui/LiquidGlassTabBar.tsx`

Explicit Dependencies
- Gradients: `expo-linear-gradient` (already present).
- Gradient text (if required by export): add `@react-native-masked-view/masked-view`. If not acceptable, call out before merge; otherwise add to match exports exactly.

Status Summary
- Design screen: UPDATED to Figma — 4‑col grid; labels hidden by default; on tap, the selected card reveals “Shade Name” and “Brand” sliding from under the swatch; subtle outline/glow on the selected tile. Card and grid spacing match Figma export.
  - Implementation: `nail-app-mobile/screens/DesignScreen.tsx`
- Feed header label: DONE — “Feed” (solid text; gradients later).
  - Implementation: `nail-app-mobile/screens/FeedScreen.tsx`
- Bottom Tab Bar: REPLICATED — Feed screen uses the exact same `LiquidGlassTabBar` composition as Design (left mini‑tabs: Design/Feed; right circular Camera).
  - Implementation: `nail-app-mobile/components/ui/LiquidGlassTabBar.tsx`, used in both `DesignScreen.tsx` and `FeedScreen.tsx`
- Camera screen: UPDATED — full‑bleed preview; flip control moved to bottom‑right (round glass), added 1x/2x zoom chip above shutter; explicit delays preserved.
- Results (Saved Image): UPDATED — added small round Share button (system share sheet), kept Save and Different Selection actions.
- Onboarding (screen 1): PARTIAL — update visuals per export; keep flows.

What’s In (v1)
- Solid color fills for title/chips/CTA (no gradient deps yet).
- 4-column Design grid at 390/428 widths and on rotation.
- Bottom nav composition: left mini-tabs (Design/Feed), right Camera button.
- Preserve camera stability guards and explicit navigation delay after capture.

Out of Scope (v1)
- Supabase schema changes, new routes, or paywall logic changes.
- New native modules. Optional modules must remain gated.

—

Design Screen — Exact Figma Behavior (Implemented)

Figma code references
- Grid (selected state): `ColourGridSelected` (Figma export)
- Card (selected): `Cover` (Figma export)

React Native mapping (do not deviate)
- 4 columns: `FlatList` with `numColumns={4}` and existing `CARD_WIDTH` math. Keep `columnWrapperStyle` and `GRID_GAP` unchanged.
- Hidden labels by default: render only the square swatch for unselected cards.
- On tap: reveal label block under the swatch for the selected card only:
  - Content: line 1 = Shade Name; line 2 = Brand (no product line, no shade code in v1).
  - Animation: the label block slides out from under the swatch using Reanimated `FadeInDown` on enter and `FadeOutUp` on exit; the card uses `layout={Layout.springify()}` so rows below shift down smoothly.
- Selected outline/glow: add a subtle 2px outline and soft glow on the selected swatch to match the Figma ring.
- Gate first reveal: labels remain hidden until the user taps any swatch; initial auto‑selected item does not show labels until first tap.

Figma → RN style and layout values
- Grid columns: 4
- Horizontal side inset: 16 px (`GRID_SIDE_INSET`)
- Inter-card gap: 19 px (`GRID_GAP`)
- Card tile: square, `borderRadius: 8`, `marginBottom: 10`
- Selected tile outline: `borderWidth: 2`, `borderColor: '#FF9BC5'`, soft glow shadow (`shadowOpacity ≈ 0.35`, `shadowRadius ≈ 6`)
- Label typography: Shade name 13/600, Brand 11/regular, colors per theme; clamp to 1 line
- Animation timings: enter 180 ms (FadeInDown), exit 120 ms (FadeOutUp), layout spring with damping ≈ 16–18, stiffness ≈ 160
- “Emerges from under” effect: label block positioned immediately below tile with slight negative top margin (−2) so first pixels appear from tile edge

Component/State mapping
- Selection source: `useSelectionStore((s) => s.selectedColor)`
- On tap handler: `handleColorSelect` updates selection via `updateSelectedColor(buildSelectedColor(entry))` and sets `hasTappedColor = true`
- Accessibility: `AccessibilityInfo.announceForAccessibility('<Shade Name> selected')`

Do not do
- Do not render product line or shade code in the selected label block (v1 matches Figma’s brand-only subtitle)
- Do not change `numColumns`, `CARD_WIDTH` math, or category scroller behavior
- Do not introduce `getItemLayout` (row height changes when selected)
- Do not import web/Tailwind classes from the Figma export; use RN styles only

Code anchors
- `nail-app-mobile/screens/DesignScreen.tsx`
  - Animated wrapper: `AnimatedTouchable` around each card with `layout={Layout.springify()}`.
  - Selected tile styles: `styles.colorTileSelected` (2px outline + soft glow).
  - Label container: conditional render for selected card only, wrapped in `AnimatedRN.View` with `FadeInDown/FadeOutUp`.
  - Accessibility: announce selected shade name via `AccessibilityInfo.announceForAccessibility(...)`.

Exact edit points (keep structure, edit only these blocks)
- Imports: add `AccessibilityInfo` (RN) and `AnimatedRN, { Layout, FadeInDown, FadeOutUp }` (Reanimated)
- State: add `const [hasTappedColor, setHasTappedColor] = useState(false)` and reset it inside the `useEffect` that listens to `filters`
- Handler: in `handleColorSelect`, call `setHasTappedColor(true)` before `updateSelectedColor(...)`
- Item wrapper: replace `TouchableOpacity` with `AnimatedTouchable` and add `layout={Layout.springify().damping(18).stiffness(160)}`
- Tile styles: add `styles.colorTileSelected` and apply when `isSelected`
- Labels: wrap the name/brand in `AnimatedRN.View` with `entering={FadeInDown.duration(180)}` and `exiting={FadeOutUp.duration(120)}`; only render when `isSelected && hasTappedColor`

Acceptance
- No labels at rest; tap reveals Shade Name + Brand sliding from under the swatch; 4 columns preserved; selected tile shows subtle ring and glow.

—

Feed Screen — Implementation Steps (Using Feed Figma export)

Source of truth
- Export: `nail-app-mobile/docs/Redesign/Feed-redesign.md`
- Screen: `nail-app-mobile/screens/FeedScreen.tsx`

Steps
1) Header text
   - Title = `Feed` (DONE) at `FeedScreen.tsx:569`. Gradients later.
2) Header spacing
   - Ensure `styles.header` matches export spacing (top ≈ 16–20, horizontal 16–24). Tweak paddings only.
3) Bottom tab bar (replicate Design exactly)
   - Use the same `LiquidGlassTabBar` composition used in Design: left mini‑tabs (Design/Feed) and a separate circular Camera button on the right.
   - Props: `activeTab="Feed"`; `onTabPress={(route) => { if (route === 'Design') navigation.navigate('Design') }}`; `onCameraPress={() => navigation.navigate('Camera')}`.
   - Files: `nail-app-mobile/screens/FeedScreen.tsx` (consumer), `nail-app-mobile/components/ui/LiquidGlassTabBar.tsx` (component).
   - This is a straight replication of the Design screen’s bar; do not create a Feed‑specific variant.
   - Visual parity checklist:
     - Left glass block contains exactly two mini tabs: Design (icon: `expand`) and Feed (icon: `heart`).
     - Active tab shows the plate background under the icon/label.
     - Right-side circular button shows the Camera icon and triggers `onCameraPress`.
     - Safe-area spacing: container sits ~20 px above bottom with 20 px side insets (as in component styles).
4) Grid
   - Keep 2‑column grid and cache/prefetch logic. No structural changes.
   - Retain placeholder + fade‑in to avoid flicker.

Acceptance
- Title reads `Feed`; spacing aligns with export; tab bar routes correctly; grid performance unchanged.

—

Camera Screen (Pending refinements)
- Full‑bleed preview: `CameraView` fills the screen (no black bars). Keep safe-area for overlays only.
- Controls layout:
  - Top-left: Close only (remove top-right flip).
  - Move flip control to bottom-right (round glass button) near the shutter area.
  - Shutter centered; Upload/Design glass pill centered above the tab bar.
  - Ensure tab bar spacing on 390/428 widths.
- Zoom:
  - Keep pinch-to-zoom; add a small “1x” chip above shutter toggling 1x/2x presets; hide/cap on front camera.
- Stability:
  - Preserve focus/layout/interaction gates and remount fallback; keep explicit delay before navigating after capture.

Files & Anchors
- `nail-app-mobile/screens/CameraScreen.tsx:389` — top controls (remove top-right flip)
- `nail-app-mobile/screens/CameraScreen.tsx:398` — bottom capture controls (add bottom-right flip)
- `nail-app-mobile/screens/CameraScreen.tsx:360` — selection badge overlay (keep)
- `nail-app-mobile/components/ui/LiquidGlassTabBar.tsx:1` — tab bar spacing remains unchanged
 - Figma reference: `nail-app-mobile/docs/Redesign/Camera-resdesign.md`

Acceptance
- Full‑bleed preview without black bars; flip at bottom-right; shutter centered; pinch-to-zoom; “1x” toggle; no regressions to capture or navigation timing.

—

Feed Screen (Minor polish)
- Header title: “Feed” — DONE.
- Grid/list, caching, preview modal: keep existing logic.
- Bottom tab bar: active Feed; Design navigates to Design; Camera button opens Camera.

Files & Anchors
- `nail-app-mobile/screens/FeedScreen.tsx:569` — header title
- `nail-app-mobile/screens/FeedScreen.tsx:623` — LiquidGlassTabBar usage

Acceptance
- Title updated; existing grid performance/caching retained; tab bar behavior intact.

—

Results Screen (Saved Image) — Add Share (Pending)
- Keep existing Save + “Make Different Selection” flows.
- Add a share entry point (icon/button in the top bar or bottom actions) that opens the OS share sheet via RN `Share` API.
- Implement inside `ResultsScreen.tsx` (no new component file).

Files & Anchors
- `nail-app-mobile/screens/ResultsScreen.tsx:240` — top bar; candidate spot for a small share button
- `nail-app-mobile/screens/ResultsScreen.tsx:580` — bottom buttons (alternate spot if preferred)
Figma references
- `nail-app-mobile/docs/Redesign/saved-image.md`
- `nail-app-mobile/docs/Redesign/saved-image-share.md`

Acceptance
- Share opens OS sheet; save behavior unchanged; toast and navigation to Feed remain intact.

—

Liquid Glass Tab Bar (Global)
- Composition fixed: Design/Feed mini-tabs (left block) + Camera button (right).
- No extra selection indicators beyond existing plate; safe-area alignment consistent.

Files & Anchors
- `nail-app-mobile/components/ui/LiquidGlassTabBar.tsx:1`

Props and behavior (documented for implementers)
- `activeTab: 'Design' | 'Feed' | ''` — which mini tab is highlighted
- `onTabPress(route)` — invoked with `'Design' | 'Feed'`
- `onCameraPress()` — optional; if provided, fires when circular camera is tapped
- `collapsed?: boolean` — optional visual shrink/hide; pass `false` for sticky behavior per Figma on Design/Feed
- Do not fork this component for Feed. Use the same instance and props as the Design screen.

—

Figma → React Native Mapping (Do Not Create New Files)

Feed export (`Feed-redesign.md`)
- `TabBar` → `components/ui/LiquidGlassTabBar`
- `LiquidGlassRegular`/`blur.svg` → handled by `NativeLiquidGlass` + existing glass styles (no imported svg)
- `Maximize` icon → `Ionicons` equivalent (e.g., `expand`)
- `Heart` icon → `Ionicons` `heart`

Camera export (`Camera-resdesign.md`)
- `1x` chip → small round glass button (`View` + text) above shutter; toggles zoom presets
- Bottom-right round control → flip camera button (`Ionicons` `camera-reverse-outline`) inside glass
- `CAMERA-OVERLAY.svg` → not imported; use RN Views with opacity to approximate guides if needed

Saved Image exports (`saved-image.md`, `saved-image-share.md`)
- `SharePopUp` → React Native `Share` API (OS sheet), implemented inline in `ResultsScreen.tsx`
- `ColourBrandAnd` → existing style info stack in `ResultsScreen.tsx` (color chip + brand/line)
- `TabBar` in export → do not add to Results; keep current flow without tab bar unless explicitly requested

—

Non‑Hallucination Guardrails (Hard Rules)
- Do not add/rename/delete files beyond “Allowed Touch Points”.
- Do not change route names, params, or navigation flow.
- Do not import optional native modules unless behind an env gate (Hermes safety).
- Do not introduce new primitives for glass; use `NativeLiquidGlass` / `GlassmorphicView` only.
- Do not remove or reduce the 50 ms post‑capture navigation delay on Camera.
- Every export element must map to an RN/Expo construct (`Text`, `View`, `Ionicons`, `LinearGradient`, our glass primitives). If a mapping isn’t obvious, pause and ask before merge.

Onboarding Screen 1 — Implementation Steps (Using Onboarding export)

Source of truth
- Exports:
  - `nail-app-mobile/docs/Redesign/onboarding-redesign/Onboarding-screen-1.md`
  - `nail-app-mobile/docs/Redesign/onboarding-redesign/Onboarding-screen-2.md`
  - `nail-app-mobile/docs/Redesign/onboarding-redesign/Create-account-login-screen.md`
  - `nail-app-mobile/docs/Redesign/onboarding-redesign/Login-screen.md`
  - `nail-app-mobile/docs/Redesign/onboarding-redesign/Create-account.md`
  - `nail-app-mobile/docs/Redesign/onboarding-redesign/Privacy-policy.md`
- Screen: `nail-app-mobile/screens/OnboardingScreen.tsx`

Steps
1) Background visuals
   - Use `LinearGradient` with `tokens.gradients.onboarding` for the screen background.
2) Title/subtitle/copy
   - Apply sizes/weights per export using `tokens.typography` where possible; keep horizontal padding ≈ 24.
3) CTA button
   - Solid pink (v1) from `tokens.palette.primary`/`accent`; preserve existing onPress navigation (AuthLanding/Login).
4) Page indicators (if used)
   - Match indicator sizes/opacity to export; keep pagination logic unchanged.

Files & Anchors
- `nail-app-mobile/screens/OnboardingScreen.tsx`
- `nail-app-mobile/src/theme/tokens.ts` (onboarding gradients already defined)

Acceptance
- Onboarding matches export at 390/428; navigation unchanged.

—

Gradients Pass (Later)
- Add masked gradient title, pill fills, and CTA gradient after approval to add `@react-native-masked-view/masked-view`.
- Minimal token additions in `src/theme/tokens.ts` for gradient stops.

—

QA Checklist
- Design: 4-col grid; chip/cat sizing; sheet above tab bar; no search.
- Camera: full‑bleed preview, bottom-right flip, pinch zoom, 1x toggle, no crashes; delay before navigation preserved.
- Feed: header “Feed”; grid stable; tab bar routes correctly.
- Results: Save works; Share opens OS sheet; success toast then navigates to Feed.
 - Onboarding: background/copy/CTA reflect export; navigation unchanged.
- Lint + type-check pass; simulators at 390/428; device smoke test iOS and Android.

Design-Screen Specific QA
- Launch Design: verify only swatches are visible; no labels.
- Tap a swatch: label block slides out from under the swatch (not from bottom of cell).
- Tap another swatch: previous label fades up, new label fades down; grid reflows smoothly without jumps.
- Rotate device and test on 390 px and 428 px: 4 columns maintained; gaps consistent.
- Toggle filters/categories: labels hide again until next tap; selection outline updates.

Feed-Screen Specific QA
- Ensure the bottom nav looks and behaves exactly like the Design screen.
- Active mini tab is `Feed`; pressing `Design` switches screens; Camera opens the camera.
- Safe-area insets respected; component sits above glass sheet levels when present.

Open Questions
- Camera: hide “1x” chip on front camera?
- Results: share entry location (top bar vs bottom actions)?
- Any desire to tweak tab bar visibility on Camera (collapse vs hide) consistently?

Rollout
- Phase A: Design (complete) + Feed header label (done).
- Phase B: Camera refinements (full‑bleed + control moves + zoom chip).
- Phase C: Results share addition.
- Phase D: Gradient pass.

Appendix — Why we don’t copy Figma HTML/Tailwind directly
- The Figma export uses web/Tailwind classes (e.g., `w-[94px]`, `flex`, `before:... conic-gradient`). React Native does not support these directly.
- Conic gradients and CSS pseudo-elements are not available in RN; we approximate the selected ring with a 2 px border + soft glow. If a gradient ring is mandated later, we can overlay a thin `LinearGradient` ring view or custom SVG stroke, but that is out-of-scope for v1.

—

Implementation Changelog — 2025‑11‑14 (exact changes applied)

Files edited
- `nail-app-mobile/screens/DesignScreen.tsx`
- `nail-app-mobile/screens/CameraScreen.tsx`
- `nail-app-mobile/screens/ResultsScreen.tsx`
- `nail-app-mobile/docs/Redesign/mobile-redesign-implementation-plan-2025-11-14.md` (this document)

DesignScreen.tsx — changes
- Imports
  - Added `AccessibilityInfo` from `react-native`.
  - Added Reanimated helpers: `AnimatedRN, { Layout, FadeInDown, FadeOutUp }` from `react-native-reanimated`.
- State and effects
  - Added `hasTappedColor` gating flag; reset to `false` whenever `filters` change so labels remain hidden until the next user tap.
- Selection handler
  - In `handleColorSelect`: set `hasTappedColor(true)`, update selection, and announce `"<shade> selected"` via `AccessibilityInfo.announceForAccessibility`.
- Animated wrapper and layout
  - Replaced grid item wrapper with `AnimatedTouchable = AnimatedRN.createAnimatedComponent(TouchableOpacity)`.
  - Added `layout={Layout.springify().damping(18).stiffness(160)}` to animate size changes and push rows below down smoothly.
- Label reveal
  - Removed always-rendered text under every tile.
  - Added a conditional block rendered only when `isSelected && hasTappedColor`:
    - Wrapper: `<AnimatedRN.View entering={FadeInDown.duration(180)} exiting={FadeOutUp.duration(120)}>`.
    - Contents: Shade Name (line 1) and Brand (line 2); no product line or shade code in v1.
- Styles
  - Added `styles.colorTileSelected` (2 px pink border + light glow) and `styles.labelBlock` (slight negative top margin to make the text emerge from under the tile).
- 4‑column grid
  - Kept `numColumns={4}` and existing column math; no spacing or count changes elsewhere.

Representative diff
```tsx
// imports
import { AccessibilityInfo } from 'react-native'
import AnimatedRN, { Layout, FadeInDown, FadeOutUp } from 'react-native-reanimated'

// state
const [hasTappedColor, setHasTappedColor] = useState(false)
useEffect(() => { setHasTappedColor(false) }, [filters])

// handler
const handleColorSelect = (entry: ColorCatalogEntry) => {
  setHasTappedColor(true)
  updateSelectedColor(buildSelectedColor(entry))
  AccessibilityInfo.announceForAccessibility?.(`${entry.shadeName || 'Color'} selected`)
}

// wrapper
const AnimatedTouchable = AnimatedRN.createAnimatedComponent(TouchableOpacity)

// renderItem
<AnimatedTouchable layout={Layout.springify().damping(18).stiffness(160)} ...>
  <View style={[styles.colorTile, isSelected && styles.colorTileSelected]} />
  {isSelected && hasTappedColor && (
    <AnimatedRN.View entering={FadeInDown.duration(180)} exiting={FadeOutUp.duration(120)} style={styles.labelBlock}>
      <Text style={[styles.shadeName, styles.shadeNameSelected]} numberOfLines={1}>{item.shadeName}</Text>
      <Text style={styles.brandLine} numberOfLines={1}>{item.brand}</Text>
    </AnimatedRN.View>
  )}
</AnimatedTouchable>
```
Exact line anchors (current tree)
- `nail-app-mobile/screens/DesignScreen.tsx:16` — added `AccessibilityInfo` to the RN import list.
- `nail-app-mobile/screens/DesignScreen.tsx:46` — added `import AnimatedRN, { Layout, FadeInDown, FadeOutUp } from 'react-native-reanimated'`.
- `nail-app-mobile/screens/DesignScreen.tsx:111` — created `AnimatedTouchable` via `createAnimatedComponent`.
- `nail-app-mobile/screens/DesignScreen.tsx:192` — new state `hasTappedColor`.
- `nail-app-mobile/screens/DesignScreen.tsx:279` — effect resetting `hasTappedColor(false)` on `filters` change.
- `nail-app-mobile/screens/DesignScreen.tsx:414` — `handleColorSelect` now calls `setHasTappedColor(true)` and announces via `AccessibilityInfo`.
- `nail-app-mobile/screens/DesignScreen.tsx:700` — `renderColorItem` function start for the grid cell.
- `nail-app-mobile/screens/DesignScreen.tsx:706` — wrapper changed to `AnimatedTouchable`.
- `nail-app-mobile/screens/DesignScreen.tsx:713` — added `layout={Layout.springify().damping(18).stiffness(160)}`.
- `nail-app-mobile/screens/DesignScreen.tsx:726` — conditional label block used only when `isSelected && hasTappedColor`.
- `nail-app-mobile/screens/DesignScreen.tsx:729` — `entering={FadeInDown.duration(180)}`.
- `nail-app-mobile/screens/DesignScreen.tsx:730` — `exiting={FadeOutUp.duration(120)}`.
- `nail-app-mobile/screens/DesignScreen.tsx:789` — grid `numColumns={4}` retained.
- `nail-app-mobile/screens/DesignScreen.tsx:1309` — new `styles.colorTileSelected` (2 px ring + glow) start.
- `nail-app-mobile/screens/DesignScreen.tsx:1318` — new `styles.labelBlock` start (negative top margin for “under” reveal).

CameraScreen.tsx — changes
- Zoom chip
  - Added `zoom` state, passed `zoom={zoom}` to `CameraView`, and a small `1x/2x` chip above the shutter for back camera.
- Flip control relocation
  - Added a bottom‑right round glass flip button; removed reliance on a top‑right flip control.

Representative diff
```tsx
const [zoom, setZoom] = useState(0)
const toggleZoom = () => { if (facing === 'back') setZoom(z => (z < 0.25 ? 0.5 : 0)) }
<CameraView zoom={zoom} ... />
{facing === 'back' && (
  <TouchableOpacity style={styles.zoomChip} onPress={toggleZoom}>
    <Text style={styles.zoomChipText}>{zoom < 0.25 ? '1x' : '2x'}</Text>
  </TouchableOpacity>
)}
<View style={styles.bottomRightControls}>
  <TouchableOpacity style={styles.flipControl} onPress={toggleCameraFacing}>
    <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
  </TouchableOpacity>
</View>
```
Exact line anchors (current tree)
- `nail-app-mobile/screens/CameraScreen.tsx:47` — added `const [zoom, setZoom] = useState(0)`.
- `nail-app-mobile/screens/CameraScreen.tsx:295` — added `toggleZoom()` implementation.
- `nail-app-mobile/screens/CameraScreen.tsx:331` — passed `zoom={zoom}` to `CameraView`.
- `nail-app-mobile/screens/CameraScreen.tsx:421` — zoom chip container start; chip label at `:424`.
- `nail-app-mobile/screens/CameraScreen.tsx:466` — bottom‑right flip control container start; button at `:468`.
- `nail-app-mobile/screens/CameraScreen.tsx:623` — styles.bottomRightControls.
- `nail-app-mobile/screens/CameraScreen.tsx:634` — styles.zoomChip.
- `nail-app-mobile/screens/CameraScreen.tsx:645` — styles.zoomChipText.
- Note: top‑row flip button is no longer rendered (no call to `renderGlassButton('camera-reverse-outline', ...)`).

ResultsScreen.tsx — changes
- Share button appended to the bottom row; opens the system share sheet.

Representative diff
```tsx
import { ..., Share } from 'react-native'

const handleShare = async () => {
  await Share.share({ url: imageUri, message: 'Check out my nail look!' })
}

<TouchableOpacity style={styles.shareButton} onPress={handleShare}>
  <Ionicons name="share-outline" size={20} color="#fff" />
</TouchableOpacity>
```
Exact line anchors (current tree)
- `nail-app-mobile/screens/ResultsScreen.tsx:12` — added `Share` to RN import list.
- `nail-app-mobile/screens/ResultsScreen.tsx:93` — `handleShare()` implementation start.
- `nail-app-mobile/screens/ResultsScreen.tsx:407` — share button added to bottom buttons row.
- `nail-app-mobile/screens/ResultsScreen.tsx:545` — styles.shareButton start.

Verification (device)
- Design: at rest, tiles show only swatches; tap → Shade Name + Brand slide out from under the swatch; selected tile shows subtle ring/glow; rows shift down smoothly.
- Camera: bottom‑right flip button and 1x/2x chip visible; toggling works on back camera.
- Results: share button opens OS share sheet.
