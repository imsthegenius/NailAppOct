# Color Categorization System

This document captures the end-to-end logic that drives colour filtering in the Nail App as of commit `69b1b688` (2025-09-25). It covers the Supabase data model, the normalisation pipeline, and the way the mobile client consumes that data for the Design screen.

---

## Canonical Taxonomy

We standardise every shade into the following canonical categories:

`nudes`, `pinks`, `reds`, `burgundy`, `pastels`, `blues`, `greens`, `purples`, `metallics`, `darks`, `french`

- These values are enforced by the `colors_category_check` and `canonical_category_check` constraints on `public.colors`.
- A boolean `is_trending` flag indicates whether a shade should surface in the “Trending” filter. The only rows set to `TRUE` by default are the curated *Trending 2025* collection; legacy `category = 'trending'` labels were removed and converted into canonical categories.

---

## Supabase Pipeline (`supabase/39_color_category_normalization.sql`)

This script is idempotent and safe to re-run after CSV imports. It performs the following steps:

1. **Stage raw category data**
   - `color_category_source_stage` captures rows ingested from CSVs (e.g., `tgb_color_categories.csv`, `opi_full_uk_catalog.csv`).
   - Useful for audit diffs between source labels and canonical outcomes.

2. **Explicit brand/category mappings**
   - `color_category_map` stores brand-specific aliases (`brand`, `source_category`, `canonical_category`, `priority`).
   - Defaults include global identity mappings plus common aliases (`neutrals → nudes`, `pales → pastels`, `sheers → french`). Lower priority numbers win.

3. **HSL/finish fallback rules**
   - `color_palette_rules` captures heuristics when no explicit mapping exists. Each rule can define hue ranges (with wrap-around support), saturation/lightness bands, and optional finish overrides.
   - Key rules:
     - Metallic finishes (`chrome`, `glitter`, `shimmer`) override everything else.
     - Near-white, low-saturation shades become `french`.
     - Pastels are light with low saturation; nudes cover warm/low-sat neutrals.
     - Hue ranges map to blues/greens/purples/pinks/reds/burgundy. Deep low-lightness values fall back to `darks`.

4. **Augment `colors` table**
   - Adds `canonical_category`, `canonical_category_source`, `is_trending`, `category_normalized_at` columns if missing.
   - Recomputes HSL values for any row lacking `hue`, `saturation`, or `lightness`.

5. **Derive canonical category per row**
   - Order of precedence per colour:
     1. Brand-specific mapping in `color_category_map`.
     2. First matching palette rule in `color_palette_rules` ordered by priority.
     3. Fallback to `nudes`.
   - `canonical_category_source` stores provenance (`map:*`, `rule`, or `fallback:nudes`).
   - `category` column is overwritten with the canonical value, `is_trending` is set if the row previously had `category = 'trending'` or belongs to *Trending 2025*.
   - A guard raises an exception if any row still has `category = 'trending'` after normalisation.

6. **Display order & constraints**
   - `display_order` is recalculated within each category from lightest to darkest (based on `lightness`, then `hue`).
   - Constraints on `category` / `canonical_category` are recreated and validated to enforce the canonical set.

7. **QA views**
   - `color_category_distribution` (brand × canonical category counts).
   - `color_category_overview` (global counts + `is_trending` breakdown).
   - `color_category_anomalies` (rows missing canonical data or HSL metrics).

8. **Post-run**
   - To reset trending to only the curated collection, run:
     ```sql
     UPDATE colors SET is_trending = FALSE;
     UPDATE colors SET is_trending = TRUE WHERE LOWER(brand) = 'trending 2025';
     ```

---

## Catalogue View (`supabase/40_color_variants.sql`)

This script builds the data exposed to the mobile app:

- `color_variants` table tracks brand-specific variants (product line, finish overrides, swatch/product URLs).
- `color_catalog_entries` **view** joins `color_variants` to `colors` and exposes:
  - `color_variant_id`, `color_id`, `hex_code`, `color_name`, `brand`, `product_line`, `shade_code`, `collection`, `resolved_finish`.
  - Canonical fields: `category` (same as `canonical_category`), `canonical_category`, `is_trending`, `display_order`, HSL columns, `trending_score`.
  - `is_active` flag is respected to hide retired variants.
