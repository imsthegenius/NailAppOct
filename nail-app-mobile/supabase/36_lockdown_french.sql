-- ============================================================================
-- Lockdown French: minimal, precise near-whites only
-- File: 36_lockdown_french.sql
-- Purpose: Reduce 'french' to true near-whites and very light pink/peach sheers;
--          move everything else (lavender/icy/mint/blue tints) to Pastels or
--          nearest hue family. Rebuild display_order. Safe to re-run.
-- ============================================================================

-- Build temp tables so subsequent statements can reuse results
CREATE TEMP TABLE tmp_rgb ON COMMIT DROP AS
SELECT 
  hex_code,
  get_byte(decode(substr(hex_code, 2), 'hex'), 0)::float/255.0 AS r,
  get_byte(decode(substr(hex_code, 2), 'hex'), 1)::float/255.0 AS g,
  get_byte(decode(substr(hex_code, 2), 'hex'), 2)::float/255.0 AS b
FROM colors;

CREATE TEMP TABLE tmp_metrics ON COMMIT DROP AS
WITH ext AS (
  SELECT hex_code, r, g, b,
         GREATEST(r,g,b) AS maxc,
         LEAST(r,g,b)    AS minc
  FROM tmp_rgb
), hsl AS (
  SELECT 
    hex_code,
    (maxc + minc)/2.0 AS l,
    (CASE WHEN maxc = minc THEN 0 ELSE (maxc - minc) / NULLIF(1.0 - abs(2*((maxc+minc)/2.0) - 1), 0) END) AS s,
    (
      CASE
        WHEN maxc = minc THEN 0
        WHEN maxc = r THEN ((g - b) / NULLIF(maxc - minc,0)) * 60.0
        WHEN maxc = g THEN ((b - r) / NULLIF(maxc - minc,0)) * 60.0 + 120.0
        ELSE ((r - g) / NULLIF(maxc - minc,0)) * 60.0 + 240.0
      END
    ) AS h
  FROM ext
)
SELECT 
  hex_code,
  (CASE WHEN h < 0 THEN h + 360 ELSE h END) AS hue,
  GREATEST(0, LEAST(1, s)) AS saturation,
  GREATEST(0, LEAST(1, l)) AS lightness,
  (GREATEST(0, LEAST(1, s)) * (1 - abs(2*GREATEST(0, LEAST(1, l)) - 1)))::numeric AS chroma
FROM hsl;

CREATE TEMP TABLE tmp_dist ON COMMIT DROP AS
SELECT 
  hex_code,
  sqrt( ((1 - r)^2 + (1 - g)^2 + (1 - b)^2) ) / sqrt(3) AS d_white
FROM tmp_rgb;

CREATE TEMP TABLE tmp_strict_french ON COMMIT DROP AS
SELECT m.hex_code
FROM tmp_metrics m
JOIN tmp_dist d USING (hex_code)
WHERE (
  d.d_white <= 0.05 AND m.lightness >= 0.94 AND m.chroma <= 0.08
) OR (
  m.lightness >= 0.96 AND m.chroma <= 0.05 AND ((m.hue >= 350 OR m.hue < 15) OR (m.hue BETWEEN 20 AND 55))
)
UNION
SELECT hex_code FROM (VALUES
  ('#FFFFFF'),('#FFFAFA'),('#F8F8FF'),('#FFF8DC'),('#FFFAF0'),('#FFF5EE'),('#FFF5F5'),
  ('#FFFDFA'),('#FFFDF5'),('#F5F5F5'),('#FFF0F5')
) v(hex_code);

-- 1) Demote current French that don't meet strict criteria (ensure tinted lights go to Pastels)
UPDATE colors c
SET category = CASE
  WHEN m.lightness >= 0.80 AND m.chroma <= 0.45 THEN 'pastels'
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
FROM tmp_metrics m
WHERE c.hex_code = m.hex_code
  AND c.category = 'french'
  AND c.hex_code NOT IN (SELECT hex_code FROM tmp_strict_french);

-- 2) Promote strict set to French
UPDATE colors c
SET category = 'french'
WHERE c.hex_code IN (SELECT hex_code FROM tmp_strict_french);

-- 3) Rebuild display_order
WITH ordered AS (
  SELECT hex_code,
         row_number() OVER (PARTITION BY category ORDER BY lightness DESC, hue NULLS LAST) AS ord
  FROM (
    SELECT c.hex_code, m.lightness, m.hue, c.category
    FROM colors c
    JOIN tmp_metrics m USING (hex_code)
  ) t
)
UPDATE colors c
SET display_order = o.ord
FROM ordered o
WHERE c.hex_code = o.hex_code;

-- Counts and sample
SELECT category, COUNT(*) FROM colors GROUP BY category ORDER BY COUNT(*) DESC;
SELECT name, hex_code FROM colors WHERE category='french' ORDER BY display_order LIMIT 40;
