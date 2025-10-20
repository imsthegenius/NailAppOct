# NailGlow UX/UI Implementation Plan — March 2025

This plan translates the latest UX and UI audits into actionable work. Tasks are grouped by phase, with ownership, prerequisites, and key deliverables identified to keep design, engineering, and product aligned.

---
## Phase 0 – Foundations & Data Integrity
_Target: unblock beta-readiness by ensuring captured experiences persist accurately and remain trustworthy._

### 0.1 Supabase Persistence Fixes
- **Goal:** Replace local-only state with reliable, authenticated persistence for preferences and nail tries.
- **Tasks:**
  1. **Server Auth Context**
     - Update API routes (`app/api/users/preferences`, `app/api/nail-tries`) to accept Supabase session tokens from the client or migrate logic to edge functions using Supabase auth helpers.
     - Add regression tests ensuring authenticated requests create/update rows, while anonymous requests fall back to client storage only.
  2. **Style Preference Sync**
     - In the style wizard (`app/(main)/style/page.tsx`), hydrate selections from Supabase on mount (when session available) before falling back to `localStorage`.
     - Persist selections after each step or on completion to `users.style_preference`.
  3. **Nail Try Persistence**
     - After Gemini analysis, replace the current placeholder payload (`color_hex: '#E8B4B8'`, `color_name: 'Rose Gold'`) with the returned analysis data (recommended colour, finish, confidence) before inserting into `nail_tries`.
     - Store both original and transformed images, plus salon notes when available.
- **Deliverables:** Working Supabase-backed flows with automated tests covering success/failure paths.
- **Owners:** Backend + frontend engineering.

### 0.2 Processing Feedback Integration
- **Goal:** Give users clear progress/error states during capture-to-results.
- **Tasks:**
  1. **Surface `useImageStore` in Camera Flow**
     - Consume `processing.step`, `progress`, and `message` inside `CameraCapture`/`ImagePreview`.
     - Add a modal or overlay that appears immediately after “Confirm” showing analysis progress, plus a cancel/back option.
  2. **Error Handling**
     - When `step === 'error'`, display retry messaging and avoid navigating to `/results` until analysis succeeds.
     - Log errors (Sentry/analytics) for operations and include user-facing guidance (e.g., “Check connection” or “Reposition hand”).
- **Deliverables:** Consistent processing overlay for both upload and camera paths, with retry flow verified.
- **Owners:** Frontend engineering + design QA.

### 0.3 Results Guardrails
- **Goal:** Prevent empty or stale results screens.
- **Tasks:**
  1. **Entry Guard**
     - Redirect users back to `/camera` if there is no valid nail try ID and no cached capture.
  2. **Data Hydration**
     - Fetch nail try data from Supabase when an ID exists; fallback to local storage only as a last resort.
  3. **Analysis Context**
     - Display confidence score, undertone reasoning, and timestamp based on Gemini response.
- **Deliverables:** Results page shows accurate data or instructs the user to recapture.
- **Owners:** Frontend engineering, QA.

---
## Phase 1 – Catalogue & Navigation Enhancements
_Target: polish discoverability and navigation while keeping the current visual style intact._

### 1.1 Colour Catalogue Upgrade (Deferred Activation)
- **Note:** Implementation is scoped now; activation will wait until the new salon-brand dataset is ready.
- **Tasks:**
  1. **API Layer**
     - Prepare `/api/colors` to accept filters (brand, finish, mood, season) backed by Supabase indexes when the full dataset lands.
     - Add pagination support without slicing client-side.
  2. **UI Structure**
     - Extend the current `/colors` page to support category accordions, search, and “recently tried” strips, wrapping them behind a feature flag until data is available.
  3. **Matching Modal (Design-Only)**
     - Produce UX/UI specs for “Match to Salon Inventory” modal (accept hex/Pantone, show nearest results). Build component scaffolding but hide until catalog launch.
