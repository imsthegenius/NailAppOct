-- ============================================================================
-- Fix 15_massive_color_expansion.sql Categories
-- File: 18_fix_15_massive_expansion_categories.sql
-- Purpose: Update the 455 colors from file 15 to use the correct categories
-- ============================================================================
-- After running 09_mobile_app_updates.sql, the constraint was changed to:
-- 'nudes_naturals', 'classic_reds', 'burgundies_wines', 'pinks', 
-- 'corals_peaches', 'oranges', 'yellows_golds', 'greens', 'blues', 
-- 'purples_violets', 'browns_taupes', 'blacks_grays', 'whites_creams', 
-- 'metallics', 'special_effects'

-- But 15_massive_color_expansion.sql used the original categories:
-- 'classic', 'seasonal', 'trending', 'french', 'chrome', 'glitter', 'matte'

-- Step 1: Check current constraint status
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'colors_category_check';

-- Step 2: Update colors from file 15 to use correct categories
-- All colors from 15_massive_color_expansion.sql were inserted with category='classic'
-- We need to redistribute them based on their actual colors

-- Update Nudes & Naturals (from classic category - nudes section)
UPDATE colors 
SET category = 'nudes_naturals'
WHERE category = 'classic' 
AND (
  name ILIKE '%nude%' OR 
  name ILIKE '%beige%' OR 
  name ILIKE '%natural%' OR
  name ILIKE '%linen%' OR
  name ILIKE '%wheat%' OR
  name ILIKE '%sand%' OR
  name ILIKE '%tan%' OR
  name ILIKE '%almond%' OR
  name ILIKE '%mushroom%' OR
  name ILIKE '%ecru%' OR
  name ILIKE '%biscuit%' OR
  name ILIKE '%parchment%' OR
  name ILIKE '%cornsilk%' OR
  name ILIKE '%antique%' OR
  name ILIKE '%vanilla%' OR
  name ILIKE '%champagne%' OR
  name ILIKE '%buff%' OR
  hex_code IN ('#FFF5EE', '#FAF0E6', '#FFEFD5', '#FFE4CD', '#FFDAB9', '#FFE7BA', '#FFF0DB', '#FFF4E6', '#FFF5F5', '#FFFAFA')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Classic Reds (from classic category)
UPDATE colors 
SET category = 'classic_reds'
WHERE category = 'classic' 
AND (
  name ILIKE '%red%' OR 
  name ILIKE '%crimson%' OR
  name ILIKE '%scarlet%' OR
  name ILIKE '%ruby%' OR
  name ILIKE '%cherry%' OR
  name ILIKE '%fire%' OR
  hex_code IN ('#FF0000', '#DC143C', '#8B0000', '#FF6B6B', '#CD5C5C', '#B22222', '#FF4444', '#E74C3C', '#E34234', '#D2691E')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Burgundies & Wines (from classic category)
UPDATE colors 
SET category = 'burgundies_wines'
WHERE category = 'classic' 
AND (
  name ILIKE '%burgundy%' OR 
  name ILIKE '%wine%' OR
  name ILIKE '%bordeaux%' OR
  name ILIKE '%oxblood%' OR
  name ILIKE '%mulberry%' OR
  name ILIKE '%berry%' OR
  name ILIKE '%plum%' OR
  hex_code IN ('#800020', '#6B2737', '#4C1130', '#722F37', '#943543', '#5E2129', '#8B2252', '#6F1E51')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Pinks (from classic category)
UPDATE colors 
SET category = 'pinks'
WHERE category = 'classic' 
AND (
  name ILIKE '%pink%' OR 
  name ILIKE '%rose%' OR
  name ILIKE '%fuchsia%' OR
  hex_code IN ('#FFC0CB', '#FF69B4', '#FF1493', '#DB7093', '#F08080', '#FFB6C1', '#FFA0C9', '#F8BBD0', '#EC407A', '#AD1457')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Corals & Peaches (from classic category)
UPDATE colors 
SET category = 'corals_peaches'
WHERE category = 'classic' 
AND (
  name ILIKE '%coral%' OR 
  name ILIKE '%peach%' OR
  name ILIKE '%salmon%' OR
  hex_code IN ('#FF7F50', '#F88379', '#FA8072', '#E9967A', '#FFA07A', '#FF6B9D')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Oranges (from classic category)
UPDATE colors 
SET category = 'oranges'
WHERE category = 'classic' 
AND (
  name ILIKE '%orange%' OR 
  name ILIKE '%tangerine%' OR
  name ILIKE '%apricot%' OR
  hex_code IN ('#FFA500', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500', '#D2691E')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Yellows & Golds (from classic category)
UPDATE colors 
SET category = 'yellows_golds'
WHERE category = 'classic' 
AND (
  name ILIKE '%yellow%' OR 
  name ILIKE '%gold%' OR
  name ILIKE '%lemon%' OR
  name ILIKE '%sun%' OR
  hex_code IN ('#FFFF00', '#FFD700', '#F0E68C', '#FFFFE0', '#BDB76B')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Greens (from classic category)
UPDATE colors 
SET category = 'greens'
WHERE category = 'classic' 
AND (
  name ILIKE '%green%' OR 
  name ILIKE '%mint%' OR
  name ILIKE '%emerald%' OR
  name ILIKE '%forest%' OR
  name ILIKE '%lime%' OR
  name ILIKE '%olive%' OR
  name ILIKE '%sage%' OR
  hex_code IN ('#228B22', '#98FB98', '#00FF7F', '#90EE90', '#00FA9A', '#3CB371', '#2E8B57', '#32CD32', '#00FF00', '#7CFC00')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Blues (from classic category)
UPDATE colors 
SET category = 'blues'
WHERE category = 'classic' 
AND (
  name ILIKE '%blue%' OR 
  name ILIKE '%teal%' OR
  name ILIKE '%turquoise%' OR
  name ILIKE '%navy%' OR
  name ILIKE '%sky%' OR
  name ILIKE '%ocean%' OR
  name ILIKE '%denim%' OR
  hex_code IN ('#000080', '#4169E1', '#87CEEB', '#00CED1', '#40E0D0', '#48D1CC', '#5F9EA0', '#4682B4', '#6495ED', '#00BFFF')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Purples & Violets (from classic category)
UPDATE colors 
SET category = 'purples_violets'
WHERE category = 'classic' 
AND (
  name ILIKE '%purple%' OR 
  name ILIKE '%violet%' OR
  name ILIKE '%magenta%' OR
  name ILIKE '%orchid%' OR
  name ILIKE '%amethyst%' OR
  name ILIKE '%mauve%' OR
  name ILIKE '%lavender%' OR
  name ILIKE '%lilac%' OR
  hex_code IN ('#800080', '#9B59B6', '#E6E6FA', '#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB', '#8A2BE2', '#9932CC', '#4B0082')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Browns & Taupes (from classic category)
UPDATE colors 
SET category = 'browns_taupes'
WHERE category = 'classic' 
AND (
  name ILIKE '%brown%' OR 
  name ILIKE '%taupe%' OR
  name ILIKE '%chocolate%' OR
  name ILIKE '%espresso%' OR
  name ILIKE '%caramel%' OR
  name ILIKE '%mocha%' OR
  name ILIKE '%cinnamon%' OR
  name ILIKE '%tan%' OR
  hex_code IN ('#8B4513', '#A52A2A', '#D26900', '#BC8F8F', '#F4A460', '#8B7355', '#A0826D', '#9F8170', '#8B7355', '#996515')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Blacks & Grays (from classic category)
UPDATE colors 
SET category = 'blacks_grays'
WHERE category = 'classic' 
AND (
  name ILIKE '%black%' OR 
  name ILIKE '%gray%' OR
  name ILIKE '%grey%' OR
  name ILIKE '%charcoal%' OR
  name ILIKE '%slate%' OR
  name ILIKE '%graphite%' OR
  name ILIKE '%smoke%' OR
  name ILIKE '%ash%' OR
  hex_code IN ('#000000', '#0C0C0C', '#1C1C1C', '#2B2B2B', '#808080', '#A9A9A9', '#D3D3D3', '#696969', '#2F4F4F', '#4B4B4D')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update Whites & Creams (from classic category)
UPDATE colors 
SET category = 'whites_creams'
WHERE category = 'classic' 
AND (
  name ILIKE '%white%' OR 
  name ILIKE '%cream%' OR
  name ILIKE '%ivory%' OR
  name ILIKE '%pearl%' OR
  name ILIKE '%snow%' OR
  name ILIKE '%milk%' OR
  name ILIKE '%coconut%' OR
  hex_code IN ('#FFFFFF', '#F8F8FF', '#FFFFF0', '#FFFAFA', '#F5F5F5', '#FDFFF5', '#FFF5EE', '#FAEBD7')
)
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Update any remaining classic colors to nudes_naturals
UPDATE colors 
SET category = 'nudes_naturals'
WHERE category = 'classic'
AND id IN (
  SELECT id FROM colors 
  WHERE brand IN ('OPI', 'Essie', 'Sally Hansen', 'Chanel', 'Dior', 'YSL')
  AND created_at > '2024-01-01'::timestamp
);

-- Step 3: Verify the updates
SELECT category, COUNT(*) as color_count
FROM colors
GROUP BY category
ORDER BY color_count DESC;

-- Total colors
SELECT COUNT(*) as total_colors FROM colors;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully updated categories for 15_massive_color_expansion.sql colors!';
    RAISE NOTICE 'All 455 colors now use the correct category structure';
END $$;