# Onboarding — Create Account (Signup) — Layout Guide

Implement this screen inside `nail-app-mobile/screens/SignupScreen.tsx`.
This guide defines the hierarchy, stacking order, and constraints for the create account form.

## Screen mapping
- React Native file: `nail-app-mobile/screens/SignupScreen.tsx`
- Visual exports (reference only):
  - `docs/Redesign/Onboarding Create Account/back-button copy.md`
  - `docs/Redesign/Onboarding Create Account/top-text.md`
  - `docs/Redesign/Onboarding Create Account/login-divider copy 2.md`
  - `docs/Redesign/Onboarding Create Account/sign-up-apple copy 2.md`
  - `docs/Redesign/Onboarding Create Account/footer-text copy 2.md`
  - `docs/Redesign/Onboarding Create Account/full-figma-export.md`

## Hierarchy (bottom → top)
```
SafeAreaView (root)
└─ LinearGradient (auth; full-bleed)
   └─ KeyboardAvoidingView
      └─ ScrollView content
         ├─ Back row (chevron + Back)
         ├─ Headline ("Create your account")
         ├─ Subtitle (supporting copy)
         ├─ Card surface (glass)
         │  ├─ Name label + input
         │  ├─ Email label + input
         │  └─ Password label + input + eye toggle
         ├─ Primary button (Create Account)
         └─ Footer row (Already have an account? → Log In)
```

## Stacking & Positioning
- Use `screenGradients.auth` background.
- Card uses a semi-opaque glass surface with soft shadow and 1px border (as defined in file).
- No Apple button on this screen in current implementation.

## Containers & Constraints
- Horizontal padding: 24.
- Card: radius 28, padding 24, border `rgba(255,255,255,0.18)`, background `rgba(255,255,255,0.18)`.
- Inputs: 52 height, radius 14; password row includes eye toggle (hit target >= 40x40).
- Primary button: pill, filled white.

## Components mapping (from exports → RN)
- Background → `LinearGradient` with `screenGradients.auth`.
- Inputs → `<TextInput>` for Name, Email, Password with placeholders and correct keyboard settings.
- Primary CTA → `<TouchableOpacity>` with ActivityIndicator while loading.
- Footer → "Already have an account? Log In" link.

## React Native reference structure (do not copy verbatim)
```tsx
<SafeAreaView>
  <StatusBar style="light" />
  <LinearGradient colors={screenGradients.auth} ... />
  <KeyboardAvoidingView>
    <ScrollView contentContainerStyle={...}>
      {/* Back */}
      {/* Headline + subtitle */}
      {/* Card with Name/Email/Password */}
      {/* Create Account */}
      {/* Footer: Already have an account? */}
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
```

## Theming & tokens
- Maintain iOS26 glass: soft shadows, subtle borders; reuse `CARD_BACKGROUND`.
- Placeholder and label colors match Login screen for parity.

## Behavior & guardrails
- Do not change the signup flow logic (proxy → XHR → direct with timeout).
- Preserve `storePendingFullName`, `markOnboardingComplete`, and `resolvePostAuthDestination` behaviors.
- Respect navigation routes: Back → `goBack()` or replace to `AuthLanding`; on success, route per existing logic to `EmailVerification` or `Main`/`LegalAcceptance`.

## Definition of Done
- Visual parity at 390/428 with glass card containing three inputs and a Create Account CTA.
- Footer link routes to Login; validations and AsyncStorage flows preserved.
- Build, type-check and lint pass.
