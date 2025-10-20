-- ============================================================================
-- Comprehensive Fix for Database Categories
-- File: 20_comprehensive_category_fix.sql
-- Purpose: First check existing categories, then fix all to match mobile app
-- ============================================================================

-- Step 1: Check what categories currently exist
SELECT category, COUNT(*) as count
FROM colors
GROUP BY category
ORDER BY category;

-- Step 2: Drop the constraint to allow any updates
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;

-- Step 3: Map ALL existing categories to mobile app categories

-- First, handle the mobile app's 11 expected categories
UPDATE colors SET category = 'trending' WHERE category IN ('trending', 'yellows_golds');
UPDATE colors SET category = 'nudes' WHERE category IN ('nudes', 'nudes_naturals', 'browns_taupes', 'whites_creams');
UPDATE colors SET category = 'reds' WHERE category IN ('reds', 'classic_reds');
UPDATE colors SET category = 'burgundy' WHERE category IN ('burgundy', 'burgundies_wines');
UPDATE colors SET category = 'pastels' WHERE category IN ('pastels', 'pinks', 'corals_peaches', 'oranges');
UPDATE colors SET category = 'french' WHERE category IN ('french');
UPDATE colors SET category = 'blues' WHERE category IN ('blues');
UPDATE colors SET category = 'greens' WHERE category IN ('greens');
UPDATE colors SET category = 'purples' WHERE category IN ('purples', 'purples_violets');
UPDATE colors SET category = 'metallics' WHERE category IN ('metallics', 'special_effects', 'chrome', 'glitter');
UPDATE colors SET category = 'darks' WHERE category IN ('darks', 'blacks_grays');

-- Handle any remaining old categories
UPDATE colors SET category = 'nudes' WHERE category IN ('classic', 'seasonal', 'matte');

-- Step 4: Set any remaining unknown categories to trending
UPDATE colors 
SET category = 'trending' 
WHERE category NOT IN ('trending', 'nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'pinks', 'metallics', 'darks');

-- Step 5: Add the constraint with mobile app categories
ALTER TABLE colors ADD CONSTRAINT colors_category_check 
CHECK (category IN ('trending', 'nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'pinks', 'metallics', 'darks'));

-- Step 6: Verify the final result
SELECT category, COUNT(*) as color_count
FROM colors
GROUP BY category
ORDER BY color_count DESC;

-- Check total colors
SELECT COUNT(*) as total_colors FROM colors;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Category fix completed successfully!';
    RAISE NOTICE 'All colors now use mobile app categories';
END $$;