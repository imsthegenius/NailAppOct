-- ============================================================================
-- Strict French Cleanup (reduce over-classification)
-- File: 35_strict_french_cleanup.sql
-- Purpose: Constrain 'french' to true near-whites/tinted whites only, using
--          stricter RGB-distance and chroma thresholds. Move others to
--          pastels/nudes or nearest family by hue. Rebuild display_order.
-- Prereq: Run 32_hex_only_categorization.sql (for HSL columns). Optional: 33, 34.
-- Safe to re-run.
-- ============================================================================

WITH metrics AS (
  SELECT 
    c.hex_code,
    c.hue,
    c.saturation,
    c.lightness,
    (c.saturation * (1 - abs(2*c.lightness - 1)))::numeric AS chroma
  FROM colors c
), rgb AS (
  SELECT 
    hex_code,
    get_byte(decode(substr(hex_code, 2), 'hex'), 0) AS r,
    get_byte(decode(substr(hex_code, 2), 'hex'), 1) AS g,
    get_byte(decode(substr(hex_code, 2), 'hex'), 2) AS b
  FROM colors
), dist AS (
  SELECT 
    hex_code,
    r, g, b,
    sqrt( ((255 - r)^2 + (255 - g)^2 + (255 - b)^2) ) / 441.67295593 AS d_white
  FROM rgb
), should_be_french AS (
  SELECT m.hex_code
  FROM metrics m
  JOIN dist d USING (hex_code)
  WHERE (
    -- Pure/near pure whites
    d.d_white <= 0.06 AND m.lightness >= 0.93 AND m.chroma <= 0.10
  ) OR (
    -- Very light pink/peach tinted whites (classic French tints)
    m.lightness >= 0.94 AND m.chroma <= 0.10 AND ((m.hue >= 350 OR m.hue < 30) OR (m.hue BETWEEN 30 AND 55))
  ) OR (
    -- Hard RGB gate for very light whites
    EXISTS (
      SELECT 1 FROM rgb r0
      WHERE r0.hex_code = m.hex_code AND r0.r >= 245 AND r0.g >= 243 AND r0.b >= 243
    )
  )
),
-- 1) Ensure only strict set remains 'french'
demote_non_french AS (
  UPDATE colors c
  SET category = CASE
    WHEN m.lightness >= 0.80 AND m.chroma <= 0.35 THEN 'pastels'
    WHEN (m.hue BETWEEN 15 AND 60 AND m.chroma <= 0.40 AND m.lightness BETWEEN 0.45 AND 0.88)
         OR (m.chroma <= 0.18 AND m.lightness BETWEEN 0.45 AND 0.78) THEN 'nudes'
    WHEN m.hue BETWEEN 185 AND 255 THEN 'blues'
    WHEN m.hue BETWEEN 60 AND 180 THEN 'greens'
    WHEN m.hue BETWEEN 260 AND 330 THEN 'purples'
    WHEN (m.hue >= 350 OR m.hue < 20) AND m.lightness >= 0.60 AND m.chroma >= 0.45 THEN 'pinks'
    WHEN (m.hue >= 350 OR m.hue < 20) AND m.lightness < 0.35 THEN 'burgundy'
    WHEN (m.hue >= 350 OR m.hue < 20) THEN 'reds'
    ELSE 'nudes'
  END
  FROM metrics m
  WHERE c.hex_code = m.hex_code
    AND c.category = 'french'
    AND c.hex_code NOT IN (SELECT hex_code FROM should_be_french)
  RETURNING c.hex_code
),
-- 2) Promote strict set to 'french'
promote_french AS (
  UPDATE colors c
  SET category = 'french'
  WHERE c.hex_code IN (SELECT hex_code FROM should_be_french)
  RETURNING c.hex_code
)
-- 3) Rebuild display_order
UPDATE colors c
SET display_order = o.ord
FROM (
  SELECT hex_code,
         row_number() OVER (PARTITION BY category ORDER BY lightness DESC, hue NULLS LAST) AS ord
  FROM colors
) o
WHERE c.hex_code = o.hex_code;

-- Counts
SELECT category, COUNT(*) FROM colors GROUP BY category ORDER BY COUNT(*) DESC;

