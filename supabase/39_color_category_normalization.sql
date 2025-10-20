-- ============================================================================
-- Color Category Normalization
-- File: 39_color_category_normalization.sql
-- Purpose:
--   * Provide staging structures for reference CSV/category imports.
--   * Define canonical mapping tables + palette rules.
--   * Add canonical category/is_trending columns to `colors`.
--   * Recompute canonical categories, stripping legacy `trending` values.
--   * Expose QA views for ongoing monitoring.
-- Notes:
--   * Safe to re-run. All DDL guarded with IF NOT EXISTS / ON CONFLICT.
--   * Assumes `colors` already contains hue/saturation/lightness columns.
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. Staging table for external source data (e.g. CSV imports)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS color_category_source_stage (
    id            BIGSERIAL PRIMARY KEY,
    source_name   TEXT        NOT NULL,
    brand         TEXT,
    shade_name    TEXT,
    hex_code      TEXT,
    source_category TEXT,
    finish        TEXT,
    payload       JSONB       DEFAULT '{}'::jsonb,
    inserted_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE color_category_source_stage IS
  'Temporary holding table for external CSV/category imports prior to normalization.';
COMMENT ON COLUMN color_category_source_stage.payload IS
  'Raw row payload (optional) for auditing differences between source files and Supabase.';

CREATE INDEX IF NOT EXISTS color_category_source_stage_brand_idx
    ON color_category_source_stage (LOWER(brand));
CREATE INDEX IF NOT EXISTS color_category_source_stage_hex_idx
    ON color_category_source_stage (LOWER(hex_code));

-- --------------------------------------------------------------------------
-- 2. Canonical mapping table (brand + source category => canonical category)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS color_category_map (
    id                  BIGSERIAL PRIMARY KEY,
    brand               TEXT,
    source_category     TEXT NOT NULL,
    canonical_category  TEXT NOT NULL,
    priority            INT  NOT NULL DEFAULT 100,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    brand_key           TEXT GENERATED ALWAYS AS (COALESCE(LOWER(brand), '*')) STORED,
    source_key          TEXT GENERATED ALWAYS AS (LOWER(source_category)) STORED,
    UNIQUE (brand_key, source_key)
);

COMMENT ON TABLE color_category_map IS
  'Brand/category aliases to the canonical taxonomy. Lower priority number wins.';

-- Default identity mappings for the canonical set
INSERT INTO color_category_map (brand, source_category, canonical_category, priority, notes)
VALUES
    (NULL, 'nudes',     'nudes',     10, 'Global default mapping'),
    (NULL, 'pinks',     'pinks',     10, 'Global default mapping'),
    (NULL, 'reds',      'reds',      10, 'Global default mapping'),
    (NULL, 'burgundy',  'burgundy',  10, 'Global default mapping'),
    (NULL, 'pastels',   'pastels',   10, 'Global default mapping'),
    (NULL, 'french',    'french',    10, 'Global default mapping'),
    (NULL, 'blues',     'blues',     10, 'Global default mapping'),
    (NULL, 'greens',    'greens',    10, 'Global default mapping'),
    (NULL, 'purples',   'purples',   10, 'Global default mapping'),
    (NULL, 'metallics', 'metallics', 10, 'Global default mapping'),
    (NULL, 'darks',     'darks',     10, 'Global default mapping'),
    (NULL, 'neutrals',  'nudes',     20, 'Alias: neutrals -> nudes'),
    (NULL, 'creams',    'nudes',     20, 'Alias: creams -> nudes'),
    (NULL, 'pales',     'pastels',   20, 'Alias: pales -> pastels'),
    (NULL, 'sheers',    'french',    20, 'Alias: sheers -> french')
ON CONFLICT (brand_key, source_key)
DO UPDATE SET canonical_category = EXCLUDED.canonical_category,
              priority           = LEAST(color_category_map.priority, EXCLUDED.priority),
              notes              = EXCLUDED.notes;

-- Ensure an index to speed lookups
CREATE INDEX IF NOT EXISTS color_category_map_priority_idx
    ON color_category_map (brand_key, priority);

-- --------------------------------------------------------------------------
-- 3. Palette rules table (HSL/finish driven fallback when no explicit map)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS color_palette_rules (
    id                 BIGSERIAL PRIMARY KEY,
    rule_key           TEXT UNIQUE NOT NULL,
    canonical_category TEXT NOT NULL,
    priority           INT  NOT NULL DEFAULT 100,
    hue_min            NUMERIC,
    hue_max            NUMERIC,
    hue_wrap           BOOLEAN NOT NULL DEFAULT FALSE,
    saturation_min     NUMERIC,
    saturation_max     NUMERIC,
    lightness_min      NUMERIC,
    lightness_max      NUMERIC,
    finish_in          TEXT[],
    description        TEXT,
    active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE color_palette_rules IS
  'Ordered set of HSL/finish heuristics used when no direct mapping exists.';

-- Helper: upsert palette rules
CREATE OR REPLACE FUNCTION upsert_palette_rule(
    p_rule_key           TEXT,
    p_canonical_category TEXT,
    p_priority           INT,
    p_hue_min            NUMERIC,
    p_hue_max            NUMERIC,
    p_hue_wrap           BOOLEAN,
    p_saturation_min     NUMERIC,
    p_saturation_max     NUMERIC,
    p_lightness_min      NUMERIC,
    p_lightness_max      NUMERIC,
    p_finish_in          TEXT[],
    p_description        TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO color_palette_rules (rule_key, canonical_category, priority, hue_min, hue_max, hue_wrap,
                                   saturation_min, saturation_max, lightness_min, lightness_max,
                                   finish_in, description, active)
  VALUES (p_rule_key, p_canonical_category, p_priority, p_hue_min, p_hue_max, p_hue_wrap,
          p_saturation_min, p_saturation_max, p_lightness_min, p_lightness_max,
          p_finish_in, p_description, TRUE)
  ON CONFLICT (rule_key)
  DO UPDATE SET canonical_category = EXCLUDED.canonical_category,
                priority           = EXCLUDED.priority,
                hue_min            = EXCLUDED.hue_min,
                hue_max            = EXCLUDED.hue_max,
                hue_wrap           = EXCLUDED.hue_wrap,
                saturation_min     = EXCLUDED.saturation_min,
                saturation_max     = EXCLUDED.saturation_max,
                lightness_min      = EXCLUDED.lightness_min,
                lightness_max      = EXCLUDED.lightness_max,
                finish_in          = EXCLUDED.finish_in,
                description        = EXCLUDED.description,
                active             = TRUE;
END;
$$ LANGUAGE plpgsql;

SELECT upsert_palette_rule('metallics_finish', 'metallics', 5,
                           NULL, NULL, FALSE,
                           NULL, NULL,
                           NULL, NULL,
                           ARRAY['chrome','glitter','shimmer'],
                           'Any metallic/glitter finish overrides hue.');

SELECT upsert_palette_rule('french_near_white', 'french', 10,
                           NULL, NULL, FALSE,
                           NULL, 0.18,
                           0.90, NULL,
                           NULL,
                           'Milky/near white sheers.');

SELECT upsert_palette_rule('pastels_light_low_sat', 'pastels', 20,
                           NULL, NULL, FALSE,
                           NULL, 0.45,
                           0.80, NULL,
                           NULL,
                           'Soft pastels: light + low saturation.');

SELECT upsert_palette_rule('darks_low_light', 'darks', 20,
                           NULL, NULL, FALSE,
                           NULL, NULL,
                           NULL, 0.28,
                           NULL,
                           'Deep shades with very low lightness.');

SELECT upsert_palette_rule('nudes_warm', 'nudes', 30,
                           15, 60, FALSE,
                           NULL, 0.60,
                           0.40, 0.88,
                           NULL,
                           'Warm beige/neutral tones.');

SELECT upsert_palette_rule('nudes_low_sat', 'nudes', 35,
                           NULL, NULL, FALSE,
                           0.05, 0.28,
                           0.40, 0.78,
                           NULL,
                           'Greige / taupe neutrals.');

SELECT upsert_palette_rule('greens_family', 'greens', 40,
                           60, 180, FALSE,
                           0.12, NULL,
                           0.18, 0.92,
                           NULL,
                           'Green hues across saturation range.');

SELECT upsert_palette_rule('blues_family', 'blues', 40,
                           185, 260, FALSE,
                           0.10, NULL,
                           0.18, 0.92,
                           NULL,
                           'Blue hues across saturation range.');

SELECT upsert_palette_rule('purples_family', 'purples', 45,
                           260, 330, FALSE,
                           0.10, NULL,
                           0.18, 0.92,
                           NULL,
                           'Purple/violet range.');

SELECT upsert_palette_rule('pinks_magenta', 'pinks', 50,
                           300, 350, FALSE,
                           0.35, NULL,
                           0.40, 0.88,
                           NULL,
                           'Magenta and bright pinks.');

SELECT upsert_palette_rule('reds_true', 'reds', 55,
                           350, 20, TRUE,
                           0.45, NULL,
                           0.32, 0.72,
                           NULL,
                           'True reds (wrap hue).');

SELECT upsert_palette_rule('burgundy_deep', 'burgundy', 60,
                           320, 20, TRUE,
                           0.25, NULL,
                           NULL, 0.42,
                           NULL,
                           'Deep red wine tones.');

-- Drop helper to keep schema tidy (idempotent)
DROP FUNCTION IF EXISTS upsert_palette_rule(TEXT,TEXT,INT,NUMERIC,NUMERIC,BOOLEAN,NUMERIC,NUMERIC,NUMERIC,NUMERIC,TEXT[],TEXT);

CREATE INDEX IF NOT EXISTS color_palette_rules_priority_idx
    ON color_palette_rules (priority, canonical_category)
    WHERE active;

-- --------------------------------------------------------------------------
-- 4. Extend colors table with canonical fields / flags
-- --------------------------------------------------------------------------
ALTER TABLE colors
  ADD COLUMN IF NOT EXISTS canonical_category TEXT,
  ADD COLUMN IF NOT EXISTS canonical_category_source TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS category_normalized_at TIMESTAMPTZ;

-- Ensure hue/saturation/lightness columns are populated (recompute when NULL)
WITH targets AS (
  SELECT hex_code
  FROM colors
  WHERE hue IS NULL OR saturation IS NULL OR lightness IS NULL
)
, rgb AS (
  SELECT 
    c.hex_code,
    (get_byte(decode(substr(c.hex_code, 2), 'hex'), 0))::float / 255.0 AS r,
    (get_byte(decode(substr(c.hex_code, 2), 'hex'), 1))::float / 255.0 AS g,
    (get_byte(decode(substr(c.hex_code, 2), 'hex'), 2))::float / 255.0 AS b
  FROM colors c
  WHERE c.hex_code IN (SELECT hex_code FROM targets)
)
, ext AS (
  SELECT hex_code, r, g, b,
         GREATEST(r,g,b) AS maxc,
         LEAST(r,g,b)    AS minc
  FROM rgb
)
, hsl AS (
  SELECT hex_code,
         r, g, b,
         maxc, minc,
         (maxc + minc) / 2.0                       AS l,
         (maxc - minc)                             AS d
  FROM ext
)
, calc AS (
  SELECT 
    hex_code,
    (CASE WHEN d = 0 THEN 0 ELSE d / NULLIF(1.0 - abs(2*l - 1), 0) END) AS s,
    (
      CASE WHEN d = 0 THEN 0
           WHEN maxc = r THEN ((g - b) / NULLIF(d,0)) * 60.0
           WHEN maxc = g THEN ((b - r) / NULLIF(d,0)) * 60.0 + 120.0
           ELSE ((r - g) / NULLIF(d,0)) * 60.0 + 240.0
      END
    ) AS h,
    l
  FROM (
    SELECT c.hex_code, h.r, h.g, h.b, h.maxc, h.minc, h.l, (h.maxc - h.minc) AS d
    FROM hsl h
    JOIN colors c USING (hex_code)
    WHERE h.hex_code IN (SELECT hex_code FROM targets)
  ) z
)
, norm AS (
  SELECT hex_code,
         (CASE WHEN h < 0 THEN h + 360 ELSE h END) AS hue,
         GREATEST(0, LEAST(1, s)) AS saturation,
         GREATEST(0, LEAST(1, l)) AS lightness
  FROM calc
)
UPDATE colors c
SET hue        = n.hue,
    saturation = n.saturation,
    lightness  = n.lightness
FROM norm n
WHERE c.hex_code = n.hex_code;

-- --------------------------------------------------------------------------
-- 5. Derive canonical categories
-- --------------------------------------------------------------------------
WITH mapped AS (
  SELECT
    c.id,
    c.brand,
    c.hex_code,
    c.finish,
    c.category AS original_category,
    COALESCE(
      (SELECT m.canonical_category
         FROM color_category_map m
        WHERE LOWER(m.source_category) = LOWER(c.category)
          AND (m.brand IS NULL OR LOWER(m.brand) = LOWER(c.brand))
        ORDER BY m.priority
        LIMIT 1),
      (SELECT r.canonical_category
         FROM color_palette_rules r
        WHERE r.active
          AND (r.finish_in IS NULL OR (c.finish IS NOT NULL AND LOWER(c.finish) = ANY(SELECT LOWER(x) FROM unnest(r.finish_in) AS x)))
          AND (
                r.hue_min IS NULL OR r.hue_max IS NULL OR
                CASE
                  WHEN r.hue_wrap THEN (c.hue >= r.hue_min OR c.hue <= r.hue_max)
                  ELSE (c.hue BETWEEN r.hue_min AND r.hue_max)
                END
              )
          AND (r.saturation_min IS NULL OR c.saturation >= r.saturation_min)
          AND (r.saturation_max IS NULL OR c.saturation <= r.saturation_max)
          AND (r.lightness_min IS NULL OR c.lightness >= r.lightness_min)
          AND (r.lightness_max IS NULL OR c.lightness <= r.lightness_max)
        ORDER BY r.priority
        LIMIT 1),
      'nudes'
    ) AS canonical_category,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM color_category_map m
         WHERE LOWER(m.source_category) = LOWER(c.category)
           AND (m.brand IS NULL OR LOWER(m.brand) = LOWER(c.brand))
         ORDER BY m.priority
         LIMIT 1
      ) THEN 'map:' || COALESCE(LOWER(c.brand), '*') || ':' || LOWER(c.category)
      WHEN EXISTS (
        SELECT 1 FROM color_palette_rules r
        WHERE r.active
          AND (r.finish_in IS NULL OR (c.finish IS NOT NULL AND LOWER(c.finish) = ANY(SELECT LOWER(x) FROM unnest(r.finish_in) AS x)))
          AND (
                r.hue_min IS NULL OR r.hue_max IS NULL OR
                CASE WHEN r.hue_wrap THEN (c.hue >= r.hue_min OR c.hue <= r.hue_max)
                     ELSE (c.hue BETWEEN r.hue_min AND r.hue_max)
                END
              )
          AND (r.saturation_min IS NULL OR c.saturation >= r.saturation_min)
          AND (r.saturation_max IS NULL OR c.saturation <= r.saturation_max)
          AND (r.lightness_min IS NULL OR c.lightness >= r.lightness_min)
          AND (r.lightness_max IS NULL OR c.lightness <= r.lightness_max)
        ORDER BY r.priority
        LIMIT 1
      ) THEN 'rule'
      ELSE 'fallback:nudes'
    END AS source_tag,
    (COALESCE(c.is_trending, FALSE)
      OR LOWER(c.category) = 'trending'
      OR LOWER(c.brand) = 'trending 2025'
    ) AS normalized_trending
  FROM colors c
)
UPDATE colors c
SET canonical_category        = mapped.canonical_category,
    canonical_category_source = mapped.source_tag,
    category                  = mapped.canonical_category,
    is_trending               = mapped.normalized_trending,
    category_normalized_at    = NOW()
FROM mapped
WHERE c.id = mapped.id;

-- Ensure there are no lingering 'trending' categories
DELETE FROM color_category_map
WHERE canonical_category = 'trending';

DO $$
DECLARE
  leftover INTEGER;
BEGIN
  SELECT COUNT(*) INTO leftover
  FROM colors
  WHERE LOWER(category) = 'trending';

  IF leftover > 0 THEN
    RAISE EXCEPTION 'Normalization failed: % colors still set as trending category', leftover;
  END IF;
END;
$$;

-- --------------------------------------------------------------------------
-- 6. Rebuild display order using canonical categories (light → dark)
-- --------------------------------------------------------------------------
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

-- --------------------------------------------------------------------------
-- 7. Constraints (enforce canonical list) + QA views
-- --------------------------------------------------------------------------
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;
ALTER TABLE colors ADD CONSTRAINT colors_category_check
  CHECK (category IN ('nudes','pinks','reds','burgundy','pastels','french','blues','greens','purples','metallics','darks'))
  NOT VALID;

ALTER TABLE colors DROP CONSTRAINT IF EXISTS canonical_category_check;
ALTER TABLE colors ADD CONSTRAINT canonical_category_check
  CHECK (canonical_category IN ('nudes','pinks','reds','burgundy','pastels','french','blues','greens','purples','metallics','darks'))
  NOT VALID;

UPDATE colors
SET canonical_category_source = COALESCE(canonical_category_source, 'unknown');

UPDATE colors
SET is_trending = COALESCE(is_trending, FALSE);

ALTER TABLE colors ALTER COLUMN canonical_category SET NOT NULL;
ALTER TABLE colors ALTER COLUMN canonical_category_source SET NOT NULL;
ALTER TABLE colors ALTER COLUMN is_trending SET NOT NULL;

-- QA helper views
CREATE OR REPLACE VIEW color_category_distribution AS
SELECT
  brand,
  canonical_category,
  COUNT(*) AS shade_count
FROM colors
GROUP BY brand, canonical_category
ORDER BY brand, canonical_category;

CREATE OR REPLACE VIEW color_category_overview AS
SELECT
  canonical_category,
  COUNT(*) AS shade_count,
  COUNT(*) FILTER (WHERE is_trending) AS trending_shades
FROM colors
GROUP BY canonical_category
ORDER BY shade_count DESC;

CREATE OR REPLACE VIEW color_category_anomalies AS
SELECT *
FROM colors
WHERE canonical_category NOT IN ('nudes','pinks','reds','burgundy','pastels','french','blues','greens','purples','metallics','darks')
   OR canonical_category IS NULL
   OR hue IS NULL OR saturation IS NULL OR lightness IS NULL;

-- Validate constraints only after views for easier debugging
ALTER TABLE colors VALIDATE CONSTRAINT colors_category_check;
ALTER TABLE colors VALIDATE CONSTRAINT canonical_category_check;

COMMIT;

-- Post-commit manual QA suggestions (for Supabase SQL notebook):
--   SELECT * FROM color_category_distribution WHERE canonical_category = 'nudes';
--   SELECT * FROM color_category_anomalies LIMIT 20;
--   SELECT category, COUNT(*) FROM colors GROUP BY category ORDER BY COUNT(*) DESC;
