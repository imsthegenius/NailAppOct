# Onboarding — Login Choice (Auth Landing) — Layout Guide

Implement this screen inside `nail-app-mobile/screens/AuthLandingScreen.tsx`.
This guide defines the hierarchy, stacking order, and constraints for the choice screen that follows onboarding.

## Screen mapping
- React Native file: `nail-app-mobile/screens/AuthLandingScreen.tsx`
- Visual exports (reference only):
  - `docs/Redesign/Onboarding login - choice/background.md`
  - `docs/Redesign/Onboarding login - choice/login-button.md`
  - `docs/Redesign/Onboarding login - choice/login-divider.md`
  - `docs/Redesign/Onboarding login - choice/sign-up-apple.md`
  - `docs/Redesign/Onboarding login - choice/footer-text.md`
  - `docs/Redesign/Onboarding login - choice/full-figma-export.md`

## Hierarchy (bottom → top)
```
SafeAreaView (root)
└─ LinearGradient (auth gradient; full-bleed)
   ├─ Body spacer (flex:1)
   ├─ Headline text ("Let's get started")
   └─ Footer block
       ├─ Primary button (Create Account)
       ├─ Apple button (if available)
       ├─ Secondary button (Log In)
       └─ Legal copy (centered)
```

## Stacking & Positioning
- Use `screenGradients.auth` with `StyleSheet.absoluteFill`.
- Place the headline higher (matching onboarding titles), footer actions stacked with comfortable gaps.
- Apple button is conditionally rendered; keep a spinner overlay centered when loading.

## Containers & Constraints
- Horizontal padding: 24.
- Primary button: filled, pill radius; Secondary: bordered, translucent surface.
- Apple button: height 48, cornerRadius 24, full-width.
- Ensure minimum tappable height/spacing for WCAG touch targets.

## Components mapping (from exports → RN)
- Background → `LinearGradient` using `screenGradients.auth`.
- Headline → `<Text style={styles.headline}>`.
- Buttons → `<TouchableOpacity>` for Create Account and Log In; `<AppleAuthentication.AppleAuthenticationButton>` for Apple.
- Legal → `<Text style={styles.legal}>` in footer.

## React Native reference structure (do not copy verbatim)
```tsx
return (
  <View style={{ flex: 1 }}>
    <StatusBar style="light" />
    <LinearGradient colors={screenGradients.auth} ... style={StyleSheet.absoluteFill} />
    <SafeAreaView style={styles.container}>
      <View style={styles.spacer} />
      <Text style={styles.headline}>Let's get started</Text>
      <View style={styles.footer}>
        <View style={styles.actions}>
          {/* Primary */}
          {/* Apple (if available) */}
          {/* Secondary */}
        </View>
        <Text style={styles.legal}> ... </Text>
      </View>
    </SafeAreaView>
  </View>
)
```

## Theming & tokens
- Gradient: `screenGradients.auth`.
- Primary button text: dark on white; Secondary: white on translucent surface, 1px white border.
- Respect iOS26 glass tone and shadows used elsewhere.

## Behavior & guardrails
- `Create Account` → `navigation.replace('Signup')`.
- `Log In` → `navigation.replace('Login')`.
- Apple: render only if available; on press call `signInWithApple()` and, on success, `navigation.replace('Main')`.
- Show spinner overlay on Apple while loading; do not block the entire screen.

## Definition of Done
- Visual parity at 390/428 with correct stacking and spacings.
- Buttons operate as described; Apple is conditional, with loading overlay.
- Build, type-check and lint pass.