- **Deliverables:** Ready-to-toggle catalogue UI & API with feature flags.
- **Owners:** Frontend + backend engineering, design.

### 1.2 Navigation Shell Alignment
- **Goal:** Maintain the existing liquid-glass aesthetic while enabling the planned Create / My Looks / Profile navigation structure.
- **Tasks:**
  1. **Component Audit**
     - Identify current bottom bar usage (shape selector, action buttons) and document component API.
  2. **State Extension**
     - Add navigation state handling to the component (selected route, badge states) without altering visuals.
     - Integrate with Next.js routing to highlight the active section.
  3. **Shared Header/Footer**
     - Extract shared header wrapper with safe-area padding, consistent icon sizes, and back behaviour.
- **Deliverables:** Persistent navigation states wired to existing bar visuals; unified header component.
- **Owners:** Frontend engineering, design.

### 1.3 Design Tokens & Accessibility
- **Goal:** Reduce drift between Tailwind and JS tokens, improve contrast/accessibility.
- **Tasks:**
  1. **Token Consolidation**
     - Generate a single design token file (e.g., `tokens.ts` or `tokens.json`) feeding both Tailwind and JS constants.
  2. **Typography Scale**
     - Define heading/subheading/body/caption sizes and update key screens to use the scale.
  3. **Contrast Audit**
     - Run automated contrast checks (storybook addon / axe) on gradients and overlays; adjust text colours or add gradient overlays where needed.
  4. **Viewport Accessibility**
     - Remove `maximumScale: 1` from `app/layout.tsx` metadata to enable pinch-zoom.
- **Deliverables:** Documented tokens, consistent typography, accessibility improvements verified by tooling.
- **Owners:** Design systems lead, frontend engineering.

---
## Phase 2 – Personalisation & Sharing Readiness
_Target: build on reliable foundations to deliver salon-ready outputs and richer user history._

### 2.1 Salon Hand-Off Experience
- **Tasks:**
  1. **Nail-Tech Card Data**
     - Populate card with real Supabase colour data (brand, SKU, finish, alternatives) based on Gemini results.
  2. **PDF/Export Prep**
     - Generate server-rendered or client-rendered PDFs for printable cards; ensure QR codes link to real records once available.
  3. **On-Device Handoff View**
     - Create a high-contrast screen for salon use with quick toggles for alternatives and appointment notes.
- **Deliverables:** Shareable outputs suitable for salons once catalogue data is live.
- **Owners:** Frontend engineering, design, backend for storage/links.

### 2.2 Advanced Personalisation
- **Tasks:**
  1. **My Looks Timeline**
     - Build a history screen fetching `nail_tries` sorted by date with filters (colour family, finish).
  2. **Streaks & Reminders**
     - Once persistence is reliable, wire up streak badges and optional reminder notifications (respecting feature flags in `lib/constants.ts`).
- **Deliverables:** Engaging retention features built on solid data.
- **Owners:** Product, design, engineering.

### 2.3 QA, Testing & Analytics
- **Tasks:**
  1. **Visual Regression Tests**
     - Add screenshot tests for key flows (Style, Camera, Results) to catch unintended UI changes.
  2. **Analytics Instrumentation**
     - Track colour searches, analysis success/failure rates, retry counts, and navigation usage to inform future iterations.
  3. **Storybook/Expo Docs**
     - Document updated components to ensure consistency between web and native implementations.
- **Deliverables:** Robust QA coverage and actionable analytics dashboards.
- **Owners:** QA, engineering, data.

---
## Cross-Cutting Considerations
- **Feature Flags:** Wrap catalogue upgrades, navigation changes, and salon hand-off features in flags so we can roll them out gradually.
- **Documentation:** Update `nail-app-implementation-plan.md` and design handoffs with any component or flow changes.
- **Team Sync:** Hold a weekly stand-up across UX, UI, backend, and mobile teams to track progress and unblock dependencies.

---
*Prepared by Codex UX/UI · March 2025*
