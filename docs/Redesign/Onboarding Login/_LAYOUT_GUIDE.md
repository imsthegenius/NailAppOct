# Onboarding — Login Screen — Layout Guide

Implement this screen inside `nail-app-mobile/screens/LoginScreen.tsx`.
This guide defines the hierarchy, stacking order, and constraints for the email+password login with optional Apple.

## Screen mapping
- React Native file: `nail-app-mobile/screens/LoginScreen.tsx`
- Visual exports (reference only):
  - `docs/Redesign/Onboarding Login/back-button.md`
  - `docs/Redesign/Onboarding Login/top-text-export.md`
  - `docs/Redesign/Onboarding Login/email-password-entry-card.md`
  - `docs/Redesign/Onboarding Login/login-divider copy.md`
  - `docs/Redesign/Onboarding Login/sign-up-apple copy.md`
  - `docs/Redesign/Onboarding Login/footer-text copy.md`
  - `docs/Redesign/Onboarding Login/full-figma-export.md`

## Hierarchy (bottom → top)
```
SafeAreaView (root)
└─ LinearGradient (auth; full-bleed)
   └─ KeyboardAvoidingView
      └─ ScrollView content
         ├─ Back row (chevron + Back)
         ├─ Headline ("Welcome back")
         ├─ Subtitle (supporting copy)
         ├─ Card surface (glass)
         │  ├─ Email label + input
         │  └─ Password label+link row + input + eye toggle
         ├─ Primary button (Log In)
         ├─ Footer row (Need an account? → Create Account)
         └─ Apple button (conditional) with button-local spinner overlay
```

## Stacking & Positioning
- Use `screenGradients.auth` background.
- Card uses a semi-opaque glass surface with soft shadow and 1px border.
- Apple button sits below the form/footer within the ScrollView, not fixed.

## Containers & Constraints
- Horizontal padding: 24.
- Card: radius 28, padding 24, borderColor rgba(255,255,255,0.18), background rgba(255,255,255,0.18).
- Inputs: 52 height, radius 14; password row includes eye toggle (hit target >= 40x40).
- Primary button: pill, filled white.

## Components mapping (from exports → RN)
- Background → `LinearGradient` with `screenGradients.auth`.
- Back row → `<TouchableOpacity>` with `Ionicons` chevron + text.
- Inputs → `<TextInput>` with proper keyboard and placeholder colors.
- Primary CTA → `<TouchableOpacity>` with ActivityIndicator while loading.
- Apple → `<AppleAuthentication.AppleAuthenticationButton>` with spinner overlay.

## React Native reference structure (do not copy verbatim)
```tsx
<SafeAreaView>
  <StatusBar style="light" />
  <LinearGradient colors={screenGradients.auth} ... />
  <KeyboardAvoidingView>
    <ScrollView contentContainerStyle={...}>
      {/* Back */}
      {/* Headline + subtitle */}
      {/* Card with inputs */}
      {/* Log In */}
      {/* Footer: Need an account? */}
      {/* Apple (if available) */}
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
```

## Theming & tokens
- Keep iOS26 glass: soft shadows, subtle borders.
- Respect existing `CARD_BACKGROUND` and styles already defined in file.

## Behavior & guardrails
- Do not alter login flow logic (proxy → direct with timeout) or `routeAfterLogin()`.
- Keep Forgot Password behavior and email validations.
- Apple sign-in must remain conditional and use the provided helper.
- Back button: if cannot go back, replace to `AuthLanding`.

## Definition of Done
- Visual parity at 390/428 with crisp inputs and glass card.
- Login, Forgot password, Apple and footer link work.
- Type-check, lint, and iOS build pass.
