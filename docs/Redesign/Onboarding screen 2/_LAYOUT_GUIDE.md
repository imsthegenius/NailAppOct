# Onboarding — Screen 2 ("Choose from 300+ colours") — Layout Guide

Implement this slide inside `nail-app-mobile/screens/OnboardingScreen.tsx`.
This guide defines the hierarchy, stacking order, and constraints for the SECOND onboarding slide.

## Screen mapping
- React Native file: `nail-app-mobile/screens/OnboardingScreen.tsx`
- Slide id: `choose` (in the `SLIDES` array)
- Visual exports (reference only):
  - `docs/Redesign/Onboarding screen 2/text.md`
  - `docs/Redesign/Onboarding screen 2/bottom-nav.md`
  - `docs/Redesign/Onboarding screen 2/full-figma-export.md`

## Hierarchy (bottom → top)
```
SafeAreaView (root)
└─ LinearGradient background (full-bleed)  // use onboardingGradients.customise
   ├─ FlatList (horizontal paging)
   │   └─ Slide (id: "choose")
   │       ├─ (No logo on this slide)
   │       ├─ Title (large display text)
   │       └─ Bottom description (multi-line paragraph)
   └─ Footer (fixed within screen safe area)
       ├─ Pagination dots (left)
       └─ Skip button (right)
```

## Stacking & Positioning
- LinearGradient fills the entire screen (`StyleSheet.absoluteFill`).
- Slide content uses vertical stack with proportional paddings (top/middle/bottom) driven by constants in file:
  - `TOP_PADDING`, `BOTTOM_PADDING`, `TEXT_MARGIN_TOP`, `FOOTER_BOTTOM_OFFSET`.
- Title appears in the middle block and should wrap to two lines on 390/428 widths.
- Description sits in the bottom block and may span multiple lines.

## Containers & Constraints
- Target widths: 390 and 428; rely on existing proportional paddings and dynamic type sizing in the file.
- Title uses the existing responsive `styles.title` scale.
- Description should use standard readable copy color (off-white) to match the export.

## Components mapping (from exports → RN)
- Background gradient → `LinearGradient` with `onboardingGradients.customise`.
- Title → `<Text style={styles.title}>`.
- Description → `<Text style={styles.description}>` (use off‑white body style here to match export; do not use the pink subtitle style on this slide).
- Bottom nav/skip → Footer row with pagination dots + Skip control (already scaffolded).

## React Native reference structure (do not copy verbatim)
```tsx
return (
  <View style={styles.fullscreen}>
    <LinearGradient colors={active.gradient} start={...} end={...} style={StyleSheet.absoluteFill} />
    <SafeAreaView style={styles.container}>
      <View style={styles.carouselContainer}>
        <FlatList ... renderItem={renderSlide} pagingEnabled horizontal />
      </View>

      <View style={styles.footer}>
        <View style={styles.paginationRow}>
          <View style={styles.dots}>{/* DOTS */}</View>
          <TouchableOpacity style={styles.skipButton}><Text style={styles.skipText}>Skip</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </View>
)
```

## Theming & tokens
- Gradient: `onboardingGradients.customise`.
- Title color: light (`#fff`).
- Description color: off‑white (`styles.description`) to match export text (`#f6f4f0`).
- Reuse `spacing`, `radii`, `typography` tokens already imported.

## Behavior & guardrails
- Keep swipe-based navigation; no primary CTA on this slide.
- `Skip` triggers `completeOnboarding()` via `handleSkip`.
- Do not change onboarding persistence (`AsyncStorage.setItem('hasLaunched','true')`).
- Do not modify navigation destinations.

## Definition of Done
- Visual parity at 390/428: large headline + multi-line description, with customise gradient.
- Footer shows pagination dots and Skip aligned right.
- Description uses off‑white readable style, not pink subtitle.
- `npm run type-check`, `npm run lint`, and `npm run ios` pass.
