# NailGlow Experience & Interface Audit — March 2025 Refresh

## 1. UX Audit

### 1.1 High-Level Observations
- **Journey polish without continuity:** The home, onboarding, and styling screens maintain the premium rose-gold aesthetic, yet critical actions still depend on `localStorage` (e.g. `app/(main)/style/page.tsx:51`, `app/(main)/results/page.tsx:125`), so preferences and nail tries are lost across devices and sessions.
- **Colour discovery is still constrained:** `/colors` loads 18 swatches despite the richer Supabase schema and the new salon-brand scraping pipeline (`scrape_opi_uk.py`). This prevents in-salon colour matching and ignores curated category scripts such as `nail-app-mobile/supabase/24_add_pinks_and_fix_trending.sql` and `31_update_color_categories_from_csv.sql`. (Integrating the new salon-brand database is parked until you green-light that rollout.)
- **Processing feedback is limited:** The upload flow uses `UploadProgress` (`components/upload/UploadProgress.tsx`), yet the camera capture path never surfaces the processing state stored in `useImageStore`. After tapping “Confirm” in `ImagePreview`, the preview stays static while Gemini runs and the generic `NailPolishLoader` only appears once `/results` begins loading, so users still lack inline progress or retry affordances.
- **Server APIs rarely persist data:** `app/api/users/preferences/route.ts` and `app/api/nail-tries/route.ts` call `auth.getCurrentUser()` without a server session, so signed-out flows succeed locally, but logged-in persistence silently fails most of the time.
- **Salon hand-off remains theoretical:** The nail-tech card (`components/nail-tech/ColorMatchCard.tsx`) reuses static mocks for brand/options and still builds QR codes pointing to `https://nailapp.com/color/${color.id}` even though no live page exists.

### 1.2 Journey Review
#### Landing & Entry (`app/page.tsx`)
- Pros: Rich motion design and consistent brand promise.
- Gaps: No concise explanation of accuracy, privacy, or salon workflow; hero CTA drops straight into a five-step onboarding without previewing effort.

#### Account & Preferences (`app/(auth)/signup/page.tsx`, `app/(auth)/onboarding/page.tsx`)
- Pros: Per-step animations, safe-area spacing, optional skip.
- Gaps: Missing inline validation, password rules, and real feedback. POST to `/api/users/preferences` never reaches Supabase without a server-side session, so authenticated users believe preferences are saved when they are not.

#### Colour Discovery (`app/(main)/colors/page.tsx`)
- Pros: Tabbed layout, trending badges, liquid-glass shape selector.
- Gaps: `fetchColors()` flattens grouped results to 18 entries and lacks search, filters, recent history, or brand metadata. Integration with the richer salon-brand catalogue coming from the Python scraper is deferred until the dataset is ready, so today’s UI still feels like a demo palette.

#### Styling (`app/(main)/style/page.tsx`)
- Pros: Animated stepper, togglable French step, consistent button styles.
- Gaps: No summary or confirmation step; outputs are stored in `localStorage` and never synced to Supabase `users.style_preference` or `nail_tries`. On return visits the wizard resets.

#### Capture & Processing (`app/(main)/camera/page.tsx`, `components/camera/CameraCapture.tsx`)
- Pros: Hand guide overlay, upload alternative, animated controls.
- Gaps: Pressing “Confirm” calls Gemini via `/api/gemini/transform`, then we upsert a placeholder nail try with `color_hex: '#E8B4B8'` / “Rose Gold” before redirecting; the user never sees this fallback colour, but it will pollute saved-look data once we surface real records. The processing store (`stores/imageStore.ts`) is never consumed by UI, so users see no intermediate feedback beyond the upload flow. If Gemini fails, fallbacks are silently written to storage with no user messaging.

#### Results (`app/(main)/results/page.tsx`)
- Pros: Before/after layout, recommended grid, CTA to share.
- Gaps: Page renders even with no photo (no guard on `capturedImage`). Recommended colours come from `/api/colors?category=trending` or mock data, and analysis values display without confidence context. “Share” still navigates into a flow that assumes local assets despite v1 not requiring outbound sharing.

#### Saved Looks & Profile (`app/(main)/profile/page.tsx`, `components/profile/UserProfile.tsx`)
- Pros: Visual treatment and placeholders for stats/streaks.
- Gaps: Entirely mock data; editing toggles only mutate component state. `nail_tries` table and favourites RLS policies (`nail-app-mobile/supabase/03_storage_FIXED.sql`) are unused.

