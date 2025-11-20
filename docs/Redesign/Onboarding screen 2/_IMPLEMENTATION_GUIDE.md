# Onboarding — Screen 2 ("Choose from 300+ colours") — Implementation Guide

Target file to edit: `nail-app-mobile/screens/OnboardingScreen.tsx`
Slide key: `choose` (second entry in `SLIDES`)

Follow the master rules: `/Users/imraan/Downloads/NailAppNewRepo/docs/Master-rules/IMPLEMENTING FIGMA DESIGNS ANIMA.md`.
Use the layout in: `/Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Onboarding screen 2/_LAYOUT_GUIDE.md`.

## Objectives
- Match the visual: large headline and multi-line body copy on a customise gradient.
- Keep horizontal paging, working Skip, and existing persistence/navigation.

## Step-by-step
1. Gradient
   - Ensure slide `choose` uses `onboardingGradients.customise` via the existing `SLIDES` entry (already present).

2. Copy content
   - Confirm `SLIDES[1]` values:
     - `title: 'Choose from 300+ colours'`
     - `description: 'Pick a colour, pick a shape, upload a photo and watch colours come to life on your nails.'`
     - No `showLogo` needed on this slide.

3. Typography & spacing
   - Title uses `styles.title` (already responsive).
   - For the description on this slide, use `styles.description` (off‑white readable copy) rather than the pink `styles.bottomSubtitle`.
     - Implementation approach: in `renderDefaultSlide`, apply `styles.description` when `item.id === 'choose'` and keep `styles.bottomSubtitle` for other slides.

4. Footer (pagination + Skip)
   - Dots active/inactive visuals should remain as implemented.
   - Skip stays right-aligned; keep `accessibilityRole="button"` and label as appropriate.

5. Interactions & persistence
   - Swipe between slides; no CTA button here.
   - Skip persists onboarding and routes to `AuthLanding` as currently coded.

## RN structure (reference)
- Keep `<LinearGradient/>`, `<SafeAreaView/>`, `<FlatList pagingEnabled horizontal/>`.
- Slide composition: Title → Body copy (use description styling) → Footer with dots + Skip.

## Visual tokens
- Title: `#fff` large display.
- Body: `styles.description` (off‑white) matching Anima export (`#f6f4f0`).
- Gradient: customise.

## Testing checklist
- 390/428 widths: headline wraps to 1–2 lines; body wraps below with comfortable leading.
- Dots reflect swipes; Skip routes correctly and persists `hasLaunched`.
- TypeScript, lint, and iOS build pass: `npm run type-check && npm run lint && npm run ios`.

## Commit examples
- `feat(mobile): onboarding screen 2 layout per _LAYOUT_GUIDE`
- `style(mobile): use description style for onboarding slide 2 body`

## Do not
- Add new navigation or CTAs.
- Replace gradient logic with image backgrounds.
