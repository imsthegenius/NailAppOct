# Onboarding — Screen 1 ("Try on nail colours…") — Implementation Guide

Target file to edit: `nail-app-mobile/screens/OnboardingScreen.tsx`
Slide key: `tryon` (first entry in `SLIDES`)

Follow the master rules: `/Users/imraan/Downloads/NailAppNewRepo/docs/Master-rules/IMPLEMENTING FIGMA DESIGNS ANIMA.md`.
Use the layout in: `/Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/onboarding screen 1/_LAYOUT_GUIDE.md`.

## Objectives
- Match the visual of Onboarding Screen 1 (large headline, supporting subtitle, gradient background, Skip + dots footer).
- Keep the simplified flow: horizontal paging, no primary CTA, working Skip.
- Maintain existing lifecycle, navigation, and persistence (do not change the onboarding completion logic).

## Step-by-step

1. Gradient & background
   - Ensure the slide with id `tryon` uses `onboardingGradients.preview` with vertical start/end as in file (centered on x).
   - The gradient is already applied globally based on the active slide; no per-slide absolute backgrounds needed.

2. Slide copy
   - In `SLIDES`, confirm the first slide content:
     - `title: 'Try on nail colours before the salon'`
     - `description: "No more wondering if it'll look good."`
     - `showLogo: true` (logo row visible at top)

3. Typography & spacing
   - The `title` style scales with width (already implemented); keep color light (`#fff`).
   - Subtitle style `bottomSubtitle` should use the brand pink (`#FF86A8`) with a soft shadow as implemented.
   - Keep proportional paddings via constants: `TOP_PADDING`, `BOTTOM_PADDING`, `TEXT_MARGIN_TOP`.

4. Footer (pagination + Skip)
   - Dots: ensure active/inactive styles are visually distinct (`opacity:1` vs `opacity:0.24`).
   - Skip: keep right-aligned; `onPress` → `handleSkip` → `completeOnboarding()`.
   - A11y: ensure `accessibilityRole="button"` on Skip (already present) and add `accessibilityLabel="Skip onboarding"` if missing.

5. Interactions & persistence
   - Swipe left/right between slides; no CTA button in this slide.
   - On Skip, persist `hasLaunched='true'` to AsyncStorage and `navigation.replace('AuthLanding')` (as currently coded). Do not change destinations.

6. Assets
   - Logo is loaded from `../assets/images/NailGlowLogo.png`. Ensure dimensions in `styles.logo` look correct on 390/428.

## RN structure (reference)
- Keep: `<LinearGradient/>` as full-bleed background, `<SafeAreaView/>`, `<FlatList pagingEnabled horizontal/>` for slides.
- Slide composition: Logo row → Title → Bottom subtitle.
- Footer: Pagination dots (left) + Skip button (right).

## Visual tokens
- Title: light text `#fff` (or `#f6f4f0` acceptable); big sizes per current responsive style.
- Subtitle: brand pink `#FF86A8` (design allows range close to `#ffa1ba`).
- Dots: white filled circles, DOT_SIZE=10, spacing 12.

## Edge cases
- Large devices (`height >= 780`) use larger paddings via constants; keep this behavior.
- RTL is not targeted; assume LTR for this pass.

## Testing checklist
- iOS simulator at 390 and 428 widths: title wraps as expected and is left-aligned; subtitle visible.
- Dots reflect the current slide while swiping.
- Skip persists onboarding state and routes correctly; returning to app should skip onboarding next launch.
- TypeScript, lint, and iOS build pass: `npm run type-check && npm run lint && npm run ios` (run from `nail-app-mobile/`).

## Commit examples
- `feat(mobile): onboarding screen 1 layout per _LAYOUT_GUIDE`
- `style(mobile): tune onboarding title/subtitle spacing for 390/428`

## Do not
- Add new files/components to the mobile app for onboarding.
- Introduce new navigation flows or CTAs.
- Replace gradient logic with image backgrounds; keep token-based gradients.
