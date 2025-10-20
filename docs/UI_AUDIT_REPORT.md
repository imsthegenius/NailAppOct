# NailGlow UI Audit — March 2025

## 1. Design System Consistency
- Tailwind configuration defines the rose-gold palette, but components frequently use hard-coded `text-gray-*` shades. Establish canonical utility classes (`text-primary`, `text-charcoal`) and lint for violations.
- Colours live both in `tailwind.config.ts` and `lib/constants.ts`. Consolidate tokens into a shared source to avoid drift across web and native clients.
- Typography sizes differ per screen (e.g. onboarding vs. profile); introduce a scaled typographic system (heading/subheading/body/caption) and apply globally.

## 2. Layout & Navigation
- Each page owns its header. Extract a shared mobile chrome component with consistent safe-area padding, icon sizing, and background treatment.
- The intended bottom navigation (Create / My Looks / Profile) is absent. Reintroduce it per `DESIGN_SPECIFICATION.md` for predictable navigation.
- `app/globals.css` enforces a max-width container, but many screens bypass it, creating inconsistent margins. Use the container utility uniformly.
- `viewport` metadata sets `maximumScale: 1`; remove this to restore pinch-to-zoom for accessibility.

## 3. Component Implementation
- Stores (`useImageStore`, `useGemini`, `useImageUpload`) expose progress state, yet `CameraCapture` bypasses them. Wire these stores into primary screens to display live status and errors.
- Animation styles vary across buttons and cards. Wrap Lucide icons and motion primitives in shared components to standardise easing, duration, and touch feedback.
- Fixed footers (e.g. Style stepper and Results actions) ignore bottom safe areas on smaller devices. Add `pb-safe-area-inset-bottom` and responsive spacing rules.

## 4. Visual Quality & Accessibility
- Contrast on gradient overlays (Trending cards, results headers) occasionally drops below WCAG AA. Audit gradients and adjust overlays or text colour.
- Icon sizing (20/24/28 px) varies per screen; align to typography scale for balance.
- Provide high-quality placeholder imagery for unassigned thumbnails to prevent layout shifts.

## 5. Technical Hygiene
- Document component usage in Storybook (web) or Expo preview (native) to validate visual states before integration.
- Add automated lint rules for design tokens (e.g. deny raw hex codes, enforce spacing multiples).
- Implement screenshot-based regression testing for critical flows (Style, Camera, Results) to catch visual regressions.

---
*Prepared by Codex UI · March 2025*
