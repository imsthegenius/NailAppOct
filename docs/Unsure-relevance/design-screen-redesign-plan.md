# Design Screen Redesign — Re‑Plan (Exact Figma Spec)

Owner: Mobile
Last updated: 2025-11-12

Status
- All prior code changes have been reverted. This is a plan only. Do not implement until approved.

Goal
- Implement the Design screen exactly as provided by the Figma export and screenshot (gradient “Design” title, 5 primary pills, 4‑column colour grid, categories row, glass “Select Shape” sheet with gradient Continue and a circular heart, and the bottom glass tab bar with Design/Camera only). No deviations.

Non‑negotiables from Figma export
- Title: gradient text “Design” (≈34pt) with the specified pink gradient.
- Primary chips: All (selected, pink gradient) • Trending • OPI • CND • TGB.
- Categories row: 43×43 swatches, 54×69 cards, label 13pt, radius 8, spacing per export.
- Colour grid: 4 columns. Tile size follows export (≈90×90 inside ~417px container); adapt responsively while preserving 4 columns and the gap.
- Shape sheet: “Select Shape” title; white pills (None selected), gradient “Continue” spanning remaining width, circular heart button on the right inside the sheet (navigates to Feed).
- Bottom glass tab bar: two tabs (Design, Camera). Feed is not a tab; it is opened via the heart.

Files to update (and only these)
- `nail-app-mobile/screens/DesignScreen.tsx` — Layout + styles only. Reuse existing fetching/state.
- `nail-app-mobile/components/ui/LiquidGlassTabBar.tsx` — Ensure exactly two tabs (Design/Camera). No other behaviour changes unless spacing requires.
- `nail-app-mobile/src/theme/tokens.ts` — Add minimal tokens (gradient stops, fixed spacings) strictly required by visuals.

Implementation steps
1) Title (gradient)
   - Add masked gradient title (MaskedView + LinearGradient). If dependency add is not approved, render solid accent temporarily; gradient will be enabled after install.
   - Typography: 34/41, weight 700, tracking ≈ -1.0.

2) Primary chips row (5 chips)
   - Exact order/labels: All (selected), Trending, OPI, CND, TGB.
   - Selected: pink gradient with white text. Unselected: white pill with subtle border; height 35px; gap 13px; pill radius full.
   - Wire to existing handlers only: `activePrimaryFilter`, `handlePrimaryFilterSelect`.

3) Categories section
   - Header “Categories” 15pt/600.
   - Horizontal list: 54×69 cards, swatch 43×43 (radius 8), 13pt label. Use current data and behaviour; match spacing.

4) Colour grid (4 columns)
   - Change constants to 4 columns and the Figma gap (≈19px). Set side inset so four 1:1 tiles fit edge‑to‑edge at 390/428 widths.
   - Compute `CARD_WIDTH` from `useWindowDimensions()` so rotation/tablets still produce 4 columns.
   - Keep current text stack (name, brand • line, #code). No API or pagination changes.

5) Shape selector sheet
   - Glass container using `NativeLiquidGlass` positioned above tab bar with safe‑area padding.
   - Title “Select Shape”.
   - Pills: white; ‘None’ selected; reuse paywall lock state; sizes match primary chips.
   - CTA row: gradient “Continue” button spanning remaining width + circular glass heart on the right (Feed navigation).

6) Bottom glass tab bar (global)
   - Two tabs: Design and Camera on all three screens (Design/Camera/Feed). No Feed tab.
   - Do not add selection indicators unless explicitly requested by design.

Accessibility and polish
- Chips have `accessibilityRole="button"` and `accessibilityState={{selected}}`.
- Heart has `accessibilityLabel="Open Feed"`.
- Avoid heavy shadows on every tile; match Figma’s subtle glass sheen.

Acceptance criteria
- Visuals at 390 and 428 widths match the screenshot: 5 chips, 4‑column grid, categories spacing, shape sheet CTA row with heart, two‑tab bottom bar.
- Interactions: chips change lists; Continue works; heart opens Feed.
- No changes to camera timing or catalogue fetching.

Out of scope
- Supabase changes, new routes, or paywall/business logic changes.

Rollout
- Single PR with the three files above only. Approve on simulators; then device smoke test.

## Lessons Learned & Guardrails (Do Not Deviate)

