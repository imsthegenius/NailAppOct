# Onboarding — Create Account (Signup) — Implementation Guide

Target file to edit: `nail-app-mobile/screens/SignupScreen.tsx`

Follow the master rules: `/Users/imraan/Downloads/NailAppNewRepo/docs/Master-rules/IMPLEMENTING FIGMA DESIGNS ANIMA.md`.
Use the layout in: `/Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Onboarding Create Account/_LAYOUT_GUIDE.md`.

## Objectives
- Implement the three-field signup form with glass card and a single primary CTA.
- Preserve all existing async logic and routing.

## Step-by-step
1. Gradient & structure
   - Keep `screenGradients.auth` absolute fill, `KeyboardAvoidingView`, and ScrollView content container with padding.

2. Back row & headings
   - Chevron back with fallback to `AuthLanding` if cannot go back.
   - Title: `Create your account`; supporting subtitle per design.

3. Form card
   - Name → `autoCapitalize="words"`.
   - Email → `autoCapitalize="none"`, `keyboardType="email-address"`.
   - Password → `secureTextEntry={!showPassword}`; eye toggle on the right.

4. Primary action
   - Button label: `Create Account`; show `ActivityIndicator` when `loading`.
   - Keep proxy → XHR → direct with 5s timeout ordering in `handleSignup`.
   - On success: if no session, store pending full name and route to `EmailVerification`; else mark onboarding complete and route per `resolvePostAuthDestination()`.

5. A11y
   - Ensure buttons have role, labels, and hints as coded.

## Visual tokens
- Reuse Login screen input and card styles for consistency.
- Maintain placeholder tint `rgba(255,255,255,0.4)` and borders `rgba(255,255,255,0.25..0.28)`.

## Testing checklist
- 390/428 widths: inputs visible above keyboard; eye toggle usable.
- Error states for missing/invalid inputs show alerts.
- Successful signup routes to Email Verification (no session) or Main/Legal as applicable.
- Type-check, lint, and iOS build pass.

## Commit examples
- `feat(mobile): signup screen glass card per _LAYOUT_GUIDE`
- `chore(mobile): a11y labels on signup actions`
