-- ============================================================================
-- Refine Hex-only Categorization (near-whites → French, better pastels/nudes)
-- File: 33_refine_hex_rules.sql
-- Purpose: Fix cases where very light near-whites (e.g., Ghost White) landed
--          in Blues due to HSL saturation behavior. Uses chroma to detect
--          near-whites and pastels. Recomputes display_order.
-- Prereq: Run 32_hex_only_categorization.sql first (to populate hue/s/l).
-- Safe to re-run.
-- ============================================================================

-- Helper CTE to compute chroma from existing saturation/lightness
-- HSL relation: chroma = s * (1 - |2*l - 1|)
WITH metrics AS (
  SELECT 
    hex_code,
    hue,
    saturation,
    lightness,
    (saturation * (1 - abs(2*lightness - 1)))::numeric AS chroma
  FROM colors
),
-- 1) French: very light, very low chroma regardless of hue
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
-- 1b) Explicit near-white whitelist (safe overrides)
french_whitelist AS (
  UPDATE colors
  SET category = 'french'
  WHERE hex_code IN (
    '#FFFFFF', '#FFFAFA', '#F8F8FF', '#FFF8DC', '#FFFAF0', '#FFF5EE', '#FFF5F5',
    '#FFFDFA', '#FFFDF5', '#F5F5F5', '#FAEBD7', '#F0F8FF', '#FFF0F5'
  )
  RETURNING hex_code
),
-- 2) Pastels: light + low chroma (exclude French)
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
-- 3) Nudes: warm/neutral low-chroma mid-lightness (beiges/greige/taupe)
nudes_fix AS (
  UPDATE colors c
  SET category = 'nudes'
  FROM metrics m
  WHERE c.hex_code = m.hex_code
    AND (
      (m.hue BETWEEN 15 AND 60 AND m.chroma <= 0.40 AND m.lightness BETWEEN 0.45 AND 0.88)
      OR (m.chroma <= 0.18 AND m.lightness BETWEEN 0.45 AND 0.78)
    )
    AND c.category NOT IN ('french','pastels')
  RETURNING c.hex_code
),
-- 4) Ensure vivid colors don't pollute French: push vivid near-white blues/greens back
family_balance AS (
  UPDATE colors c
  SET category = CASE
    WHEN m.hue BETWEEN 185 AND 255 AND m.chroma > 0.12 AND m.lightness < 0.92 THEN 'blues'
    WHEN m.hue BETWEEN 60 AND 180  AND m.chroma > 0.12 AND m.lightness < 0.92 THEN 'greens'
    WHEN m.hue BETWEEN 260 AND 330 AND m.chroma > 0.12 AND m.lightness < 0.92 THEN 'purples'
    ELSE c.category
  END
  FROM metrics m
  WHERE c.hex_code = m.hex_code
    AND c.category NOT IN ('french','pastels','nudes')
  RETURNING c.hex_code
)
-- 5) Rebuild display_order (light → dark per category)
UPDATE colors c
SET display_order = o.ord
FROM (
  SELECT hex_code,
         row_number() OVER (PARTITION BY category ORDER BY lightness DESC, hue NULLS LAST) AS ord
  FROM colors
) o
WHERE c.hex_code = o.hex_code;

-- Quick sample: verify near-whites are now French
SELECT name, hex_code, category, hue, saturation, lightness
FROM colors
WHERE hex_code IN ('#F8F8FF', '#F0F8FF', '#E6E6FA')
ORDER BY name;

-- Count per category
SELECT category, COUNT(*) FROM colors GROUP BY category ORDER BY COUNT(*) DESC;
