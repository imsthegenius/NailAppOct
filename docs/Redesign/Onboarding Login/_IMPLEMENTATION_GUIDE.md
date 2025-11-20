# Onboarding — Login Screen — Implementation Guide

Target file to edit: `nail-app-mobile/screens/LoginScreen.tsx`

Follow the master rules: `/Users/imraan/Downloads/NailAppNewRepo/docs/Master-rules/IMPLEMENTING FIGMA DESIGNS ANIMA.md`.
Use the layout in: `/Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Onboarding Login/_LAYOUT_GUIDE.md`.

## Objectives
- Implement the glass card login with responsive spacing and optional Apple sign-in.
- Preserve all existing async and routing logic.

## Step-by-step
1. Gradient & containers
   - Keep `screenGradients.auth` absolute fill and `KeyboardAvoidingView` wrapping the `ScrollView`.

2. Back row & headings
   - Chevron back with text (as coded). Fallback to `navigation.replace('AuthLanding')` if `!canGoBack()`.
   - Title: `Welcome back`; subtitle as provided.

3. Form card
   - Card radius, border, shadow, and background match the `CARD_BACKGROUND` and existing styles.
   - Email: `keyboardType="email-address"`, `autoCapitalize="none"`.
   - Password: eye toggle; Forgot? link triggers `handleForgotPassword`.

4. Primary action
   - Log In button shows `ActivityIndicator` when `loading`.
   - `handleLogin` keeps proxy-first logic and direct fallback with a 5s timeout; do not change.

5. Apple sign-in (optional)
   - Show only when `appleAvailable` is true.
   - Use button-local spinner overlay while `appleLoading`.
   - On success, call `routeAfterLogin()`.

6. Footer link
   - "Need an account? Create Account" → `navigation.replace('Signup')`.

7. A11y
   - Ensure buttons have `accessibilityRole="button"`, labels, and hints as coded.

## Visual tokens
- Input placeholders `rgba(255,255,255,0.4)`; borders `rgba(255,255,255,0.28)`.
- Primary text dark on white; links underlined.

## Testing checklist
- 390/428 widths: inputs and button spacing feel consistent; keyboard avoids covering inputs.
- Forgot Password and Apple flows behave correctly; error dialogs appear for invalid input.
- Type-check, lint, and iOS build pass.

## Commit examples
- `feat(mobile): login screen glass card per _LAYOUT_GUIDE`
- `style(mobile): refine password eye toggle and touch targets`
