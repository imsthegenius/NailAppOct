# Database Update Summary

This repository now has **three** data export pipelines for colour catalogues. Use this document as the single source of truth when you (future me) need to refresh or extend the datasets.

---

## 1. OPI (UK Shellac equivalent) – `opi_full_uk_catalog.csv`

**Script:** `scrape_opi_uk.py`

**Sources**
- Shopify storefront endpoints on `opi.com` (UK slug `/en-GB/`). The script pulls the sitemap, enumerates PDP URLs, and uses Playwright to render each page so we can extract titles, system references (Nail Lacquer / Infinite Shine / GelColor), and swatch imagery. Swatches are downloaded to compute average colour hex values.

**Output schema**
- `Brand` (`OPI`)
- `ProductType` (`Nail Lacquer`, `Infinite Shine`, `GelColor`)*
- `Collection` (parsed from badge/label text)
- `ShadeCode` (first matching SKU-style code near “Shade Code”/“SKU” labels)
- `ShadeName`, `ProductURL`, `SwatchImageURL`, `ApproxHex`

**Refresh**
```bash
source .venv/bin/activate
python scrape_opi_uk.py
```

**Notes**
- The official UK PDPs have limited variant metadata; GelColor PDPs often list only marketing copy without discrete variants. If the GelColor slug stops returning content, switch to the supported retailer feed or update the Playwright heuristics accordingly.

---

## 2. CND (Shellac + Vinylux) – `cnd_full_uk_catalog.csv`

**Script:** `scrape_cnd_uk.py`

**Where the data comes from**
- **Shellac:** JK London UK distributor (`https://www.jklondon.com/collections/cnd-shellac`). We pull their Shopify JSON, filter out non-colour items (base/top coats, bundles, tools) using title/product-type heuristics, and keep the SKU for each shade.
- **Vinylux:** LoveCND UK consumer store (`https://lovecnd.com/collections/colours`). The feed lists all Vinylux shades; the script skips top coats/care/bundle SKUs via title/tag checks.

**Output schema**
- `Brand` (`CND`)
- `ProductType` (`Shellac` or `Vinylux`)
- `Collection` (best-effort: derived from Shopify tags containing “collection” or “All …” tags)
- `ShadeName` (title cleaned of marketing suffixes, size, etc.)
- `ShadeCode` (SKU per variant; guaranteed non-empty for these feeds)
- `ProductURL` (JK London or LoveCND PDP)
- `SwatchImageURL` (variant image first, fallback to product image)
- `ApproxHex` (central mean colour after masking transparent/white pixels)

**Politeness and resilience**
- 1 request every ~0.4s; Tenacity retry with exponential jitter; periodic CSV snapshots every 100 rows.

**To refresh**
```bash
source .venv/bin/activate
python scrape_cnd_uk.py
```
(Ensure the venv has `playwright beautifulsoup4 requests pillow numpy pandas tenacity tqdm`; Chromium is not required for this script – it relies on `requests` only.)

**Known limitations**
- JK London occasionally lists pro-only SKUs at GBP zero; positive price filter keeps those out but re-check if the distributor changes listing structure.
- If CND add new seasonal tags that don’t contain “collection”, collection detection may miss them.

---

## 3. The GelBottle Inc. (GelColor + BIAB) – `tgb_full_catalog.csv`

**Script:** `scrape_tgb.py`

**Sources**
- Bloomreach catalogue API from the public storefront (`https://core.dxpapi.com/api/v1/core/`), using category query `217` for GelColor and `212` for BIAB. We request 200 products per page, filter by price (< £40) and the Bloomreach `texture` metadata to discard pro-only or non-shade items.

**Output schema**
- `Brand` (`The GelBottle Inc.`)
- `Product Type` (`GelColor` or `BIAB`)
- `Collection` (derived from URL path segments when available; most shades remain blank because TGB doesn’t expose seasonal metadata in the catalog feed)
- `Category` (Bloomreach “texture”: Magnetic, Shimmery, Standard, etc.)
- `Shade Name` (product title cleaned of variants/suffixes)
- `ApproxHex` (same central-mean calculation as CND)
- `ProductURL`, `SwatchURL`

**Refresh steps**
```bash
source .venv/bin/activate
python scrape_tgb.py
```

**Notes**
- The feed includes some pro-only items marked by high price or `pro_only` flag; filtering keeps consumer shades only.
- GelColor entries often ship stale marketing/chip images; monitor for CDN 404s in `errors.log` after running the script.

---

## Supporting files
- `docs/database_update_summary.md` (this document)
- `errors.log` (shared by both scripts; review after each run and clear if needed)
- `nail-app-mobile/scripts/sync_color_catalog.py` (combined ETL entry point; see below)

## General workflow
1. Activate the existing `.venv` and ensure dependencies are current.
2. Run the individual scrapers if you need to refresh CSVs (see sections above).
3. When ready to push data into Supabase, execute the consolidated sync script:
   ```bash
   cd nail-app-mobile
   python scripts/sync_color_catalog.py \
     --opi ../opi_full_uk_catalog.csv \
     --cnd ../cnd_full_uk_catalog.csv \
     --tgb ../tgb_full_catalog.csv
   ```
   The script requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment.
4. Review the log output for insert/upsert counts and verify no rows were skipped for invalid hex codes.
5. Spot-check the updated Supabase tables (`colors`, `color_variants`) along with the `color_catalog_entries` view.
6. Regenerate mobile Supabase types after migrations run:
   ```bash
   cd nail-app-mobile
   supabase gen types typescript --project-config ./supabase/config.toml > types/supabase.ts
   ```
   (Adjust the `--project-config` path if your Supabase CLI config lives elsewhere.)
7. Commit updated CSVs together with any script changes (if you tweak heuristics, document them here).

## Future improvements (if required)
- **CND collections:** refine the `derive_collection` heuristics once storefront tags expose seasonal names reliably.
- **GelBottle collections:** trace category metadata deeper (if Bloomreach starts surfacing structured collection IDs) to populate collection names.
- **Automation:** consider wrapping both scripts in a single CLI entry point when adding more brands, so you can re-run everything with one command.

Happy data wrangling!
