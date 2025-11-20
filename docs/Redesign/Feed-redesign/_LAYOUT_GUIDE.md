# Feed Screen — Layout Guide

This document defines the canonical hierarchy, stacking order, and layout constraints for the Feed screen. Implement in `nail-app-mobile/screens/FeedScreen.tsx` using the existing primitives.

## Hierarchy (bottom → top)

```
SafeAreaView (root)
└─ View: Screen Background (z:0)
   ├─ ScrollView (content, z:1)
   │  ├─ Header: Title + Profile Icon
   │  ├─ Filter Bar: Category pills (horizontal)
   │  └─ Grid: 2‑column image cards (FlatList)
   │       └─ Card Overlay: brand chips / shade label (bottom of image)
   └─ LiquidGlassTabBar (absolute, fixed to bottom, z:10)
```

## Stacking & Positioning
- `LiquidGlassTabBar` is absolutely positioned at the bottom and should always float above scroll content (`zIndex: 10`).
- Provide bottom padding on the scroll content (`contentContainerStyle.paddingBottom`) to avoid being obscured by the tab bar.
- Choice/selection overlays (if any) appear above everything (`zIndex: 20`).

## Containers & Constraints
- Root: `SafeAreaView` with light background from theme.
- Main content: `ScrollView` (or `FlatList` with `ListHeaderComponent`) to enable sticky header if desired.
- Use 390 px and 428 px widths as reference; layout must be responsive across both.

## Components (map to docs)
- Header — docs/Redesign/Feed-redesign/Title-and-profile.md
- Filter Bar — docs/Redesign/Feed-redesign/user-filter-categories.md
- Grid — docs/Redesign/Feed-redesign/grid-view.md
- Bottom Nav — docs/Redesign/Feed-redesign/bottom-nav.md

## React Native Structure (reference only)

```tsx
// Pseudocode — do not copy verbatim
return (
  <SafeAreaView style={s.root}>
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Header />
        <FilterBar />
        <FeedGrid />
      </ScrollView>

      <LiquidGlassTabBar onCameraPress={() => nav.navigate('Camera')} />
    </View>
  </SafeAreaView>
)
```

## Implementation Notes
- Header
  - Title uses brand gradient or brand pink. Keep typography consistent with Design screen.
  - Profile icon aligns to the right of the title row.
- Filter Bar
  - Horizontal `FlatList` of category pills. First pill can be selected by default.
  - Persist selection in store; apply filter client-side initially.
- Grid
  - Use `FlatList` with `numColumns={2}`.
  - `columnWrapperStyle` for spacing; consistent gutters (e.g., 12–16).
  - Each tile: image with a bottom glass label strip showing brand chips (TGB/BIAB/etc.)
- Performance
  - Use `getItemLayout` and `removeClippedSubviews` where helpful.
  - Add bottom padding equal to tab bar height + 16.

## Theming & Primitives
- Use existing primitives:
  - `components/ui/LiquidGlassTabBar`
  - `components/ui/GlassmorphicView`
  - `components/ui/NativeLiquidGlass`
- Colors: import from `src/theme/colors` (e.g., `BRAND_COLORS`).

## Definition of Done (Feed)
- Visual parity with Figma at 390/428 widths.
- Tab bar remains fixed while content scrolls.
- Filters change which tiles render (basic client-side slice is fine for v1).
- `npm run type-check`, `npm run lint`, and `npm run ios` pass.
