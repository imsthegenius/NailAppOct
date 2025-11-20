# Onboarding — Login Choice (Auth Landing) — Implementation Guide

Target file to edit: `nail-app-mobile/screens/AuthLandingScreen.tsx`

Follow the master rules: `/Users/imraan/Downloads/NailAppNewRepo/docs/Master-rules/IMPLEMENTING FIGMA DESIGNS ANIMA.md`.
Use the layout in: `/Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Onboarding login - choice/_LAYOUT_GUIDE.md`.

## Objectives
- Provide clear choices post-onboarding: Create Account, Apple (if available), or Log In.
- Maintain the existing Apple availability check and loading state handling.

## Step-by-step
1. Gradient & background
   - Use `screenGradients.auth` with full-bleed absolute fill (already in file).

2. Headline
   - Keep `"Let's get started"` left-aligned headline higher on the screen.

3. Buttons
   - Primary (Create Account): filled white, pill radius, `navigation.replace('Signup')`.
   - Apple: show only if `appleAvailable`; keep 48px height and `cornerRadius={24}`; overlay spinner while `appleLoading`.
   - Secondary (Log In): translucent surface + 1px white border; `navigation.replace('Login')`.

4. A11y
   - Ensure all touchables have `accessibilityRole="button"` and clear labels.

5. Behavior
   - Do not alter Apple sign-in logic: use `signInWithApple()` and on success route to `Main`.
   - Keep replace semantics to avoid stacking multiple auth screens.

## Visual tokens
- Primary: dark text on white surface.
- Secondary: white bold text on translucent glass surface with white border.

## Testing checklist
- iOS at 390/428: spacing matches, Apple renders only on supported devices/simulators.
- Apple loading overlay appears above the Apple button only.
- Buttons navigate correctly.
- `npm run type-check && npm run lint && npm run ios` pass.

## Commit examples
- `feat(mobile): auth landing per _LAYOUT_GUIDE`
- `style(mobile): refine Apple button overlay alignment`