- No search bar: The current Figma/mechanism does not include a search field on the Design screen. Do not render search. If we later add it, it must be a separate, explicit task.
- Always 4 columns for the colour grid: Never ship 3 columns. Constants: `GRID_COLUMNS = 4`, `GRID_GAP ≈ 19`, side insets tuned for 390/428 widths. Use `useWindowDimensions()` so rotation/tablets remain 4‑col.
- Bottom nav composition is fixed: left mini‑tabs = Design + Feed; right standalone glass Camera button. Feed is not a tab inside the left block; no third “Camera” tab.
- Heart location: Feed is accessed from the bottom nav (left block), not inside the Select Shape sheet.
- Gradients are a second pass: Title/pills/CTA gradients come later. First pass uses solid colours only — do not introduce gradient dependencies until explicitly approved.
- No new primitives without approval: Keep changes inside the three files listed. If a helper component helps readability, propose it first in the PR description.
- Optional native modules must be gated: Do not `require()` optional modules (e.g., `expo-battery`) unless behind an explicit env flag to avoid Hermes “unknown module” crashes.
- Strict change control: Plan first, implement second. Any visual or structural variance from Figma requires written approval in this doc or the PR.

## “Pixel Locks” (non‑negotiable values)

- Pills: height 35 px; gap 13 px; selected = solid pink for v1; unselected = white + 1 px border rgba(60,60,67,0.10).
- Categories: card 54×69; swatch 43×43 (radius 8); label 13 pt; horizontal gap 16.
- Grid: 4×N; tile aspect 1:1 with 8 px radius; inter‑tile gap ≈ 19; side insets tuned so 4 tiles fit cleanly at 390 and 428 widths.
- Shape sheet: title 17 pt/Medium; pills white; Continue solid pink (v1) spanning as per Figma; sits above tab bar with safe‑area awareness.
- Bottom nav: two mini tabs (Design/Feed) inside the left glass block; circular Camera button on the right. Selected tab uses plate background; Feed label neutral.

## Follow‑ups

- Gradient pass: add masked gradient title, pill fills, and CTA gradient once approved to add `@react-native-masked-view/masked-view`.
- Minor spacing polish after device screenshots at 390/428 to match the export exactly.

## Outstanding Changes Required (Implementation TODOs)

These are the concrete code changes still required to finish the first, non‑gradient pass. Do not add features not listed here.

- Remove the search bar from Design
  - Delete the search container from `nail-app-mobile/screens/DesignScreen.tsx` (the `NativeLiquidGlass` + `TextInput` block under the title). Do not render or gate it; remove entirely.

- Lock the colour grid to 4 columns (everywhere)
  - In `nail-app-mobile/screens/DesignScreen.tsx`:
    - Ensure `GRID_COLUMNS = 4` and `GRID_GAP ≈ 19`.
    - Replace `Dimensions.get('window')` with `useWindowDimensions()` and recompute `CARD_WIDTH` reactively so we always render 4 columns on 390/428 widths and rotation. Avoid stale `width` captured at import time.
    - Keep square tiles with radius 8 and the Figma side insets so four tiles + three gaps fit cleanly.

- Primary pills (exact Figma spacing/visuals – solid for v1)
  - In `DesignScreen.tsx`, pills must be: height 35 px, gap 13 px, pill radius 999.
  - Selected: solid pink background + white label (gradients later).
  - Unselected: white background + 1 px border rgba(60,60,67,0.10), label rgba(31,31,31,0.65).
  - Order/labels fixed: All (selected), Trending, OPI, CND, TGB.

- Categories row pixel locks
  - `DesignScreen.tsx` categories FlatList: item 54×69, swatch 43×43 (radius 8), label 13 pt, horizontal gap 16. No additional chevrons/arrows unless design specifies.

- Shape sheet composition (no heart inside)
  - `DesignScreen.tsx`: keep “Select Shape” title, white shape pills (use the same pill dimensions as the primary row), and a solid pink Continue button. Do not render a heart inside the sheet.
  - Position above the bottom nav using safe‑area insets; avoid overlap on smaller screens.

- Bottom navigation (final structure for v1)
  - `components/ui/LiquidGlassTabBar.tsx` already exposes `activeTab`, `onTabPress`, `onCameraPress`.
  - Ensure the left glass block contains exactly two mini tabs: Design and Feed.
  - The right circular glass button opens Camera.
  - Do not render a third tab or the old floating search.
  - On Camera screen, the bar may be hidden or collapsed — confirm desired behavior and apply consistently.

- Optional native modules must be gated
  - `lib/savedLooksPrefetch.ts` is now gated by `EXPO_PUBLIC_ENABLE_BATTERY_DEFER`. Keep this pattern for any future optional native modules to avoid Hermes “unknown module” crashes.

## QA Checklist (Blocking)

- Design screen shows no search bar.
- Pill row: All (selected) + Trending + OPI + CND + TGB, with exact spacing and solid colors.
- Categories match sizes (54×69, 43×43 swatch) and spacing.
- Grid renders 4 columns on iPhone 15/16 Pro simulators (390/428 widths) and on rotation; no 3‑column fallback appears.
- Shape sheet floats above grid, pills white, Continue solid pink; no heart in this sheet.
- Bottom nav: left = Design/Feed mini tabs, right = Camera button; taps route correctly on Design, Feed, and Camera screens.
- No Metro/Hermes “unknown module” errors on a clean install after `npx expo start -c`.
