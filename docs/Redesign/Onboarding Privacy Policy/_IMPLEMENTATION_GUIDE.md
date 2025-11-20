# Onboarding — Privacy Policy — Implementation Guide

Target file to edit: `nail-app-mobile/screens/LegalAcceptanceScreen.tsx`

Follow the master rules: `/Users/imraan/Downloads/NailAppNewRepo/docs/Master-rules/IMPLEMENTING FIGMA DESIGNS ANIMA.md`.
Use the layout in: `/Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Onboarding Privacy Policy/_LAYOUT_GUIDE.md`.

## Objectives
- Match the visual of the “Before you start” screen with two acceptance options and a bottom CTA.
- Preserve all existing async/state logic (`fetchLegalAcceptance`, `legalAcceptanceRequired`, `acceptCurrentLegalDocuments`, navigation).

## Step-by-step
1. Background & header
   - Keep the full‑bleed gradient already present. Optional: align to `screenGradients.auth` if we want consistency across auth screens.
   - Title: “Before you start” can use brand pink; subtitle remains off‑white. Do not alter header copy.

2. Agreement rows (layout)
   - Each row should render: left = copy block, right = circular checkbox.
   - Implementation detail:
     - Swap child order so the copy container renders first and the checkbox view renders last.
     - Ensure the row remains a single `<TouchableOpacity>` so tapping anywhere toggles state.
     - Keep current toggling logic: `privacyChecked`, `termsChecked`.
   - Checkbox visuals:
     - Inactive: transparent fill, 2px white alpha border.
     - Active: solid white fill with checkmark (current icon acceptable). Optional: adjust border when active for stronger contrast.

3. Copy blocks
   - Privacy row:
     - Title: “Privacy Policy”. Description: “Learn how we handle your photos and personal data.”
     - Link: “Read full policy” → `handleOpenPrivacy()` (already wired).
   - Terms row:
     - Title: “Terms of Service”. Description: “Understand what you can expect from NailGlow and what we expect from you.”
     - Link: “Read full terms” → `handleOpenTerms()` (already wired).
   - Typography: title bold ~18, description ~14, link underlined; keep existing colors.

4. Glass card container
   - Keep `styles.card` glass surface: radius ~28, subtle white border, soft shadow, alpha background (already present).
   - Spacing between rows: first row bottom margin, second row no bottom margin.

5. CTA enablement
   - Keep `readyToContinue = privacyChecked && termsChecked` and disable CTA when false or while `loading`.
   - Label: “I agree and continue”. Show spinner while loading.

6. A11y & behavior
   - Ensure touch targets ≥ 44–48 px high; keep entire row tappable.
   - Give CTA `accessibilityRole="button"`.
   - Do not change navigation: on accept, call `acceptCurrentLegalDocuments(status)` then `completeAndContinue()`
     (which marks onboarding complete and routes to `Main`, or per status as implemented).

## Visual tokens
- Title pink (brand); subtitle off‑white.
- Card/rows glass with white alpha borders; row active state increases background/border alpha.
- Checkbox: circular 28px. Checkmark uses `Ionicons` and current color scheme.

## Testing checklist
- On first load: while checking account, loader row shows inside card.
- Tapping rows toggles visual state; CTA enables only when both are checked.
- “Read full policy/terms” navigate to the respective screens.
- After acceptance, user reaches Main. Re‑opening should not prompt again if status no longer requires acceptance.
- `npm run type-check && npm run lint && npm run ios` pass.

## Commit examples
- `feat(mobile): legal acceptance layout per _LAYOUT_GUIDE`
- `style(mobile): move checkboxes right, tune glass card and spacing`