### 1.3 Systemic UX Risks
1. **Persistence mismatch:** Belief that preferences and nail tries are saved when they are not (due to server auth gap) will erode trust and block paywall adoption.
2. **Salon workflow gap:** Without exhaustive search + brand metadata from the Python ingestion, the product fails its primary promise—matching in-salon shades instantly.
3. **Processing ambiguity:** Camera flow lacks progress or error surfaces despite the existence of `UploadProgress`; this leads to premature navigation and user confusion when transformations fail.
4. **Fragmented local state:** Heavy reliance on `localStorage` prevents continuity across web, native, and future kiosk experiences.

## 2. UI Audit

### 2.1 Design System & Tokens
- Tailwind config defines a rose-gold palette, yet components frequently fall back to generic `text-gray-*` values rather than using `text-primary` / `text-charcoal`, creating inconsistent contrast.
- Colors and spacing are duplicated between Tailwind (`tailwind.config.ts`) and JS constants (`lib/constants.ts`), inviting drift.
- No central typography scale; headings use ad-hoc sizes across pages.

### 2.2 Layout & Navigation
- Each page rebuilds the header (e.g. `app/(main)/colors/page.tsx`, `app/(main)/results/page.tsx`) instead of sharing a cohesive mobile chrome component, so paddings and icon placement vary.
- `mobile-container` in `app/globals.css` is not consistently applied; some screens hit the raw viewport, others sit within the capped container.
- No persistent tab/navigation shell—even though the design spec calls for Create / My Looks / Profile tabs—so users rely on browser back.
- `viewport` metadata disables zoom (`maximumScale: 1`), harming accessibility.

### 2.3 Component Implementation
- State stores (`useImageStore`, `useGemini`, `useImageUpload`) encapsulate rich logic but are not consumed by top-level screens, leaving UI without actual progress indicators or analysis caching.
- Animation patterns vary: some buttons use `motion.button`, others rely on Tailwind hover states. Consider standardising via shared primitives.
- Safe-area utilities exist but several sections nest fixed footers (`app/(main)/style/page.tsx:186`) without accounting for bottom insets on smaller devices.

### 2.4 Visual Quality Observations
- Gradient backgrounds are manually recreated per screen (home, results, share) rather than driven by design tokens.
- Some gradients place white text on low-contrast backgrounds (e.g. trending cards on `/colors`). Contrast testing is needed to meet WCAG AA.
- Iconography is consistently sourced from Lucide, but sizes vary (20/24/28) without alignment to typography scale.

## 3. UX/UI Change Plan

### P0 — Blockers for Beta
1. **Wire Supabase persistence end-to-end**
   - Fix server auth by passing session tokens to API routes or moving preference saves client-side via Supabase JS auth context.
   - Store style selections, nail tries (with `processing_time_ms`, salon notes), and analysis results centrally; hydrate screens from Supabase before falling back to local cache.
2. **Ship the salon-grade colour catalogue UI**
   - Integrate the Python ingest output (real salon brands) with `/api/colors`. Deliver category accordions, search, filters, and “match to salon inventory” tooling.
3. **Add true processing feedback**
   - Consume `useImageStore` in `CameraCapture` / `ImagePreview` to show a dedicated processing overlay with progress, success, and retry. Ensure failure states halt navigation to `/results`.
4. **Guard results & profile**
   - Redirect when no active nail try exists; show error states with recovery options.

### P1 — Usability & Consistency
1. **Unify mobile chrome**
   - Extract a shared header/footer component with safe-area handling and consistent typography.
   - Keep the current liquid-glass bottom bar visuals, but extend it (behind the scenes) to handle the Create / My Looks / Profile navigation states defined in the spec so the UX aligns without changing the look.
2. **Refine design tokens**
   - Create a single source of truth for palette, typography, spacing, and elevation. Replace ad-hoc class names with semantic utilities.
3. **Surface AI context**
   - Display analysis confidence, undertone reasoning, and timestamp on the results page. Allow quick re-analysis with updated prompts.

### P2 — Polishing & Expansion
1. **Printable / shareable salon cards** (once persistence is stable) with QR shortlinks to real Supabase records.
2. **Advanced personalisation** — streak tracking, reminders, and seasonal tips once cross-device data flow is reliable.
3. **Accessibility & QA** — enable pinch zoom, add responsive breakpoints for tablet/desktop previews, and run automated contrast tests.

---
*Prepared by Codex UX/UI · March 2025 refresh. This document should evolve as the salon-brand ingestion pipeline and AI transformation stack mature.*
