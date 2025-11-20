# Onboarding — Screen 1 ("Try on nail colours…") — Layout Guide

Implement this slide inside `nail-app-mobile/screens/OnboardingScreen.tsx`.
This guide defines the hierarchy, stacking order, and constraints for the FIRST onboarding slide with the large headline and Skip + dots footer.

## Screen mapping
- React Native file: `nail-app-mobile/screens/OnboardingScreen.tsx`
- Slide id: `tryon` (in the `SLIDES` array)
- Visual exports (reference only):
  - `docs/Redesign/onboarding screen 1/background.md`
  - `docs/Redesign/onboarding screen 1/text.md`
  - `docs/Redesign/onboarding screen 1/Bottom-nav-skip.md`

## Hierarchy (bottom → top)
```
SafeAreaView (root)
└─ LinearGradient background (full-bleed)  // use onboardingGradients.preview
   ├─ FlatList (horizontal paging)
   │   └─ Slide (id: "tryon")
   │       ├─ Logo row (optional)
   │       ├─ Title (large display text)
   │       └─ Bottom subtitle (supporting line)
   └─ Footer (fixed within screen safe area)
       ├─ Pagination dots (left)
       └─ Skip button (right)
```

## Stacking & Positioning
- **LinearGradient** fills the screen (`StyleSheet.absoluteFill`).
- **Slide** uses vertical stack with generous top/bottom padding:
  - Top: optional logo
  - Middle: title copy block
  - Bottom: supporting line (subtitle)
- **Footer** (inside safe area) contains pagination dots (left) and Skip (right).

## Containers & Constraints
- Target widths: 390 and 428; keep layout responsive using the existing proportional paddings:
  - `TOP_PADDING`, `BOTTOM_PADDING`, `TEXT_MARGIN_TOP` and `FOOTER_BOTTOM_OFFSET` constants already defined in file.
- Title uses dynamic font sizing based on width (keep the current responsive logic).
- Ensure adequate contrast on gradient; title is light on dark gradient.

## Components mapping (from exports → RN)
- Background gradient → `LinearGradient` with `onboardingGradients.preview`.
- Title and subtitle → `<Text>` nodes using RN styles (no web classes).
- Bottom nav/skip → Footer row with pagination dots and Skip button (already scaffolded).

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
- Gradient: `onboardingGradients.preview`.
- Title color: light (`#f6f4f0` / `#fff`) per visual; subtitle brand pink (`#ffa1ba`/`#FF86A8`).
- Use existing `spacing`, `radii`, and `typography` tokens already imported in the screen.

## Behavior & guardrails
- Keep swipe-based navigation; no primary CTA on this slide.
- `Skip` runs `completeOnboarding()` (already wired via `handleSkip`).
- Do not modify onboarding persistence (`AsyncStorage.setItem('hasLaunched','true')`).
- Do not change navigation destinations.

## Definition of Done
- Visual parity at 390/428 for this first slide: large headline, supporting line, gradient background.
- Footer shows animated/active dot and a Skip control aligned right.
- No regressions to slides 2/3 behavior.
- `npm run type-check`, `npm run lint`, and `npm run ios` pass.
