# Color Catalog Expansion & Integration Plan

This plan outlines how to merge the new salon-brand colour catalogues into the existing Nail App stack, covering schema updates, data ingestion, backend surfaces, frontend UX, and the saved-look workflow. Every action below references the current Supabase schema and app code so implementation stays grounded in the repository.

---

## 1. Objectives & Source Data
### Repository targets
- Supabase migrations live under `nail-app-mobile/supabase/`.
- CSV ingestion scripts can sit in the repo root or `nail-app-mobile/scripts/`.
- React Native UI updates belong in `nail-app-mobile/screens/` and supporting modules under `nail-app-mobile/lib/` or `nail-app-mobile/src/`.

- **Goal:** ingest OPI, CND, and The GelBottle colours, preserve brand-specific metadata (system, shade code, collection, swatch), and expose it through the app with brand-aware filtering.
- **Sources:**
  - `opi_full_uk_catalog.csv` (columns: Brand, ProductType, ShadeCode, ShadeName, Collection, ProductURL, SwatchImageURL, ApproxHex)
  - `cnd_full_uk_catalog.csv` (Brand, ProductType, Collection, ShadeName, ShadeCode, ProductURL, SwatchImageURL, ApproxHex)
  - `tgb_full_catalog.csv` (Brand, Product Type, Collection, Category, Shade Name, ApproxHex, ProductURL, SwatchURL)
- **Existing reference:** `docs/database_update_summary.md` explains how the CSVs are refreshed; keep it as the operational run-book.

---

## 2. Schema Audit (Current State)

### 2.1 Core colour catalogue (`supabase/01_schema.sql` + later migrations)
- Table **`colors`** currently stores one row per unique `hex_code` with columns: `id`, `hex_code` (UNIQUE), `name`, `brand`, `category`, `finish`, `trending_score`, `season` (`TEXT[]`), `mood_tags` (`TEXT[]`), `pantone_code`, `created_at`, `updated_at`, `category_group` (`supabase/09_mobile_app_updates.sql:15`), `hue`, `saturation`, `lightness`, `display_order` (`supabase/32_hex_only_categorization.sql:12-16`).
- Constraints:
  - `hex_code` validated by `valid_hex_code` (`supabase/01_schema.sql:64`).
  - `finish` enforced to `('glossy','matte','chrome','shimmer','glitter','cream')` (`supabase/01_schema.sql:53`).
  - Latest category constraint allows `%{'trending','nudes','reds','burgundy','pastels','french','blues','greens','purples','pinks','metallics','darks'}%` (`supabase/29_insert_2025_trending_colors_fixed.sql:150`).
- Derived categorisation scripts populate `hue/saturation/lightness` and set `display_order` (`supabase/32_hex_only_categorization.sql`, `supabase/33_refine_hex_rules.sql`).

### 2.2 Saved experience tables
- **`nail_tries`** (`supabase/01_schema.sql:86-125`) stores `color_hex`, `color_name`, `color_brand` (nullable), but no product-system metadata.
- **`saved_looks`** (`supabase/09_mobile_app_updates.sql:34-68`) stores `color_name`, `color_hex`, and `shape_name`; brand/system fields are absent.

### 2.3 App consumers (React Native)
- `screens/StyleScreen.tsx` still uses a hard-coded `COLORS` array, so the mobile app exposes only 18 static shades and no brand metadata.
- Saved-look helpers in `lib/supabaseStorage.ts` persist `color_hex`, `color_name`, and `shape_name` only; there is no storage for product line, collection, or swatch URLs.
- `screens/ProcessingScreen.tsx` ultimately calls `lib/geminiService.ts::transformNailsWithGemini` with `colorHex`/`colorName` but without finish or variant identifiers.

---

## 3. Proposed Schema Enhancements

### 3.1 Brand variant table
Create a dedicated table to store per-brand shade variants while re-using the existing `colors` record for hex-level metadata.