- A helper `refresh_hex_categorization()` is included to rebuild HSL metrics and rule-based categories after large data loads. Only `service_role` may execute it.
- RLS policies allow read access for `authenticated` and `anon` roles; modifications require `service_role`.

> **Important**: `color_catalog_entries` is dropped and recreated in the script to guarantee column order (required once we added `canonical_category`/`is_trending`). Re-run the script whenever Supabase needs to pick up schema changes.

---

## Mobile Client Consumption (`src/services/colorCatalog.ts`)

### Data Access

- `fetchColorCatalog(filters, page, pageSize)` hits `color_catalog_entries` with:
  - `brand`, `product_line`, `collection`, `resolved_finish`, `category`, `hasSwatch`, `search` filters.
  - Trending filter sets `is_trending = TRUE`.
  - Paginates via `.range()` and orders by `display_order`, then `variant_created_at`.
  - Maps Supabase rows to `ColorCatalogEntry`, exposing `canonicalCategory` and `isTrending` to the UI.

- `fetchCategorySummaries(brand?)` reads from `color_category_distribution`:
  - When a `brand` is provided, returns the canonical buckets that brand actually supports.
  - Without a brand, aggregates totals across all brands (used for the “All” view).

### Design Screen (`screens/DesignScreen.tsx`)

- Maintains a primary filter (`All`, `Trending`, or a specific brand). “Trending” routes queries through `is_trending` and resets `category` to `All`.
- Uses `fetchCategorySummaries` to build the horizontal chip list dynamically:
  - Always shows an “All” chip first.
  - Chips only render for categories reported in the summary; if the brand doesn’t expose a bucket, it disappears automatically.
  - Chips are ordered by the canonical sequence (`nudes → ... → french`), with extra categories (if any) appended alphabetically.
- Swatch colours come from `CATEGORY_METADATA`:
  - `reds`: `#B3261E`, `pinks`: `#F2A7C2`, `burgundy`: `#60203B`, `pastels`: `#E6D7F2`, `blues`: `#4A68A1`, `greens`: `#3F7F5F`, `purples`: `#6B50A7`, `metallics`: `#C8B987`, `darks`: `#2B2B33`, `french`: `#F7F4F0`, `nudes`: `#D6BFA8`.
- When a category is selected, the client adds `category = <canonical value>` to the Supabase query; selecting “All” clears it.
- The colour grid itself always comes from `fetchColorCatalog`, which honours the canonical `category` and brand filters.

---

## Operational Checklist

1. **After ingesting new CSVs**
   - Load rows into `color_category_source_stage`.
   - Extend `color_category_map` with any brand-specific overrides found in the new data.
   - Run `supabase/39_color_category_normalization.sql` followed by `supabase/40_color_variants.sql`.
   - Reset `is_trending` to only curated sets if needed.

2. **QA**
   - `SELECT * FROM color_category_distribution ORDER BY brand, canonical_category;`
   - `SELECT * FROM color_category_overview;`
   - `SELECT * FROM color_category_anomalies LIMIT 20;`

3. **Mobile verification**
   - Trigger `fetchCategorySummaries` in the app (switch between “All” and each brand) to confirm chips populate correctly.
   - Use the “Trending” primary filter and ensure results match Supabase totals (`SELECT COUNT(*) FROM color_catalog_entries WHERE is_trending;`).

---

## Future Enhancements

- Automate seeding of `color_category_map` from staged CSVs (currently manual).
- Persist category display metadata (label and swatch colour) in Supabase instead of hardcoding in the client.
- Expand QA views to surface percentage coverage per brand/category and identify gaps early.
- Consider an admin UI for adjusting brand/category priority without editing SQL directly.

This document should provide enough context for future engineers to understand how colour categories are derived, enforced, and consumed throughout the stack. Reach out to the Supabase schema owner before altering the canonical list.
