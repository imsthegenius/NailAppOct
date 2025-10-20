-- ============================================================================
-- Simple Fix: Add Pinks Category
-- File: 26_simple_pinks_fix.sql
-- Purpose: Just add pinks to the constraint and extract obvious pinks
-- ============================================================================

-- Step 1: Drop the current constraint
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;

-- Step 2: Add the constraint with pinks included
ALTER TABLE colors ADD CONSTRAINT colors_category_check 
CHECK (category IN ('trending', 'nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'pinks', 'metallics', 'darks'));

-- Step 3: Move obvious pinks from pastels to pinks
UPDATE colors
SET category = 'pinks'
WHERE category = 'pastels' AND (
    name ILIKE '%pink%' OR
    name ILIKE '%rose%' OR
    hex_code LIKE '#FFB6%' OR
    hex_code LIKE '#FFC0%' OR
    hex_code LIKE '#FFD1%' OR
    hex_code LIKE '#FF69%'
);

-- Step 4: Check results
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Pinks category added successfully!';
    RAISE NOTICE 'Check the category counts above';
END $$;