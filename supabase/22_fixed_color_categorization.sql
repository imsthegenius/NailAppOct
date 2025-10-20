-- ============================================================================
-- Fixed Color Categorization SQL
-- File: 22_fixed_color_categorization.sql
-- Purpose: Properly categorize all colors with correct hex parsing
-- ============================================================================

-- Mobile app categories (12 total):
-- trending, nudes, reds, burgundy, pastels, french, blues, greens, purples, pinks, metallics, darks

-- Step 1: Drop constraint to allow updates
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;

-- Step 2: Create a function to determine color category based on hex code and name
CREATE OR REPLACE FUNCTION get_color_category(hex_code TEXT, name TEXT) 
RETURNS TEXT AS $$
DECLARE
    r INTEGER;
    g INTEGER;
    b INTEGER;
    brightness FLOAT;
    saturation FLOAT;
    clean_hex TEXT;
BEGIN
    -- Remove # if present
    clean_hex = REPLACE(hex_code, '#', '');
    
    -- Extract RGB values from hex (proper parsing)
    BEGIN
        r = ('x' || SUBSTRING(clean_hex, 1, 2))::bit(8)::integer;
        g = ('x' || SUBSTRING(clean_hex, 3, 2))::bit(8)::integer;
        b = ('x' || SUBSTRING(clean_hex, 5, 2))::bit(8)::integer;
    EXCEPTION WHEN OTHERS THEN
        -- If hex parsing fails, categorize based on name only
        r = 128;
        g = 128;
        b = 128;
    END;
    
    -- Calculate brightness and saturation
    brightness = (r + g + b) / 765.0;
    saturation = CASE 
        WHEN brightness = 0 THEN 0
        ELSE 1 - (LEAST(r, g, b) / GREATEST(r, g, b)::FLOAT)
    END;
    
    -- Nudes & Naturals (beige, tan, cream, brown tones)
    IF name ILIKE '%nude%' OR name ILIKE '%beige%' OR name ILIKE '%cream%' OR 
       name ILIKE '%tan%' OR name ILIKE '%sand%' OR name ILIKE '%wheat%' OR
       name ILIKE '%linen%' OR name ILIKE '%ecru%' OR name ILIKE '%biscuit%' OR
       name ILIKE '%mushroom%' OR name ILIKE '%taupe%' OR name ILIKE '%almond%' OR
       name ILIKE '%buff%' OR name ILIKE '%vanilla%' OR name ILIKE '%champagne%' OR
       name ILIKE '%khaki%' OR name ILIKE '%camel%' OR name ILIKE '%mocha%' OR
       name ILIKE '%cashmere%' OR name ILIKE '%oat%' OR
       -- Hex ranges for nudes
       clean_hex BETWEEN 'F5DEB3' AND 'FFE4C4' OR -- Beige tones
       clean_hex BETWEEN 'D2B48C' AND 'DEB887' OR -- Tan tones
       clean_hex BETWEEN 'BC8F8F' AND 'C19A6B' THEN -- Brown tones
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
       clean_hex BETWEEN 'FFF0F5' AND 'FFE4E1' THEN
        RETURN 'french';
    END IF;
    
    -- Reds (true reds, cherry, crimson)
    IF name ILIKE '%red%' AND name NOT ILIKE '%burgundy%' AND name NOT ILIKE '%wine%' OR
       name ILIKE '%crimson%' OR name ILIKE '%scarlet%' OR name ILIKE '%cherry%' OR
       name ILIKE '%ruby%' OR name ILIKE '%vermillion%' OR name ILIKE '%fire%' OR
       name ILIKE '%candy%' OR name ILIKE '%apple%' OR
       -- True red hex codes
       clean_hex BETWEEN 'FF0000' AND 'FF6B6B' OR
       clean_hex = 'DC143C' OR clean_hex = 'B22222' OR clean_hex = 'CD5C5C' THEN
        RETURN 'reds';
    END IF;
    
    -- Burgundy & Wine (deep reds, wines, berries)
    IF name ILIKE '%burgundy%' OR name ILIKE '%wine%' OR name ILIKE '%bordeaux%' OR
       name ILIKE '%oxblood%' OR name ILIKE '%mulberry%' OR name ILIKE '%berry%' OR
       name ILIKE '%plum%' OR name ILIKE '%merlot%' OR name ILIKE '%sangria%' OR
       name ILIKE '%maroon%' OR name ILIKE '%garnet%' OR
       -- Deep red/wine hex codes
       clean_hex BETWEEN '800020' AND '4C1130' OR
       clean_hex = '722F37' OR clean_hex = '5E2129' OR clean_hex = '8B2252' THEN
        RETURN 'burgundy';
    END IF;
    
    -- Pinks (all shades of pink)
    IF name ILIKE '%pink%' OR name ILIKE '%rose%' OR name ILIKE '%fuchsia%' OR
       name ILIKE '%magenta%' OR name ILIKE '%hot pink%' OR name ILIKE '%bubblegum%' OR
       name ILIKE '%blush%' OR name ILIKE '%flamingo%' OR name ILIKE '%carnation%' OR
       -- Pink hex codes
       clean_hex BETWEEN 'FFB6C1' AND 'FF69B4' OR
       clean_hex = 'FFC0CB' OR clean_hex = 'DB7093' OR clean_hex = 'FF6B9D' THEN
        RETURN 'pinks';
    END IF;
    
    -- Pastels (light, soft colors)
    IF name ILIKE '%pastel%' OR name ILIKE '%lavender%' OR name ILIKE '%lilac%' OR
       name ILIKE '%mint%' OR name ILIKE '%peach%' OR name ILIKE '%baby%' OR
       name ILIKE '%sky%' OR name ILIKE '%powder%' OR name ILIKE '%mist%' OR
       -- Pastel hex codes (light, desaturated)
       (brightness > 0.8 AND saturation < 0.3) OR
       clean_hex BETWEEN 'FFE4E2' AND 'F0E68D' OR
       clean_hex BETWEEN 'E0BBE4' AND 'C3E9D7' THEN
        RETURN 'pastels';
    END IF;
    
    -- Blues (all shades of blue, teal, turquoise)
    IF name ILIKE '%blue%' OR name ILIKE '%teal%' OR name ILIKE '%turquoise%' OR
       name ILIKE '%navy%' OR name ILIKE '%sky%' OR name ILIKE '%ocean%' OR
       name ILIKE '%denim%' OR name ILIKE '%azure%' OR name ILIKE '%cobalt%' OR
       name ILIKE '%sapphire%' OR name ILIKE '%cyan%' OR
       -- Blue hex codes
       clean_hex BETWEEN '000080' AND '87CEEB' OR
       clean_hex BETWEEN '00CED1' AND '40E0D0' OR
       clean_hex = '4682B4' OR clean_hex = '5F9EA0' OR clean_hex = '6495ED' THEN
        RETURN 'blues';
    END IF;
    
    -- Greens (all shades of green, mint, olive)
    IF name ILIKE '%green%' OR name ILIKE '%mint%' OR name ILIKE '%emerald%' OR
       name ILIKE '%forest%' OR name ILIKE '%lime%' OR name ILIKE '%olive%' OR
       name ILIKE '%sage%' OR name ILIKE '%sea%' OR name ILIKE '%jade%' OR
       name ILIKE '%pistachio%' OR name ILIKE '%moss%' OR
       -- Green hex codes
       clean_hex BETWEEN '228B22' AND '90EE90' OR
       clean_hex BETWEEN '00FF7F' AND '3CB371' OR
       clean_hex = '808000' OR clean_hex = '556B2F' OR clean_hex = '6B8E23' THEN
        RETURN 'greens';
    END IF;
    
    -- Purples & Violets
    IF name ILIKE '%purple%' OR name ILIKE '%violet%' OR name ILIKE '%orchid%' OR
       name ILIKE '%amethyst%' OR name ILIKE '%mauve%' OR name ILIKE '%lavender%' OR
       name ILIKE '%lilac%' OR name ILIKE '%iris%' OR name ILIKE '%eggplant%' OR
       -- Purple hex codes
       clean_hex BETWEEN '800080' AND 'DDA0DD' OR
       clean_hex = '9B59B6' OR clean_hex = '8E44AD' OR clean_hex = '9932CC' THEN
        RETURN 'purples';
    END IF;
    
    -- Metallics (gold, silver, chrome, glitter)
    IF name ILIKE '%gold%' OR name ILIKE '%silver%' OR name ILIKE '%chrome%' OR
       name ILIKE '%metallic%' OR name ILIKE '%platinum%' OR name ILIKE '%bronze%' OR
       name ILIKE '%copper%' OR name ILIKE '%steel%' OR name ILIKE '%iron%' OR
       name ILIKE '%glitter%' OR name ILIKE '%shimmer%' OR name ILIKE '%rose gold%' OR
       -- Metallic hex codes
       clean_hex = 'FFD700' OR clean_hex = 'C0C0C0' OR clean_hex = 'B87333' OR
       clean_hex = 'E5E4E2' OR clean_hex = 'B76E79' OR clean_hex = 'D4AF37' THEN
        RETURN 'metallics';
    END IF;
    
    -- Darks & Blacks (blacks, grays, dark colors)
    IF name ILIKE '%black%' OR name ILIKE '%gray%' OR name ILIKE '%grey%' OR
       name ILIKE '%charcoal%' OR name ILIKE '%slate%' OR name ILIKE '%graphite%' OR
       name ILIKE '%smoke%' OR name ILIKE '%ash%' OR name ILIKE '%ebony%' OR
       name ILIKE '%midnight%' OR name ILIKE '%onyx%' OR name ILIKE '%jet%' OR
       -- Dark hex codes
       brightness < 0.3 OR
       clean_hex BETWEEN '000000' AND '2F4F4F' OR
       clean_hex BETWEEN '696969' AND '808080' THEN
        RETURN 'darks';
    END IF;
    
    -- Trending (bright, vibrant colors that don't fit elsewhere)
    IF brightness > 0.7 AND saturation > 0.6 THEN
        RETURN 'trending';
    END IF;
    
    -- Default to trending
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