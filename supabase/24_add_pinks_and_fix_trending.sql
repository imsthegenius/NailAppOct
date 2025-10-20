-- ============================================================================
-- Fix Categories: Add Pinks and Fix Trending
-- File: 24_add_pinks_and_fix_trending.sql
-- Purpose: 1) Add pinks category, 2) Extract pinks from pastels, 3) Fix trending logic
-- ============================================================================

-- Step 1: Drop the current constraint (missing pinks)
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;

-- Step 2: Extract pinks from pastels based on color names and hex codes
UPDATE colors 
SET category = 'pinks'
WHERE category = 'pastels' AND (
    name ILIKE '%pink%' OR
    name ILIKE '%rose%' OR
    name ILIKE '%fuchsia%' OR
    name ILIKE '%magenta%' OR
    name ILIKE '%blush%' OR
    name ILIKE '%flamingo%' OR
    name ILIKE '%carnation%' OR
    hex_code LIKE '#FFB6%' OR
    hex_code LIKE '#FFC0%' OR
    hex_code LIKE '#FFD1%' OR
    hex_code LIKE '#FF69%' OR
    hex_code LIKE '#DB70%' OR
    hex_code LIKE '#FF6B%' OR
    hex_code LIKE '#FC89%' OR
    hex_code LIKE '#FAD%' OR
    hex_code LIKE '#F8BB%'
);

-- Step 3: Clear trending category (it's currently a dumping ground)
UPDATE colors
SET category = 'trending_temp'
WHERE category = 'trending';

-- Build a ranked list per category (no DISTINCT ON so we keep all rows)
CREATE TEMPORARY TABLE trending_selection AS
SELECT 
  hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code,
  ROW_NUMBER() OVER (PARTITION BY category ORDER BY trending_score DESC NULLS LAST, name) AS rn
FROM colors
WHERE category IN ('nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'pinks', 'metallics', 'darks');

-- Insert the top 2 from each category into trending
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code)
SELECT 
  hex_code, 
  name, 
  brand, 
  'trending' AS category,
  finish, 
  trending_score, 
  season, 
  mood_tags, 
  pantone_code
FROM trending_selection
WHERE rn <= 2
ON CONFLICT (hex_code) DO UPDATE
SET category = 'trending';

-- Clean up temporary table
DROP TABLE trending_selection;

-- Move remaining trending_temp colors to appropriate categories based on names
UPDATE colors
SET category = 
    CASE
        WHEN name ILIKE '%nude%' OR name ILIKE '%beige%' OR name ILIKE '%cream%' OR name ILIKE '%tan%' THEN 'nudes'
        WHEN name ILIKE '%red%' AND name NOT ILIKE '%burgundy%' THEN 'reds'
        WHEN name ILIKE '%burgundy%' OR name ILIKE '%wine%' THEN 'burgundy'
        WHEN name ILIKE '%pastel%' OR name ILIKE '%lavender%' OR name ILIKE '%lilac%' OR name ILIKE '%mint%' OR name ILIKE '%peach%' THEN 'pastels'
        WHEN name ILIKE '%french%' OR name ILIKE '%white%' OR name ILIKE '%ivory%' THEN 'french'
        WHEN name ILIKE '%blue%' OR name ILIKE '%teal%' OR name ILIKE '%turquoise%' THEN 'blues'
        WHEN name ILIKE '%green%' OR name ILIKE '%emerald%' OR name ILIKE '%forest%' THEN 'greens'
        WHEN name ILIKE '%purple%' OR name ILIKE '%violet%' OR name ILIKE '%orchid%' THEN 'purples'
        WHEN name ILIKE '%pink%' OR name ILIKE '%rose%' OR name ILIKE '%fuchsia%' THEN 'pinks'
        WHEN name ILIKE '%gold%' OR name ILIKE '%silver%' OR name ILIKE '%chrome%' OR name ILIKE '%glitter%' THEN 'metallics'
        WHEN name ILIKE '%black%' OR name ILIKE '%gray%' OR name ILIKE '%charcoal%' THEN 'darks'
        ELSE 'nudes' -- Default to nudes for any remaining
    END
WHERE category = 'trending_temp';

-- Step 5: Add the updated constraint with all 12 categories
ALTER TABLE colors ADD CONSTRAINT colors_category_check 
CHECK (category IN ('trending', 'nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'pinks', 'metallics', 'darks'));

-- Step 6: Verify the results
SELECT category, COUNT(*) as color_count
FROM colors
GROUP BY category
ORDER BY 
    CASE 
        WHEN category = 'trending' THEN 0
        WHEN category = 'nudes' THEN 1
        WHEN category = 'reds' THEN 2
        WHEN category = 'burgundy' THEN 3
        WHEN category = 'pastels' THEN 4
        WHEN category = 'french' THEN 5
        WHEN category = 'blues' THEN 6
        WHEN category = 'greens' THEN 7
        WHEN category = 'purples' THEN 8
        WHEN category = 'pinks' THEN 9
        WHEN category = 'metallics' THEN 10
        WHEN category = 'darks' THEN 11
        ELSE 12
    END;

-- Show trending colors
SELECT 'trending' as category, name, hex_code
FROM colors
WHERE category = 'trending'
ORDER BY trending_score DESC NULLS LAST, name;

-- Show French colors specifically
SELECT 'french' as category, name, hex_code
FROM colors
WHERE category = 'french'
ORDER BY name;

-- Total colors
SELECT COUNT(*) as total_colors FROM colors;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Category fixes completed successfully!';
    RAISE NOTICE '1. Added pinks category and extracted pinks from pastels';
    RAISE NOTICE '2. Fixed trending to show 2 curated colors from each category';
    RAISE NOTICE '3. All colors now properly categorized';
END $$;