```sql
-- supabase/39_color_variants.sql (new migration)
CREATE TABLE color_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  product_line TEXT NOT NULL,
  shade_name TEXT NOT NULL,
  shade_code TEXT,
  collection TEXT,
  finish_override TEXT CHECK (finish_override IN ('glossy','matte','chrome','shimmer','glitter','cream','sheer','pearl','creme')), -- extra finishes where needed
  product_url TEXT,
  swatch_url TEXT,
  source_catalog TEXT NOT NULL, -- 'opi_full_uk_catalog', etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (brand, product_line, COALESCE(shade_code,''), color_id)
);

CREATE INDEX color_variants_color_id_idx ON color_variants(color_id);
CREATE INDEX color_variants_brand_line_idx ON color_variants(brand, product_line);
```

Notes:
- `product_line` captures entries like “Nail Lacquer”, “Shellac”, “BIAB”.
- `finish_override` allows us to capture finishes not in the base enum (e.g., TGB “Sheer”). During ETL we map unfamiliar finishes to these values and optionally update `colors.finish` if they match.

### 3.2 Extend `colors`
- Add optional pointer to a primary variant so existing logic can surface brand-specific details:
  ```sql
  ALTER TABLE colors ADD COLUMN IF NOT EXISTS primary_variant_id UUID REFERENCES color_variants(id);
  ALTER TABLE colors ADD COLUMN IF NOT EXISTS source_priority TEXT; -- e.g., 'OPI', 'CND', 'TGB'
  ```
- Retain existing `brand` column for backward compatibility; populate it with the brand name of `primary_variant_id`.

### 3.3 Persist variant metadata on user artefacts
- `nail_tries`:
  ```sql
  ALTER TABLE nail_tries
    ADD COLUMN IF NOT EXISTS color_variant_id UUID REFERENCES color_variants(id),
    ADD COLUMN IF NOT EXISTS product_line TEXT,
    ADD COLUMN IF NOT EXISTS shade_code TEXT,
    ADD COLUMN IF NOT EXISTS collection TEXT,
    ADD COLUMN IF NOT EXISTS swatch_url TEXT;
  ```
- `saved_looks`:
  ```sql
  ALTER TABLE saved_looks
    ADD COLUMN IF NOT EXISTS color_variant_id UUID REFERENCES color_variants(id),
    ADD COLUMN IF NOT EXISTS color_brand TEXT,
    ADD COLUMN IF NOT EXISTS product_line TEXT,
    ADD COLUMN IF NOT EXISTS shade_code TEXT,
    ADD COLUMN IF NOT EXISTS collection TEXT,
    ADD COLUMN IF NOT EXISTS swatch_url TEXT;
  ```
  (Note: `color_brand` does not exist today in `saved_looks`; add it to keep parity with `nail_tries`.)

---

## 4. ETL Mapping (CSV → Database)

### 4.1 Normalisation rules
- Canonicalise `brand` names exactly as they appear in CSVs (e.g., “OPI”, “CND”, “The GelBottle Inc.”).
- Map CSV product types:
  - OPI `ProductType` → `product_line` (values: “Nail Lacquer”, “Infinite Shine”, “GelColor”).
  - CND `ProductType` → “Shellac” or “Vinylux”.
  - TGB `Product Type` → “GelColor” or “BIAB”.
- Translate finish/texture:
  - Use CSV-specific fields (`tgb_full_catalog.csv` “Category”) to set `color_variants.finish_override` (Standard → glossy, Shimmery → shimmer, Sheer → sheer, Metallic/Chrome as-is, Glitter handled similarly).
  - For OPI/CND, infer finish from product metadata when available; otherwise map to `glossy`.
- `ApproxHex` becomes `colors.hex_code` (upper-case) after validation.
- Collections: use `Collection` field directly; blank if missing.
- Swatch URLs: `SwatchImageURL` / `SwatchURL` map to `color_variants.swatch_url`.
- Product URLs: map to `color_variants.product_url`.

