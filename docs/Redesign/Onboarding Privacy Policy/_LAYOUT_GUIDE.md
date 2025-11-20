# Onboarding — Privacy Policy — Layout Guide

Implement this screen inside `nail-app-mobile/screens/LegalAcceptanceScreen.tsx`.
This guide defines the hierarchy, stacking order, and constraints for the “Before you start” privacy/terms acceptance screen.

## Screen mapping
- React Native file: `nail-app-mobile/screens/LegalAcceptanceScreen.tsx`
- Visual exports (reference only):
  - `docs/Redesign/Onboarding Privacy Policy/text.md`
  - `docs/Redesign/Onboarding Privacy Policy/selection-card.md`
  - `docs/Redesign/Onboarding Privacy Policy/agree-button.md`
  - `docs/Redesign/Onboarding Privacy Policy/full-figma-export.md`

## Hierarchy (bottom → top)
```
SafeAreaView (root)
└─ LinearGradient background (auth gradient; full-bleed)
   ├─ Header block
   │   ├─ Title ("Before you start")
   │   └─ Subtitle ("We need a quick confirmation…")
   ├─ ScrollView content
   │   └─ Glass Card (rounded, soft shadow)
   │       ├─ Agreement Row — Privacy Policy
   │       │   ├─ Copy block (title, description, Read Full Policy link)
   │       │   └─ Circular checkbox (right)
   │       └─ Agreement Row — Terms of Service
   │           ├─ Copy block (title, description, Read Full Terms link)
   │           └─ Circular checkbox (right)
   └─ Footer
       └─ Primary button (I agree and Continue)
```

## Stacking & Positioning
- Background gradient fills the screen (`StyleSheet.absoluteFill`).
- Header sits above the card; card sits within a ScrollView to allow vertical overflow on smaller heights.
- Footer button sits anchored at the bottom safe area with horizontal padding.
- Each agreement row aligns copy on the left and the circular checkbox on the right.

## Containers & Constraints
- Header/Scroll paddings: horizontal 24; header top padding ~16.
- Card:
  - Radius 28; padding 20–24.
  - Border 1px with subtle white alpha.
  - Background glass: `rgba(255,255,255,0.12–0.20)` with soft shadow.
- Agreement rows:
  - Row padding ~18, radius 24.
  - Inactive background `rgba(255,255,255,0.12)`, active `rgba(255,255,255,0.24)`; 1px border strengthens when active.
  - Checkbox: 28×28 circle; right-aligned.
- Button: pill radius; large tap target ≥48 height.

## Components mapping (from exports → RN)
- Background → `LinearGradient` using the auth gradient tokens.
- Title/Subtitle → `<Text>` styles; title may use brand pink to match Figma visual.
- Card → existing glass card styles (border + shadow) per file, tuned to match export.
- Agreement rows → `<TouchableOpacity>` with left copy stack and right circular checkbox.
- Links → “Read Full Policy/Terms” tap targets navigate to `PrivacyPolicy` / `TermsOfService`.
- Footer button → primary CTA disabled until both checkboxes checked.

## React Native reference structure (do not copy verbatim)
```tsx
<SafeAreaView style={styles.container}>
  <StatusBar style="light" />
  <LinearGradient colors={screenGradients.auth} start={{x:0.5,y:0}} end={{x:0.5,y:1}} style={StyleSheet.absoluteFill} />

  <View style={styles.header}>
    <Text style={styles.headerTitle}>Before you start</Text>
    <Text style={styles.headerSubtitle}>We need a quick confirmation…</Text>
  </View>

  <ScrollView contentContainerStyle={styles.scrollContent}>
    <View style={styles.card}>
      {/* Row: Privacy Policy (copy left, checkbox right) */}
      {/* Row: Terms of Service (copy left, checkbox right) */}
    </View>
  </ScrollView>

  <View style={styles.footer}>
    {/* Primary CTA */}
  </View>
</SafeAreaView>
```

## Theming & tokens
- Gradient: prefer `screenGradients.auth` for consistency with auth/onboarding.
- Title color: brand pink (e.g., `#FF86A8`) per visual; subtitle off‑white.
- Card/rows: glass surfaces with white alpha borders; shadows subtle.

## Behavior & guardrails
- Two independent toggles: `privacyChecked`, `termsChecked`.
- CTA enabled only when both are checked (`readyToContinue`).
- Links navigate to dedicated policy screens.
- On accept, call `acceptCurrentLegalDocuments(status)` then proceed to Main via existing `completeAndContinue()`.
- Keep all existing async/state logic intact.

## Definition of Done
- Visual parity at 390/428 with right‑aligned circular checkboxes and glass card.
- Header, links, and CTA match spacing and typography; CTA disabled until both checked.
- `npm run type-check`, `npm run lint`, and `npm run ios` pass.
