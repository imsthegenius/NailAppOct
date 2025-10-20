-- ============================================================================
-- Color Variants & Metadata Expansion
-- File: 40_color_variants.sql
-- Purpose:
--   - Introduce per-brand color variants tied to base colors
--   - Expand finish vocabulary in the colors table
--   - Extend nail_tries and saved_looks to store variant metadata
--   - Provide a helper function to rerun hex-based categorisation after ETL
-- ============================================================================

-- 1) Align finish vocabulary with canonical set
ALTER TABLE colors
  DROP CONSTRAINT IF EXISTS colors_finish_check;

ALTER TABLE colors
  ADD CONSTRAINT colors_finish_check
  CHECK (
    finish IS NULL OR finish IN (
      'glossy',
      'cream',
      'matte',
      'chrome',
      'shimmer',
      'glitter',
      'metallic',
      'sheer',
      'pearl',
      'magnetic',
      'reflective'
    )
  );

-- Ensure supporting columns from earlier scripts exist on fresh databases
ALTER TABLE colors ADD COLUMN IF NOT EXISTS hue NUMERIC;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS saturation NUMERIC;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS lightness NUMERIC;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS display_order INT;

-- 2) Brand-aware variant table
CREATE TABLE IF NOT EXISTS color_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  product_line TEXT NOT NULL,
  shade_name TEXT NOT NULL,
  shade_code TEXT,
  collection TEXT,
  finish_override TEXT CHECK (
    finish_override IS NULL OR finish_override IN (
      'glossy',
      'cream',
      'matte',
      'chrome',
      'shimmer',
      'glitter',
      'metallic',
      'sheer',
      'pearl',
      'magnetic',
      'reflective'
    )
  ),
  product_url TEXT,
  swatch_url TEXT,
  source_catalog TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT color_variants_unique UNIQUE NULLS NOT DISTINCT (
    color_id,
    brand,
    product_line,
    shade_name,
    shade_code
  )
);

CREATE INDEX IF NOT EXISTS color_variants_color_id_idx
  ON color_variants (color_id);

CREATE INDEX IF NOT EXISTS color_variants_brand_line_idx
  ON color_variants (brand, product_line);

CREATE INDEX IF NOT EXISTS color_variants_source_idx
  ON color_variants (source_catalog);

CREATE INDEX IF NOT EXISTS color_variants_active_idx
  ON color_variants (is_active);

-- Helper trigger to keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_color_variants_updated_at ON color_variants;
CREATE TRIGGER set_color_variants_updated_at
  BEFORE UPDATE ON color_variants
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 3) Extend colors with primary variant pointer and lineage
ALTER TABLE colors
  ADD COLUMN IF NOT EXISTS primary_variant_id UUID REFERENCES color_variants(id);

ALTER TABLE colors
  ADD COLUMN IF NOT EXISTS source_priority TEXT;

-- 4) Extend nail_tries with variant metadata
ALTER TABLE nail_tries
  ADD COLUMN IF NOT EXISTS color_variant_id UUID REFERENCES color_variants(id);

ALTER TABLE nail_tries
  ADD COLUMN IF NOT EXISTS product_line TEXT;

ALTER TABLE nail_tries
  ADD COLUMN IF NOT EXISTS shade_code TEXT;

ALTER TABLE nail_tries
  ADD COLUMN IF NOT EXISTS collection TEXT;

ALTER TABLE nail_tries
  ADD COLUMN IF NOT EXISTS swatch_url TEXT;

ALTER TABLE nail_tries
  ADD COLUMN IF NOT EXISTS color_finish TEXT CHECK (
    color_finish IS NULL OR color_finish IN (
      'glossy',
      'cream',
      'matte',
      'chrome',
      'shimmer',
      'glitter',
      'metallic',
      'sheer',
      'pearl',
      'magnetic',
      'reflective'
    )
  );

ALTER TABLE nail_tries
  ADD COLUMN IF NOT EXISTS source_catalog TEXT;

-- 5) Extend saved_looks with variant metadata
ALTER TABLE saved_looks
  ADD COLUMN IF NOT EXISTS color_variant_id UUID REFERENCES color_variants(id);

ALTER TABLE saved_looks
  ADD COLUMN IF NOT EXISTS color_brand TEXT;

ALTER TABLE saved_looks
  ADD COLUMN IF NOT EXISTS product_line TEXT;

ALTER TABLE saved_looks
  ADD COLUMN IF NOT EXISTS shade_code TEXT;

ALTER TABLE saved_looks
  ADD COLUMN IF NOT EXISTS collection TEXT;

ALTER TABLE saved_looks
  ADD COLUMN IF NOT EXISTS swatch_url TEXT;

ALTER TABLE saved_looks
  ADD COLUMN IF NOT EXISTS color_finish TEXT CHECK (
    color_finish IS NULL OR color_finish IN (
      'glossy',
      'cream',
      'matte',
      'chrome',
      'shimmer',
      'glitter',
      'metallic',
      'sheer',
      'pearl',
      'magnetic',
      'reflective'
    )
  );

ALTER TABLE saved_looks
  ADD COLUMN IF NOT EXISTS source_catalog TEXT;

