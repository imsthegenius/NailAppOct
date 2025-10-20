-- ============================================================================
-- French Refinement via RGB Distance to White
-- File: 34_french_rgb_distance.sql
-- Purpose: Capture near-whites that HSL may misclassify by using RGB distance
--          from pure white. Safe to re-run. Rebuilds display_order.
-- Prereq: Run 32_hex_only_categorization.sql first (for HSL columns), and/or
--         33_refine_hex_rules.sql. This script is an extra safety net.
-- ============================================================================

WITH rgb AS (
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
    sqrt( ((255 - r)^2 + (255 - g)^2 + (255 - b)^2) ) / 441.67295593 AS d_white -- normalized [0..~1]
  FROM rgb
)
UPDATE colors c
SET category = 'french'
FROM dist d
WHERE c.hex_code = d.hex_code
  AND c.category NOT IN ('metallics')
  AND (
    -- Very close to white, regardless of hue
    d.d_white <= 0.065 OR
    -- Light tinted whites
    (d.d_white <= 0.10 AND c.lightness >= 0.88)
  );

-- Rebuild display_order (light → dark per category)
WITH ordered AS (
  SELECT hex_code,
         row_number() OVER (PARTITION BY category ORDER BY lightness DESC, hue NULLS LAST) AS ord
  FROM colors
)
UPDATE colors c
SET display_order = o.ord
FROM ordered o
WHERE c.hex_code = o.hex_code;

-- Quick sample and counts
SELECT name, hex_code, category, hue, saturation, lightness
FROM colors
WHERE hex_code IN ('#F8F8FF', '#F0F8FF', '#E6E6FA', '#FFFAFA', '#FFFFFF')
ORDER BY name;

SELECT category, COUNT(*) FROM colors GROUP BY category ORDER BY COUNT(*) DESC;

