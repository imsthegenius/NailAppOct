# Design Screen Redesign — Implementation Plan

Owner: Mobile
Last updated: 2025-11-12

This plan brings the Design screen and its components in line with the provided Figma reference (gradient “Design” title, pill filters, categories row, 4‑column color grid, glass “Select Shape” dock, and liquid‑glass tab bar with a floating heart).

## Scope

- Update the existing Design screen layout and visuals without changing business logic, data fetching, or navigation types.
- Reuse the Liquid Glass primitives and theme tokens; add minimal new primitives for gradient text and reusable glass pills.
- Validate at 390 px and 428 px widths per “iOS26” vision.

## Milestones

1) Tokens & primitives
2) Header + primary filters
3) Categories row
4) 4‑column color grid
5) Shape selector glass dock
6) Tab bar selection indicator + floating heart
7) Polish, dark mode, QA

## Files To Add / Update

Add
- `nail-app-mobile/components/ui/GradientText.tsx` — gradient text wrapper for the screen title.
- `nail-app-mobile/components/ui/GlassPillChip.tsx` — reusable pill chip (filter + shape variants).
- `nail-app-mobile/components/ui/FloatingGlassButton.tsx` — circular liquid‑glass button for the heart.

Update
- `nail-app-mobile/src/theme/tokens.ts` — add pink gradient tokens and shared chip sizes/radii.
- `nail-app-mobile/components/ui/LiquidGlassTabBar.tsx` — selected tab background indicator to match mock.
- `nail-app-mobile/screens/DesignScreen.tsx` — header, filters, categories row sizing, 4‑col grid, shape chips, add floating heart.

No change (referenced/reused)
- `nail-app-mobile/components/ui/NativeLiquidGlass.tsx`
- `nail-app-mobile/components/ui/GlassmorphicView.tsx`

## Detailed Tasks

### 1) Tokens & primitives
- `src/theme/tokens.ts`
  - Add palette entries for pink gradient stops (e.g. `rose300`, `rose600`).
  - Add `gradients.pills.pink = ['#F9A8D4', '#E11D48']` (or brand‑approved hexes).
  - Add a small `chips` section to centralize pill paddings, height, corner radius.
- `components/ui/GradientText.tsx`
  - Implement using `LinearGradient` + `@react-native-masked-view/masked-view`.
  - Props: `children`, `colors`, `start`, `end`, `style`.
- `components/ui/GlassPillChip.tsx`
  - Props: `{ label, selected, onPress, locked?, variant: 'filter'|'shape' }`.
  - Selected: pink gradient background, white text; Unselected: subtle translucent surface; Optional lock icon.

### 2) Header + primary filters (All, Trending, OPI, CND, TGB)
- `screens/DesignScreen.tsx`
  - Replace header title `Text` with `<GradientText>`; keep size ~34, weight 700.
  - Replace the existing primary filter map with `<GlassPillChip>` items.
  - Keep existing state and handlers: `activePrimaryFilter`, `handlePrimaryFilterSelect`.
  - Optional: hide search for this pass (Figma doesn’t show it) via a local `SHOW_SEARCH = false` toggle.

### 3) Categories row
- `screens/DesignScreen.tsx`
  - Keep the current data; adjust visuals:
    - Card width ~56, swatch 44×44, radius 8, gap 16.
    - Label font 12–13, centered; active state bold and slightly raised.
  - Update styles around `categoryCard`, `categorySwatch`, `categoryCardLabel`.

### 4) 4‑column color grid
- `screens/DesignScreen.tsx`
  - Constants near top:
    - `GRID_COLUMNS = 4`
    - `GRID_GAP ≈ 12–14`
    - `GRID_SIDE_INSET ≈ 14`
  - `CARD_WIDTH` already derives from these; keep tiles square (`aspectRatio: 1`) with radius 8.
  - Placeholder/empty tiles use light pink fill to match mock.
  - Leave pagination, caching, and selection logic unchanged.

### 5) Shape selector glass dock
- `screens/DesignScreen.tsx`
  - Reuse existing `NativeLiquidGlass` container and spacing.
  - Replace in‑sheet shape chips with `<GlassPillChip variant='shape'>` for visual parity.
  - Selected = gradient pill with white text; locked shows small lock (reuse current entitlement check).
  - Keep “Continue” CTA and navigation behavior intact.

### 6) Tab bar selection indicator + floating heart
- `components/ui/LiquidGlassTabBar.tsx`
  - Add a rounded translucent selection background behind the active tab (absolute, animated).
  - Keep icons; ensure active label uses accent or white over the selection background.
- `components/ui/FloatingGlassButton.tsx`
  - Circular `NativeLiquidGlass`, subtle highlight overlay, centered `Ionicons` heart outline.
  - Add to `DesignScreen` positioned bottom‑right above the tab bar; onPress TBD (Favorites?).

## Acceptance Criteria