### 4.2 Load process
1. **Extract:** read the CSVs from repo root.
2. **Transform:**
   - Validate hex format (`#RRGGBB`).
   - Deduplicate variants by `(brand, product_line, shade_code)` if duplicates exist in CSV.
   - For each hex, generate/lookup a `colors` record:
     - Upsert by `hex_code`; set `name` to the first encountered `ShadeName`; set `brand` & `primary_variant_id` later.
     - Fill `finish` using mapped base finish (fallback `glossy` to satisfy `CHECK`).
     - Optionally populate `category_group` with human-readable family when known.
   - After initial insert, run `32_hex_only_categorization.sql` and `33_refine_hex_rules.sql` to update `category`, `hue`, `saturation`, `lightness`, and `display_order`.
3. **Load:**
   - Insert into `color_variants` with the `color_id` foreign key, using `source_catalog` set to the CSV filename (e.g., `opi_full_uk_catalog`).
   - Update `colors.primary_variant_id` for the preferred variant (e.g., brand-specific hero product) using `UPDATE colors SET primary_variant_id = (...) WHERE hex_code = ...`.

Automation: encapsulate the above in a script (e.g., `scripts/sync_color_catalog.py`) that accepts CSV paths and handles Supabase inserts via SQL or API.

---

## 5. Data Access & Recommendation Layer

### 5.1 Supabase queries & service module
- The React Native app talks directly to Supabase (see `nail-app-mobile/lib/supabase.ts`), so add a dedicated data service (e.g., `nail-app-mobile/src/services/colorCatalog.ts`) that wraps all catalogue queries.
- Expose helpers such as `fetchColorCatalog(filters)` and `fetchVariantsForColor({ hexCode, variantId })` that join `colors` and `color_variants`, accept filters (`brand`, `product_line`, `finish`, `collection`, `has_swatch`), and return both legacy fields (`hex_code`, `name`, `brand`) and variant metadata.
- If queries become complex, create Supabase views or RPC functions in `nail-app-mobile/supabase/` migrations so the mobile client can call a cleaner endpoint.
- Update the generated types (`types/supabase.ts` or equivalent) so the new service has static typings.

### 5.2 Recommendation & storage pipeline
- Wherever the app builds the selected colour payload (currently `screens/CameraScreen.tsx` and helpers in `lib/supabaseStorage.ts`), extend the object to include `color_variant_id`, `brand`, `product_line`, `shade_code`, `collection`, `swatch_url`.
- When saving looks (`lib/supabaseStorage.ts::saveNailLook`), persist the new columns while still writing the legacy `color_hex`, `color_name`, and `color_brand` fields.
- Supabase SQL functions that aggregate by `color_hex` (`supabase/04_functions.sql:107-166`) should continue to work; extend them carefully if variant-level analytics are needed.

---

## 6. Frontend Updates (React Native)

### 6.1 Catalogue browsing
- Replace the static colour grid in `screens/StyleScreen.tsx` with data from the new service. Add a brand selector (tabs or segmented control), then show colour-family filters derived from `colors.category`.
- Add brand-specific secondary filters:
  - OPI: `product_line` (Nail Lacquer, Infinite Shine, GelColor) + Collection picker.
  - CND: `product_line` (Shellac, Vinylux) + Collection picker.
  - The GelBottle: `product_line` (GelColor, BIAB) + texture/finish chips (from `finish_override`).
- Support larger result sets with pagination or infinite scroll, and render swatch imagery using `swatch_url` when available (fallback to hex tile).

### 6.2 Selection & state management
- Store the selected colour in shared state (context, Zustand, or existing global) with `{ color_id, color_variant_id, hex_code, brand, product_line, shade_code, collection, swatch_url, finish }`.
- Update navigation flows (`screens/DesignScreen.tsx`, `screens/ProcessingScreen.tsx`, `screens/CameraScreen.tsx`) to read the richer payload and pass it through to Gemini.

