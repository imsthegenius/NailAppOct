# Design Screen Colour Category Normalisation Plan

## Background

While aligning the Design screen with the latest Figma mock we discovered that the colour category data in Supabase is inconsistent across brands. The UI is currently wired to a placeholder set of categories (`reds`, `pinks`, `pastels`, etc.). When those values are applied to the live catalog:

- Some brands (notably CND, OPI, and The GelBottle Inc.) primarily expose the `trending` category, so selecting `reds` or `pinks` returns zero shades in the redesign.
- Other brands (Chanel, Dior, YSL, etc.) already store rich categories, but we are not surfacing them, which makes the grid go empty when these brands are chosen.
- The “All” view is inconsistent because each brand contributes a different taxonomy, so the chip row does not represent the catalog accurately.

To quantify the problem we ran this SQL query on the `colors` table (2025‑09‑25 snapshot):

```sql
WITH counts AS (
  SELECT
    brand,
    category,
    COUNT(*) AS shade_count
  FROM colors
  WHERE category IS NOT NULL AND category <> ''
  GROUP BY brand, category
),
ranked AS (
  SELECT
    brand,
    category,
    shade_count,
    ROW_NUMBER() OVER (
      PARTITION BY brand
      ORDER BY
        CASE
          WHEN LOWER(category) IN ('pinks','nudes','pastels','pales','french','trending') THEN 0
          ELSE 1
        END,
        shade_count DESC,
        LOWER(category)
    ) AS display_order
  FROM counts
)
SELECT
  brand,
  category,
  shade_count,
  display_order
FROM ranked
ORDER BY brand, display_order;
```

Key excerpts from the result:

| brand | category | shade_count | display_order |
|-------|----------|-------------|----------------|
| CND | **trending** | 509 | 1 |
| OPI | **trending** | 220 | 1 |
| OPI | nudes | 23 | 2 |
| Chanel | nudes | 22 | 1 |
| Dior | nudes | 23 | 1 |
| Sally Hansen | nudes | 20 | 1 |
| The GelBottle Inc. | **trending** | 160 | 1 |

This output shows that several brands only expose a single category (`trending`) while others have richer data that we currently ignore. As a result, the new Figma layout cannot be implemented without a consistent taxonomy.

### Current data snapshot (key findings)

- `trending` dominates the dataset: 889 shades across CND, OPI, and The GelBottle Inc.
- Richly categorised brands (Chanel, Dior, YSL, Sally Hansen, etc.) retain nuanced buckets (nudes, pinks, blues, metallics, etc.).
- “Trending 2025” is a curated collection with balanced categories and should be preserved.
- There are **0** rows with missing categories; all colours can be remapped without null fill work.

## Objective

Normalise colour categories across brands so the Design screen can:

- Present accurate brand-specific chip rows.
- Keep the “All” view aligned with a shared set of core categories (reds, pinks, nudes, pastels, creams, metallics, etc.).
- Treat `trending` as a proper category without blanking out the swatch grid.

## Plan

1. **Audit existing data** *(DONE 2025‑09‑25)*
   - Re-run the distinct category query after every data change.
   - Flag brands that only surface `trending` (currently CND, OPI, TGB need reclassification).
   - Identify duplicate/alias brands (e.g. “Trending 2025”) that should be treated as collections rather than first-class brands.

2. **Stage source truth** *(IN PROGRESS — staging table shipped via `39_color_category_normalization.sql`)*
   - Load authoritative CSVs (`tgb_color_categories.csv`, `opi_full_uk_catalog.csv`, `cnd_full_uk_catalog.csv`, etc.) into the new `color_category_source_stage` table for comparison.
   - Document each brand’s intended category list from the source data.

3. **Define the unified taxonomy**
   - Lock the global category set used in the Figma design (reds, pinks, nudes, pastels, creams, metallics, burgundy, darks, greens, blues, purples, french, etc.).
   - Introduce a canonical palette mapping (HSL thresholds + finish overrides) so any uncategorised colour can be slotted automatically. *(Implemented in `color_palette_rules` within the new SQL.)*
   - Decide `trending` treatment: migrate away from `category='trending'` and instead add an `is_trending` flag while preserving “Trending 2025” as a curated collection. *(Handled in the SQL by promoting the flag and blocking leftover `trending` rows.)*

4. **Update the database**
   - Create a reference table (e.g. `color_category_map`) with `brand`, `source_category`, `canonical_category`, and `display_order`. *(Delivered with default + alias mappings.)*
   - Write migration scripts that normalise existing `colors.category` values, stripping the legacy `trending` buckets and backfilling canonical categories using staged CSV mappings or HSL rules. *(The SQL recomputes categories via map + palette rules and aborts if `trending` persists.)*
   - Add an `is_trending` boolean (or similar) and backfill it for any collection that should surface in the Trending chip. *(New `is_trending` column populated during the update.)*
   - Ensure ingestion pipelines use the canonical mapping so new rows land in the correct category.

5. **QA and sign-off**
   - Re-run the audit query to confirm each brand now has the expected mix of categories and no rows revert to `trending`. *(The SQL exposes `color_category_distribution` + `color_category_overview` for this check.)*
   - Spot-check individual shades to verify the new labels align visually.
   - Document any intentional deviations (e.g. if a brand keeps custom categories by design).

6. **Integrate with the app UI**
   - Update the Design screen to fetch brand-specific categories from the canonical mapping table and `is_trending` flag.
   - Regenerate the chip rows when the user switches brands and filter results using the new canonical categories.
   - Keep the grid populated for all combinations of brand + category, treat `trending` as an opt-in chip, and honour the curated “Trending 2025” set.

## Next Actions

- Load the brand CSVs into `color_category_source_stage` and extend `color_category_map` with any brand-specific overrides surfaced during review.
- Run `39_color_category_normalization.sql` in Supabase (after taking a snapshot) and capture before/after counts from the QA views.
- Validate ingestion scripts so every new colour writes `canonical_category` + `is_trending` correctly (consider automated tests around `color_palette_rules`).
- Once the data is clean, proceed with the React Native wiring to match the Figma design.

This document captures the rationale and plan so future engineers (or future me) understand why the UI work paused here and what needs to happen before continuing.
