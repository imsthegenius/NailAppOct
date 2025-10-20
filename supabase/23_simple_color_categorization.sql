-- ============================================================================
-- Simple Color Categorization SQL
-- File: 23_simple_color_categorization.sql
-- Purpose: Categorize colors based primarily on name with simple hex checks
-- ============================================================================

-- Mobile app categories (12 total):
-- trending, nudes, reds, burgundy, pastels, french, blues, greens, purples, pinks, metallics, darks

-- Step 1: Drop constraint to allow updates
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;

-- Step 2: Create a function to determine color category based on name and simple hex patterns
CREATE OR REPLACE FUNCTION get_color_category(hex_code TEXT, name TEXT) 
RETURNS TEXT AS $$
DECLARE
    clean_hex TEXT;
BEGIN
    -- Remove # if present
    clean_hex = REPLACE(UPPER(hex_code), '#', '');
    
    -- Nudes & Naturals (beige, tan, cream, brown tones)
    IF name ILIKE '%nude%' OR name ILIKE '%beige%' OR name ILIKE '%cream%' OR 
       name ILIKE '%tan%' OR name ILIKE '%sand%' OR name ILIKE '%wheat%' OR
       name ILIKE '%linen%' OR name ILIKE '%ecru%' OR name ILIKE '%biscuit%' OR
       name ILIKE '%mushroom%' OR name ILIKE '%taupe%' OR name ILIKE '%almond%' OR
       name ILIKE '%buff%' OR name ILIKE '%vanilla%' OR name ILIKE '%champagne%' OR
       name ILIKE '%khaki%' OR name ILIKE '%camel%' OR name ILIKE '%mocha%' OR
       name ILIKE '%cashmere%' OR name ILIKE '%oat%' OR name ILIKE '%brown%' OR
       name ILIKE '%coffee%' OR name ILIKE '%caramel%' OR name ILIKE '%cinnamon%' OR
       -- Simple hex patterns for nudes
       clean_hex LIKE 'F5%' OR clean_hex LIKE 'DE%' OR clean_hex LIKE 'D2%' OR
       clean_hex LIKE 'BC%' OR clean_hex LIKE 'A0%' OR clean_hex LIKE '8B7%' THEN
        RETURN 'nudes';
    END IF;
    
    -- French (whites, light pinks, clean colors)
    IF name ILIKE '%french%' OR name ILIKE '%white%' OR 
       name ILIKE '%ivory%' OR name ILIKE '%pearl%' OR name ILIKE '%snow%' OR
       name ILIKE '%ghost%' OR name ILIKE '%opal%' OR name ILIKE '%porcelain%' OR
       -- Pure whites and very light colors
       clean_hex = 'FFFFFF' OR clean_hex = 'FFFAFA' OR clean_hex = 'F8F8FF' OR
       clean_hex = 'FFF8DC' OR clean_hex = 'FFFAF0' OR clean_hex = 'F0F8FF' OR
       -- Very light pinks for french
       clean_hex LIKE 'FFF0%' OR clean_hex LIKE 'FFE4%' OR clean_hex LIKE 'FFD1%' THEN
        RETURN 'french';
    END IF;
    
    -- Reds (true reds, cherry, crimson)
    IF name ILIKE '%red%' AND name NOT ILIKE '%burgundy%' AND name NOT ILIKE '%wine%' OR
       name ILIKE '%crimson%' OR name ILIKE '%scarlet%' OR name ILIKE '%cherry%' OR
       name ILIKE '%ruby%' OR name ILIKE '%vermillion%' OR name ILIKE '%fire%' OR
       name ILIKE '%candy%' OR name ILIKE '%apple%' OR name ILIKE '%coral%' OR
       -- Red hex patterns
       clean_hex LIKE 'FF%' AND clean_hex NOT LIKE 'FF00%' AND 
       (clean_hex LIKE '%00' OR clean_hex LIKE '%11' OR clean_hex LIKE '%22' OR 
        clean_hex LIKE '%33' OR clean_hex LIKE '%44' OR clean_hex LIKE '%55') THEN
        RETURN 'reds';
    END IF;
    
    -- Burgundy & Wine (deep reds, wines, berries)
    IF name ILIKE '%burgundy%' OR name ILIKE '%wine%' OR name ILIKE '%bordeaux%' OR
       name ILIKE '%oxblood%' OR name ILIKE '%mulberry%' OR name ILIKE '%berry%' OR
       name ILIKE '%plum%' OR name ILIKE '%merlot%' OR name ILIKE '%sangria%' OR
       name ILIKE '%maroon%' OR name ILIKE '%garnet%' OR
       -- Deep red/wine hex patterns
       clean_hex LIKE '8%' OR clean_hex LIKE '7%' OR clean_hex LIKE '6%' OR
       clean_hex LIKE '5%' AND clean_hex NOT LIKE '50%' AND clean_hex NOT LIKE '51%' THEN
        RETURN 'burgundy';
    END IF;
    
    -- Pinks (all shades of pink)
    IF name ILIKE '%pink%' OR name ILIKE '%rose%' OR name ILIKE '%fuchsia%' OR
       name ILIKE '%magenta%' OR name ILIKE '%hot pink%' OR name ILIKE '%bubblegum%' OR
       name ILIKE '%blush%' OR name ILIKE '%flamingo%' OR name ILIKE '%carnation%' OR
       -- Pink hex patterns
       clean_hex LIKE 'FFB%' OR clean_hex LIKE 'FFC%' OR clean_hex LIKE 'FFD%' OR
       clean_hex LIKE 'FF6%' OR clean_hex LIKE 'FF9%' OR clean_hex LIKE 'DB7%' OR
       clean_hex LIKE 'FF14%' OR clean_hex LIKE 'FF69%' OR clean_hex LIKE 'FFC0%' THEN
        RETURN 'pinks';
    END IF;
    
    -- Pastels (light, soft colors)
    IF name ILIKE '%pastel%' OR name ILIKE '%lavender%' OR name ILIKE '%lilac%' OR
       name ILIKE '%mint%' OR name ILIKE '%peach%' OR name ILIKE '%baby%' OR
       name ILIKE '%sky%' OR name ILIKE '%powder%' OR name ILIKE '%mist%' OR
       -- Pastel hex patterns (light colors)
       clean_hex LIKE 'F%' AND clean_hex NOT LIKE 'FF%' OR
       clean_hex LIKE 'E%' AND clean_hex NOT LIKE 'E0%' OR
       clean_hex LIKE 'D%' AND clean_hex NOT LIKE 'D0%' THEN
        RETURN 'pastels';
    END IF;
    
    -- Blues (all shades of blue, teal, turquoise)
    IF name ILIKE '%blue%' OR name ILIKE '%teal%' OR name ILIKE '%turquoise%' OR
       name ILIKE '%navy%' OR name ILIKE '%sky%' OR name ILIKE '%ocean%' OR
       name ILIKE '%denim%' OR name ILIKE '%azure%' OR name ILIKE '%cobalt%' OR
       name ILIKE '%sapphire%' OR name ILIKE '%cyan%' OR name ILIKE '%aqua%' OR
       -- Blue hex patterns
       clean_hex LIKE '%00' OR clean_hex LIKE '%11' OR clean_hex LIKE '%22' OR
       clean_hex LIKE '%33' OR clean_hex LIKE '00%' OR clean_hex LIKE '1E%' OR
       clean_hex LIKE '46%' OR clean_hex LIKE '5F%' OR clean_hex LIKE '64%' THEN
        RETURN 'blues';
    END IF;
    
    -- Greens (all shades of green, mint, olive)
    IF name ILIKE '%green%' OR name ILIKE '%mint%' OR name ILIKE '%emerald%' OR
       name ILIKE '%forest%' OR name ILIKE '%lime%' OR name ILIKE '%olive%' OR
       name ILIKE '%sage%' OR name ILIKE '%sea%' OR name ILIKE '%jade%' OR
       name ILIKE '%pistachio%' OR name ILIKE '%moss%' OR name ILIKE '%grass%' OR
       -- Green hex patterns
       clean_hex LIKE '22%' OR clean_hex LIKE '32%' OR clean_hex LIKE '00FF%' OR
       clean_hex LIKE '80%' OR clean_hex LIKE '55%' OR clean_hex LIKE '6B%' OR
       clean_hex LIKE '3C%' OR clean_hex LIKE '228B22' OR clean_hex LIKE '006400' THEN
        RETURN 'greens';
    END IF;
    
    -- Purples & Violets
    IF name ILIKE '%purple%' OR name ILIKE '%violet%' OR name ILIKE '%orchid%' OR
       name ILIKE '%amethyst%' OR name ILIKE '%mauve%' OR name ILIKE '%lavender%' OR
       name ILIKE '%lilac%' OR name ILIKE '%iris%' OR name ILIKE '%eggplant%' OR
       -- Purple hex patterns
       clean_hex LIKE '80%' OR clean_hex LIKE '9B%' OR clean_hex LIKE '8E%' OR
       clean_hex LIKE '99%' OR clean_hex LIKE 'DD%' OR clean_hex LIKE 'BA%' OR
       clean_hex LIKE '93%' OR clean_hex LIKE '8A%' THEN
        RETURN 'purples';
    END IF;
    
    -- Metallics (gold, silver, chrome, glitter)
    IF name ILIKE '%gold%' OR name ILIKE '%silver%' OR name ILIKE '%chrome%' OR
       name ILIKE '%metallic%' OR name ILIKE '%platinum%' OR name ILIKE '%bronze%' OR
       name ILIKE '%copper%' OR name ILIKE '%steel%' OR name ILIKE '%iron%' OR
       name ILIKE '%glitter%' OR name ILIKE '%shimmer%' OR name ILIKE '%rose gold%' OR
       -- Metallic hex patterns
       clean_hex = 'FFD700' OR clean_hex = 'C0C0C0' OR clean_hex = 'B87333' OR
       clean_hex = 'E5E4E2' OR clean_hex = 'B76E79' OR clean_hex = 'D4AF37' OR
       clean_hex = 'FFA500' OR clean_hex = 'B8860B' THEN
        RETURN 'metallics';
    END IF;
    
    -- Darks & Blacks (blacks, grays, dark colors)
    IF name ILIKE '%black%' OR name ILIKE '%gray%' OR name ILIKE '%grey%' OR
       name ILIKE '%charcoal%' OR name ILIKE '%slate%' OR name ILIKE '%graphite%' OR
       name ILIKE '%smoke%' OR name ILIKE '%ash%' OR name ILIKE '%ebony%' OR
       name ILIKE '%midnight%' OR name ILIKE '%onyx%' OR name ILIKE '%jet%' OR
       -- Dark hex patterns
       clean_hex LIKE '0%' OR clean_hex LIKE '1%' OR clean_hex LIKE '2%' OR
       clean_hex LIKE '3%' OR clean_hex LIKE '4%' OR clean_hex LIKE '5%' OR
       clean_hex LIKE '6%' OR clean_hex LIKE '69%' OR clean_hex LIKE '80%' THEN
        RETURN 'darks';
    END IF;
    
    -- Default to trending for vibrant colors not categorized
    RETURN 'trending';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Update all colors using the categorization function
UPDATE colors 
SET category = get_color_category(hex_code, name);

-- Step 4: Add the constraint with all 12 categories
ALTER TABLE colors ADD CONSTRAINT colors_category_check 
CHECK (category IN ('trending', 'nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'pinks', 'metallics', 'darks'));

-- Step 5: Verify the categorization
SELECT category, COUNT(*) as color_count
FROM colors
GROUP BY category
ORDER BY color_count DESC;

-- Show some examples from each category
SELECT category, name, hex_code
FROM colors
ORDER BY category, name
LIMIT 50;

-- Total colors
SELECT COUNT(*) as total_colors FROM colors;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Color categorization completed successfully!';
    RAISE NOTICE 'Colors are now properly categorized into 12 categories';
    RAISE NOTICE 'Including the new pinks category';
END $$;