### 6.3 Results, feed & saved looks
- Update `screens/ResultsScreen.tsx`, `screens/FeedScreen.tsx`, `screens/MyLooksScreen.tsx` (or whichever components render saved looks) to display brand/product-line/shade-code metadata and swatch thumbnails.
- Ensure look-saving flows call the updated storage helper so new columns reach Supabase.

---

## 7. Migration & Deployment Steps
1. **Create migrations:** add SQL files under `supabase/` to create `color_variants` and extend existing tables as described in §3.
2. **Run migrations locally** using Supabase CLI or SQL editor; verify constraints (especially `finish_override` values).
3. **Implement ETL script** and execute against the three CSVs; verify row counts per brand vs. source file.
4. **Re-run categorisation scripts** (`supabase/32_hex_only_categorization.sql` → `33_refine_hex_rules.sql`) to keep `colors.category` and `display_order` aligned.
5. **Backfill `colors.brand`** with the chosen primary variant brand to maintain backward compatibility.
6. **Regenerate Supabase TypeScript definitions** (e.g., `types/supabase.ts`) so new columns (`color_variants`, extended `nail_tries`/`saved_looks`) are available to the app and no type checks break.
7. **Wire up the new data service** (or Supabase RPCs) inside the React Native app and verify filtered queries return the expected payloads.
8. **Update frontend components** and run E2E smoke tests for colour browsing, selection, and saved-look creation.
9. **QA:** cross-check sample shades from each brand (including multi-system duplicates like OPI “Bubble Bath”) to confirm variants appear under all relevant product lines and saving a look retains the correct metadata.

---

## 8. Documentation & Handover
- Add instructions to `docs/database_update_summary.md` referencing this implementation plan once the schema changes land.
- Document the ETL command usage (inputs, environment variables) and any brand-specific mapping overrides.
- Update onboarding docs (`docs/master-implementation-plan.md` or `docs/nail-app-implementation-plan.md`) with a high-level note about the brand-aware colour system.

---

## 9. Gemini Integration & Backward Compatibility
- Update the Gemini service used by the mobile app (`nail-app-mobile/lib/geminiService.ts`) so the `transformNailsWithGemini` request accepts the expanded finish set: `glossy`, `matte`, `chrome`, `shimmer`, `glitter`, `cream`, `sheer`, `pearl`, `creme`, `metallic`, `magnetic`, `reflective` (include any other textures surfaced during ETL).
- When building the prompt (see `generateTransformationPrompt` in `lib/geminiService.ts` or equivalent), append short descriptions for each finish (e.g., `Style: sheer — semi-transparent, soft gloss`) to guide Gemini toward accurate rendering.
- Ensure the selected colour payload passed from `screens/ProcessingScreen.tsx` into `transformNailsWithGemini` carries the new finish string while still including the legacy `colorHex`/`colorName`.
- Keep existing Supabase columns (`colors.hex_code`, `nail_tries.color_hex`, `color_name`, `color_brand`) untouched; add `color_variant_id`, `product_line`, `shade_code`, `collection`, `swatch_url` as nullable columns so current saves continue to work.
- Supabase SQL functions referencing `color_hex` (e.g., `supabase/04_functions.sql:107-166`) should remain valid; extend them cautiously if variant-aware analytics are required.
- QA: after migrations, run an end-to-end transformation in the Expo app, verify the prompt includes the enhanced finish description, and confirm the saved look stores both legacy and new metadata.

## 10. Open Questions to Resolve Before Build
1. Should multiple variants with the same hex share one `colors` name or do we prefer per-brand naming? (Impacts `colors.name` updates.)
2. Do we need to track inventory/availability flags per variant? If yes, extend `color_variants` with `is_available` sourced from CSVs.
3. Which brand’s variant should become the `primary_variant_id` when multiple exist for the same hex? Define a deterministic rule (e.g., prefer the brand currently selected by the user).

Answer these, then proceed with migrations and ETL implementation.