- Title “Design” renders as gradient text and matches the mock at 390 px and 428 px.
- Primary filter pills: “All” selected with gradient; others unselected; taps update results.
- Categories row: square swatches with labels as shown; active state emphasized.
- Color grid: 4 columns, uniform spacing, rounded tiles; loading/empty states match style.
- Shape dock: glass sheet with “Select Shape”; gradient chip for the selected shape (“None” maps to `keep`).
- Tab bar: active tab has rounded selection background; floating glass heart visible and tappable.
- Dark mode retains contrast/legibility (borders and intensities tuned via tokens).
- `npm run lint`, `npm run type-check`, and device smoke tests pass on iOS and Android.

## Non‑Goals

- No changes to Supabase schemas, catalog queries, or pagination semantics.
- No changes to navigation types (`navigation/types.ts`) or camera timing (keep the 50 ms init delay on Camera flow).

## Risks & Mitigations

- Gradient text dependency: if `@react-native-masked-view/masked-view` is missing, add via Expo (managed workflow) or fall back to solid accent text.
- Performance: 4‑col grid increases initial render; keep current FlatList virtualization (already tuned) and avoid heavy shadows on each tile.
- Dark mode contrast: verify chip text and borders; adjust token intensities if needed.

## QA Checklist

- iPhone 15/16 Pro simulators at 390 px and 428 px widths; one recent Android device.
- Verify: filter taps, category selection/clear, infinite scroll, shape selection (locked states), Continue flow.
- Verify: tab switches between Design/Camera/Feed; floating heart press routes to the chosen destination (once wired).
- Run: `npm run lint`, `npm run type-check`, `npm run web` for quick layout spot‑checks, then device smoke test.

## Estimated Sequence

1) Tokens + `GlassPillChip` + `GradientText` (low risk, unblock visuals)
2) Swap header + primary filters in `DesignScreen`
3) Categories sizing pass
4) Switch to 4‑column grid and spacing tune
5) Replace shape chips and finalize dock
6) Tab bar selection background + add floating heart
7) Polish, dark mode tune, QA

## Open Questions

- Exact brand pinks: proceed with `#F9A8D4 → #E11D48`, or provide brand hex values?
- Floating heart action: Favorites, Likes, or a quick shortlist? Which route/param shape?
- Keep search hidden for now, or reintroduce later under a compact affordance?

---

## Audit Addendum (No Duplication, Correct Files)

Source of truth for the Design screen used in navigation:

- `nail-app-mobile/navigation/MainNavigator.tsx` imports `../screens/DesignScreen` and sets `initialRouteName="Design"` with `<Stack.Screen name="Design" component={DesignScreen} />`.
- `nail-app-mobile/screens/DesignScreen.tsx` therefore is the only Design screen wired into the app. We will update this file in place.
- Other references (for navigation):
  - `nail-app-mobile/navigation/types.ts` includes `Design` in `MainStackParamList`.
  - Calls to navigate to `Design` originate from Camera/Results, confirming this is the live route.

Guarantees to avoid duplication:

- Do not create a new screen file. All layout/visual changes happen in `screens/DesignScreen.tsx`.
- Shared UI changes happen only in existing primitives under `components/ui/`:
  - Update `components/ui/LiquidGlassTabBar.tsx` in place (no new tab bar component).
  - Add new primitives (`GradientText`, `GlassPillChip`, `FloatingGlassButton`) under `components/ui/` and import them into `DesignScreen.tsx` only where used.
- No files will be added under the retired web prototype (`nail-app/`) per repo guidance.

Quick verification commands (optional):

- List all Design screen references: `rg -n "DesignScreen|name=\"Design\"|navigate\('Design'\)" nail-app-mobile`
- Confirm single screen export: `rg -n "export default .*Design" nail-app-mobile/screens/DesignScreen.tsx`

## Dependencies & Implementation Notes

- Gradient text: `@react-native-masked-view/masked-view` is not in `package.json`. If gradient title is required, add it via Expo: `npx expo install @react-native-masked-view/masked-view`. Provide a fallback to solid accent text if the lib isn’t installed.
- Blurs/Glass: we reuse `NativeLiquidGlass` and `expo-blur` already present. Keep intensity from tokens; avoid nested blurs in lists.
- Grid width on rotation: recompute `CARD_WIDTH` with `useWindowDimensions()` or on-layout to avoid mis-sizing on tablets/rotation. Avoid hard module‑level `Dimensions.get()` only.
- Tab bar selection indicator: measure each tab with `onLayout`, animate an absolute rounded highlight using `Animated` translateX + width to ensure correct alignment on all devices.
- Shape dock bottom spacing: position relative to safe area + measured tab bar height to prevent overlap on short screens.
- Accessibility: set `accessibilityRole="button"`, `accessibilityState={{ selected }}` on pills; give the heart a label (e.g., “Open Favorites”).
- Dark mode: confirm chip borders/labels pass contrast on both themes; adjust tokens as needed (e.g., increase border alpha on dark).

## Definition of Done (expanded)

- Only `screens/DesignScreen.tsx` is modified for the screen; no duplicate screens added.
- New UI primitives live in `components/ui/` and are imported where used; no alternative tab bar or duplicate glass views created.
- All acceptance criteria pass at 390 px and 428 px; rotation and Android layouts verified.
- Lint/type-check pass: `npm run lint`, `npm run type-check`.
- Camera flow delay untouched; navigating back to Camera still respects the 50 ms init requirement (no changes made here).