-- 6) View to simplify Supabase queries for catalog browsing
DROP VIEW IF EXISTS color_catalog_entries;

CREATE VIEW color_catalog_entries AS
SELECT
  cv.id AS color_variant_id,
  c.id AS color_id,
  c.hex_code,
  c.name AS color_name,
  c.brand AS fallback_brand,
  c.category,
  c.canonical_category,
  c.is_trending,
  c.finish AS base_finish,
  cv.finish_override,
  COALESCE(cv.finish_override, c.finish) AS resolved_finish,
  cv.brand,
  cv.product_line,
  cv.shade_name,
  cv.shade_code,
  cv.collection,
  cv.product_url,
  cv.swatch_url,
  cv.source_catalog,
  cv.is_active,
  c.display_order,
  c.trending_score,
  c.hue,
  c.saturation,
  c.lightness,
  c.primary_variant_id,
  c.source_priority,
  c.created_at,
  c.updated_at,
  cv.created_at AS variant_created_at,
  cv.updated_at AS variant_updated_at
FROM color_variants cv
JOIN colors c ON c.id = cv.color_id;

-- 7) Hex categorisation helper (wraps 32 & 33 scripts)
CREATE OR REPLACE FUNCTION refresh_hex_categorization()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recompute HSL metrics
  WITH rgb AS (
    SELECT
      hex_code,
      (get_byte(decode(substr(hex_code, 2), 'hex'), 0))::float / 255.0 AS r,
      (get_byte(decode(substr(hex_code, 2), 'hex'), 1))::float / 255.0 AS g,
      (get_byte(decode(substr(hex_code, 2), 'hex'), 2))::float / 255.0 AS b
    FROM colors
  ),
  ext AS (
    SELECT
      hex_code,
      r,
      g,
      b,
      GREATEST(r, g, b) AS maxc,
      LEAST(r, g, b) AS minc
    FROM rgb
  ),
  hsl AS (
    SELECT
      hex_code,
      r,
      g,
      b,
      maxc,
      minc,
      (maxc + minc) / 2.0 AS l,
      (maxc - minc) AS d
    FROM ext
  ),
  hsl2 AS (
    SELECT
      hex_code,
      r,
      g,
      b,
      maxc,
      minc,
      l,
      d,
      CASE
        WHEN d = 0 THEN 0
        WHEN maxc = r THEN ((g - b) / NULLIF(d, 0)) * 60.0
        WHEN maxc = g THEN ((b - r) / NULLIF(d, 0)) * 60.0 + 120.0
        ELSE ((r - g) / NULLIF(d, 0)) * 60.0 + 240.0
      END AS h_raw,
      CASE WHEN d = 0 THEN 0 ELSE d / NULLIF(1.0 - abs(2 * l - 1), 0) END AS s_raw
    FROM hsl
  ),
  norm AS (
    SELECT
      hex_code,
      (CASE WHEN h_raw < 0 THEN h_raw + 360 ELSE h_raw END) AS h,
      GREATEST(0, LEAST(1, s_raw)) AS s,
      GREATEST(0, LEAST(1, l)) AS l
    FROM hsl2
  )
  UPDATE colors c
  SET hue = n.h,
      saturation = n.s,
      lightness = n.l
  FROM norm n
  WHERE c.hex_code = n.hex_code;

  -- Reapply hex-only category rules (32_hex_only_categorization)
  WITH metallic_hexes AS (
    SELECT hex_code FROM colors WHERE hex_code IN (
      '#FFD700', '#D4AF37', '#DAA520', '#F0E130', '#B8860B', '#996515',
      '#C0C0C0', '#A8A9AD', '#B2BEB5', '#E5E4E2',
      '#B87333', '#CD7F32', '#CC7722'
    )
  )
  UPDATE colors c
  SET category = CASE
    WHEN EXISTS (SELECT 1 FROM metallic_hexes mh WHERE mh.hex_code = c.hex_code) THEN 'metallics'
    WHEN lightness <= 0.25 THEN 'darks'
    WHEN lightness >= 0.90 AND saturation <= 0.18 THEN 'french'
    WHEN lightness >= 0.80 AND saturation <= 0.45 THEN 'pastels'
    WHEN hue BETWEEN 15 AND 60 AND saturation <= 0.60 AND lightness BETWEEN 0.45 AND 0.88 THEN 'nudes'
    WHEN saturation BETWEEN 0.05 AND 0.25 AND lightness BETWEEN 0.45 AND 0.75 THEN 'nudes'
    WHEN hue BETWEEN 185 AND 255 THEN 'blues'
    WHEN hue BETWEEN 60 AND 180 THEN 'greens'
    WHEN hue BETWEEN 260 AND 330 THEN 'purples'
    WHEN (hue >= 330 OR hue < 20) AND saturation >= 0.45 AND lightness >= 0.60 THEN 'pinks'
    WHEN (hue >= 350 OR hue < 20) AND saturation >= 0.55 AND lightness BETWEEN 0.35 AND 0.65 THEN 'reds'
    WHEN (hue >= 330 OR hue < 20 OR hue BETWEEN 320 AND 340) AND lightness < 0.35 THEN 'burgundy'
    WHEN saturation >= 0.65 AND lightness BETWEEN 0.35 AND 0.75 AND (hue BETWEEN 185 AND 255) THEN 'blues'
    WHEN saturation >= 0.65 AND lightness BETWEEN 0.35 AND 0.75 AND (hue BETWEEN 60 AND 180) THEN 'greens'
    WHEN saturation >= 0.65 AND lightness BETWEEN 0.35 AND 0.75 AND (hue BETWEEN 260 AND 330) THEN 'purples'
    WHEN saturation >= 0.65 AND lightness BETWEEN 0.35 AND 0.75 AND (hue >= 350 OR hue < 20) THEN 'reds'
    ELSE 'nudes'
  END;

  -- Display order (light → dark per family)
  WITH ordered AS (
    SELECT
      hex_code,
      row_number() OVER (PARTITION BY category ORDER BY lightness DESC, hue NULLS LAST) AS ord
    FROM colors
  )
  UPDATE colors c
  SET display_order = o.ord
  FROM ordered o
  WHERE c.hex_code = o.hex_code;

  -- Refinements from 33_refine_hex_rules.sql
  WITH metrics AS (
    SELECT
      hex_code,
      hue,
      saturation,
      lightness,
      (saturation * (1 - abs(2 * lightness - 1)))::numeric AS chroma
    FROM colors
  ),
  french_fix AS (
    UPDATE colors c
    SET category = 'french'
    FROM metrics m
    WHERE c.hex_code = m.hex_code
      AND (
        (m.lightness >= 0.94 AND m.chroma <= 0.12) OR
        (m.lightness >= 0.90 AND m.chroma <= 0.06)
      )
    RETURNING c.hex_code
  ),
  french_whitelist AS (
    UPDATE colors
    SET category = 'french'
    WHERE hex_code IN (
      '#FFFFFF', '#FFFAFA', '#F8F8FF', '#FFF8DC', '#FFFAF0', '#FFF5EE', '#FFF5F5',
      '#FFFDFA', '#FFFDF5', '#F5F5F5', '#FAEBD7', '#F0F8FF', '#FFF0F5'
    )
    RETURNING hex_code
  ),
  pastels_fix AS (
    UPDATE colors c
    SET category = 'pastels'
    FROM metrics m
    WHERE c.hex_code = m.hex_code
      AND m.lightness >= 0.80
      AND m.chroma > 0.06 AND m.chroma <= 0.40
      AND c.category <> 'french'
    RETURNING c.hex_code
  ),
  nudes_fix AS (
    UPDATE colors c
    SET category = 'nudes'
    FROM metrics m
    WHERE c.hex_code = m.hex_code
      AND (
        (m.hue BETWEEN 15 AND 60 AND m.chroma <= 0.40 AND m.lightness BETWEEN 0.45 AND 0.88)
        OR (m.chroma <= 0.18 AND m.lightness BETWEEN 0.45 AND 0.78)
      )
      AND c.category NOT IN ('french', 'pastels')
    RETURNING c.hex_code
  ),
  family_balance AS (
    UPDATE colors c
    SET category = CASE
      WHEN m.hue BETWEEN 185 AND 255 AND m.chroma > 0.12 AND m.lightness < 0.92 THEN 'blues'
      WHEN m.hue BETWEEN 60 AND 180 AND m.chroma > 0.12 AND m.lightness < 0.92 THEN 'greens'
      WHEN m.hue BETWEEN 260 AND 330 AND m.chroma > 0.12 AND m.lightness < 0.92 THEN 'purples'
      ELSE c.category
    END
    FROM metrics m
    WHERE c.hex_code = m.hex_code
      AND c.category NOT IN ('french', 'pastels', 'nudes')
    RETURNING c.hex_code
  )
  UPDATE colors c
  SET display_order = o.ord
  FROM (
    SELECT
      hex_code,
      row_number() OVER (PARTITION BY category ORDER BY lightness DESC, hue NULLS LAST) AS ord
    FROM colors
  ) o
  WHERE c.hex_code = o.hex_code;
END;
$$;

REVOKE EXECUTE ON FUNCTION refresh_hex_categorization() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION refresh_hex_categorization() TO service_role;

-- 8) RLS policies for color_variants (readable to all app clients)
ALTER TABLE color_variants ENABLE ROW LEVEL SECURITY;

DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'color_variants'
      AND policyname = 'Color variants readable'
  ) THEN
    CREATE POLICY "Color variants readable"
    ON color_variants
    FOR SELECT
    TO authenticated, anon
    USING (true);
  END IF;
END;
$policy$;

DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'color_variants'
      AND policyname = 'Color variants modifiable by service role'
  ) THEN
    CREATE POLICY "Color variants modifiable by service role"
    ON color_variants
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
  END IF;
END;
$policy$;

-- Run once so schema migrations leave data consistent
SELECT refresh_hex_categorization();

-- Success message for easier debugging in Supabase UI
DO $notice$
BEGIN
  RAISE NOTICE 'Color variant infrastructure successfully installed.';
END;
$notice$;
