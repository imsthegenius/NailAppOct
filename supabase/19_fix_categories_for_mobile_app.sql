-- ============================================================================
-- Fix Database Categories to Match Mobile App
-- File: 19_fix_categories_for_mobile_app.sql
-- Purpose: Rename database categories to match mobile app's simple names
-- ============================================================================
-- Mobile app expects: trending, nudes, reds, burgundy, pastels, french, blues, greens, purples, metallics, darks
-- Database has: nudes_naturals, classic_reds, burgundies_wines, pinks, corals_peaches, etc.

-- Step 1: Drop the existing constraint
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;

-- Step 2: Update categories to match mobile app expectations

-- nudes_naturals → nudes
UPDATE colors 
SET category = 'nudes'
WHERE category = 'nudes_naturals';

-- classic_reds → reds
UPDATE colors 
SET category = 'reds'
WHERE category = 'classic_reds';

-- burgundies_wines → burgundy
UPDATE colors 
SET category = 'burgundy'
WHERE category = 'burgundies_wines';

-- pinks → pastels (since mobile app doesn't have separate pinks category)
UPDATE colors 
SET category = 'pastels'
WHERE category = 'pinks';

-- corals_peaches → pastels (group into pastels)
UPDATE colors 
SET category = 'pastels'
WHERE category = 'corals_peaches';

-- oranges → pastels (group into pastels)
UPDATE colors 
SET category = 'pastels'
WHERE category = 'oranges';

-- yellows_golds → trending (group into trending)
UPDATE colors 
SET category = 'trending'
WHERE category = 'yellows_golds';

-- greens → greens (already correct)
UPDATE colors 
SET category = 'greens'
WHERE category = 'greens';

-- blues → blues (already correct)
UPDATE colors 
SET category = 'blues'
WHERE category = 'blues';

-- purples_violets → purples
UPDATE colors 
SET category = 'purples'
WHERE category = 'purples_violets';

-- browns_taupes → nudes (group into nudes)
UPDATE colors 
SET category = 'nudes'
WHERE category = 'browns_taupes';

-- blacks_grays → darks
UPDATE colors 
SET category = 'darks'
WHERE category = 'blacks_grays';

-- whites_creams → nudes (group into nudes)
UPDATE colors 
SET category = 'nudes'
WHERE category = 'whites_creams';

-- metallics → metallics (already correct)
UPDATE colors 
SET category = 'metallics'
WHERE category = 'metallics';

-- special_effects → metallics (group into metallics)
UPDATE colors 
SET category = 'metallics'
WHERE category = 'special_effects';

-- french → french (keep existing)
UPDATE colors 
SET category = 'french'
WHERE category = 'french';

-- trending → trending (keep existing)
UPDATE colors 
SET category = 'trending'
WHERE category = 'trending';

-- Step 3: Add constraint with mobile app categories
ALTER TABLE colors ADD CONSTRAINT colors_category_check 
CHECK (category IN ('trending', 'nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'pinks', 'metallics', 'darks'));

-- Step 4: Verify the migration
SELECT category, COUNT(*) as color_count
FROM colors
GROUP BY category
ORDER BY color_count DESC;

-- Total colors
SELECT COUNT(*) as total_colors FROM colors;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully updated database categories to match mobile app!';
    RAISE NOTICE 'Categories now match: trending, nudes, reds, burgundy, pastels, french, blues, greens, purples, metallics, darks';
END $$;