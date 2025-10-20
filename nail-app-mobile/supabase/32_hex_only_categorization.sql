-- ============================================================================
-- Hex-only Color Categorization and Ordering
-- File: 32_hex_only_categorization.sql
-- Purpose: Categorize colors using only hex codes (HSL thresholds) and set
--          a per-category display order for light→dark swatch presentation.
-- Notes:
--   - No reliance on names; purely hex-derived HSL.
--   - Metallics are hard to detect by hex alone, so we keep a curated list.
--   - Safe to re-run; columns are added IF NOT EXISTS.
-- ============================================================================

-- 1) Columns for HSL + display order
ALTER TABLE colors ADD COLUMN IF NOT EXISTS hue NUMERIC;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS saturation NUMERIC;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS lightness NUMERIC;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS display_order INT;

-- 2) Compute HSL from hex (inline, no functions)
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
    r, g, b,
    GREATEST(r,g,b) AS maxc,
    LEAST(r,g,b) AS minc
  FROM rgb
),
hsl AS (
  SELECT 
    hex_code,
    r, g, b,
    maxc, minc,
    (maxc + minc) / 2.0 AS l,
    (maxc - minc) AS d
  FROM ext
),
hsl2 AS (
  SELECT 
    hex_code,
    l,
    CASE WHEN d = 0 THEN 0 ELSE d / NULLIF(1.0 - abs(2*l - 1), 0) END AS s,
    (
      CASE 
        WHEN d = 0 THEN 0
        WHEN maxc = r THEN ((g - b) / NULLIF(d,0)) * 60.0
        WHEN maxc = g THEN ((b - r) / NULLIF(d,0)) * 60.0 + 120.0
        ELSE ((r - g) / NULLIF(d,0)) * 60.0 + 240.0
      END
    ) AS h
  FROM (
    SELECT 
      c.hex_code, h.r, h.g, h.b, h.maxc, h.minc, h.l, (h.maxc - h.minc) AS d
    FROM hsl h
    JOIN colors c USING (hex_code)
  ) t
),
norm AS (
  SELECT 
    hex_code,
    (CASE WHEN h < 0 THEN h + 360 ELSE h END) AS h,
    GREATEST(0, LEAST(1, s)) AS s,
    GREATEST(0, LEAST(1, l)) AS l
  FROM hsl2
)
UPDATE colors c
SET hue = n.h,
    saturation = n.s,
    lightness = n.l
FROM norm n
WHERE c.hex_code = n.hex_code;

-- 3) Apply hex-only category rules
-- Order matters; the first match wins.
WITH m AS (
  SELECT hex_code FROM colors WHERE hex_code IN (
    -- Golds / Silvers / Bronze / Copper / Platinum / Brass
    '#FFD700', '#D4AF37', '#DAA520', '#F0E130', '#B8860B', '#996515', -- gold/brass range
    '#C0C0C0', '#A8A9AD', '#B2BEB5', '#E5E4E2', -- silvers/platinum
    '#B87333', '#CD7F32', '#CC7722'              -- copper/bronze
  )
)
UPDATE colors c
SET category = CASE
  -- Metallics: curated list only (hex alone can't detect reflectivity)
  WHEN EXISTS (SELECT 1 FROM m WHERE m.hex_code = c.hex_code) THEN 'metallics'

  -- Darks: very low lightness
  WHEN lightness <= 0.25 THEN 'darks'

  -- French: very light and low saturation (clean whites, milky sheers)
  WHEN lightness >= 0.90 AND saturation <= 0.18 THEN 'french'

  -- Pastels: light + low saturation, excluding near-white French
  WHEN lightness >= 0.80 AND saturation <= 0.45 THEN 'pastels'

  -- Nudes: warm low-sat beiges/browns (yellow/orange hues)
  WHEN hue BETWEEN 15 AND 60 AND saturation <= 0.60 AND lightness BETWEEN 0.45 AND 0.88 THEN 'nudes'
  -- Greige/taupe: low sat neutrals across hues, mid-lightness
  WHEN saturation BETWEEN 0.05 AND 0.25 AND lightness BETWEEN 0.45 AND 0.75 THEN 'nudes'

  -- Blues
  WHEN hue BETWEEN 185 AND 255 THEN 'blues'

  -- Greens
  WHEN hue BETWEEN 60 AND 180 THEN 'greens'

  -- Purples
  WHEN hue BETWEEN 260 AND 330 THEN 'purples'

  -- Pinks: bright light reds/magentas
  WHEN (hue >= 330 OR hue < 20) AND saturation >= 0.45 AND lightness >= 0.60 THEN 'pinks'

  -- Reds: true reds
  WHEN (hue >= 350 OR hue < 20) AND saturation >= 0.55 AND lightness BETWEEN 0.35 AND 0.65 THEN 'reds'

  -- Burgundy: deep red-wine range
  WHEN (hue >= 330 OR hue < 20 OR hue BETWEEN 320 AND 340) AND lightness < 0.35 THEN 'burgundy'

  -- Otherwise: assign to closest neutral family instead of 'trending'
  -- Bright/vivid but uncategorized → place with nearest hue block to avoid mishmash in Trending
  WHEN saturation >= 0.65 AND lightness BETWEEN 0.35 AND 0.75 AND (hue BETWEEN 185 AND 255) THEN 'blues'
  WHEN saturation >= 0.65 AND lightness BETWEEN 0.35 AND 0.75 AND (hue BETWEEN 60 AND 180) THEN 'greens'
  WHEN saturation >= 0.65 AND lightness BETWEEN 0.35 AND 0.75 AND (hue BETWEEN 260 AND 330) THEN 'purples'
  WHEN saturation >= 0.65 AND lightness BETWEEN 0.35 AND 0.75 AND ((hue >= 350 OR hue < 20)) THEN 'reds'
  
  -- Fallback for ambiguous colors
  ELSE 'nudes'
END;

-- 4) Set display order per category for light→dark swatch flow
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

-- 5) Suggested index to speed category+order queries
CREATE INDEX IF NOT EXISTS colors_category_display_order_idx 
  ON colors (category, display_order);

-- 6) Quick checks
SELECT category, COUNT(*) AS color_count FROM colors GROUP BY category ORDER BY color_count DESC;
SELECT name, hex_code, category, hue, saturation, lightness FROM colors ORDER BY category, display_order LIMIT 50;

-- End of file
