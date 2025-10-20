-- ============================================================================
-- Update Categories with Constraint Modification
-- File: 17_update_categories_with_constraint.sql
-- Purpose: Update category constraint and reorganize colors for mobile app
-- ============================================================================

-- Step 1: Drop the existing check constraint
ALTER TABLE colors DROP CONSTRAINT colors_category_check;

-- Step 2: Add new check constraint with mobile app categories
ALTER TABLE colors ADD CONSTRAINT colors_category_check 
CHECK (category IN ('trending', 'nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'metallics', 'darks'));

-- Step 3: Update existing colors to match mobile app categories

-- Update Trending colors (keep existing trending category)
UPDATE colors 
SET category = 'trending'
WHERE category IN ('trending');

-- Update Nudes & Naturals (from classic category)
UPDATE colors 
SET category = 'nudes'
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
);

-- Update Reds (from classic category)
UPDATE colors 
SET category = 'reds'
WHERE category = 'classic' 
AND (
  name ILIKE '%red%' OR 
  name ILIKE '%crimson%' OR
  name ILIKE '%scarlet%' OR
  name ILIKE '%ruby%' OR
  name ILIKE '%cherry%' OR
  name ILIKE '%fire%' OR
  hex_code IN ('#FF0000', '#DC143C', '#8B0000', '#FF6B6B', '#CD5C5C', '#B22222', '#FF4444', '#E74C3C', '#E34234', '#D2691E')
);

-- Update Burgundy & Wine (from classic category)
UPDATE colors 
SET category = 'burgundy'
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
);

-- Update Pastels (from classic and seasonal categories)
UPDATE colors 
SET category = 'pastels'
WHERE (category = 'classic' OR category = 'seasonal')
AND (
  name ILIKE '%pastel%' OR 
  name ILIKE '%lavender%' OR
  name ILIKE '%lilac%' OR
  name ILIKE '%mint%' OR
  name ILIKE '%peach%' OR
  name ILIKE '%pink%' OR
  name ILIKE '%rose%' OR
  name ILIKE '%baby%' OR
  hex_code IN ('#FFE4E2', '#E0BBE4', '#CDB4E7', '#BFEFFF', '#C3E9D7', '#FFF4E0', '#FFDAB9', '#F0E68D', '#E6E6FA', '#F0E68C')
);

-- Update French (keep existing french category)
UPDATE colors 
SET category = 'french'
WHERE category IN ('french');

-- Update Blues (from classic and seasonal categories)
UPDATE colors 
SET category = 'blues'
WHERE (category = 'classic' OR category = 'seasonal')
AND (
  name ILIKE '%blue%' OR 
  name ILIKE '%teal%' OR
  name ILIKE '%turquoise%' OR
  name ILIKE '%navy%' OR
  name ILIKE '%sky%' OR
  name ILIKE '%ocean%' OR
  name ILIKE '%denim%' OR
  hex_code IN ('#000080', '#4169E1', '#87CEEB', '#00CED1', '#40E0D0', '#48D1CC', '#5F9EA0', '#4682B4', '#6495ED', '#00BFFF')
);

-- Update Greens (from classic and seasonal categories)
UPDATE colors 
SET category = 'greens'
WHERE (category = 'classic' OR category = 'seasonal')
AND (
  name ILIKE '%green%' OR 
  name ILIKE '%mint%' OR
  name ILIKE '%emerald%' OR
  name ILIKE '%forest%' OR
  name ILIKE '%lime%' OR
  name ILIKE '%olive%' OR
  name ILIKE '%sage%' OR
  hex_code IN ('#228B22', '#98FB98', '#00FF7F', '#90EE90', '#00FA9A', '#3CB371', '#2E8B57', '#32CD32', '#00FF00', '#7CFC00')
);

-- Update Purples (from classic category)
UPDATE colors 
SET category = 'purples'
WHERE category = 'classic' 
AND (
  name ILIKE '%purple%' OR 
  name ILIKE '%violet%' OR
  name ILIKE '%magenta%' OR
  name ILIKE '%orchid%' OR
  name ILIKE '%amethyst%' OR
  name ILIKE '%mauve%' OR
  hex_code IN ('#800080', '#9B59B6', '#E6E6FA', '#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB', '#8A2BE2', '#9932CC', '#4B0082')
);

-- Update Metallics (from chrome category)
UPDATE colors 
SET category = 'metallics'
WHERE category IN ('chrome');

-- Update Darks (from classic category)
UPDATE colors 
SET category = 'darks'
WHERE category = 'classic' 
AND (
  name ILIKE '%black%' OR 
  name ILIKE '%dark%' OR
  name ILIKE '%midnight%' OR
  name ILIKE '%ebony%' OR
  name ILIKE '%charcoal%' OR
  name ILIKE '%onyx%' OR
  hex_code IN ('#000000', '#2F4F4F', '#696969', '#36454F', '#1C1C1C', '#0A0A0A', '#2F2F2F', '#3D3D3D', '#4B4B4D', '#555555')
);

-- Update any remaining unclassified classic colors to nudes
UPDATE colors 
SET category = 'nudes'
WHERE category = 'classic';

-- Update any remaining unclassified seasonal colors to pastels
UPDATE colors 
SET category = 'pastels'
WHERE category = 'seasonal';

-- Move glitter colors to metallics (as they're often metallic/glitter finishes)
UPDATE colors 
SET category = 'metallics'
WHERE category = 'glitter';

-- Move matte colors to appropriate categories based on names
UPDATE colors 
SET category = 
  CASE 
    WHEN name ILIKE '%red%' THEN 'reds'
    WHEN name ILIKE '%burgundy%' OR name ILIKE '%wine%' THEN 'burgundy'
    WHEN name ILIKE '%blue%' THEN 'blues'
    WHEN name ILIKE '%green%' THEN 'greens'
    WHEN name ILIKE '%purple%' OR name ILIKE '%violet%' THEN 'purples'
    WHEN name ILIKE '%black%' OR name ILIKE '%dark%' THEN 'darks'
    WHEN name ILIKE '%pink%' OR name ILIKE '%pastel%' OR name ILIKE '%lavender%' THEN 'pastels'
    WHEN name ILIKE '%nude%' OR name ILIKE '%beige%' OR name ILIKE '%natural%' THEN 'nudes'
    ELSE 'trending'
  END
WHERE category = 'matte';

-- ============================================================================
-- INSERT additional colors to fill out mobile app categories
-- ============================================================================

-- Insert additional French colors
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#FFFFFF', 'Pure White', 'OPI', 'french', 'cream', 90, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['classic', 'clean', 'elegant'], '11-0601 TPX'),
('#FFC0CB', 'Baby Pink', 'Essie', 'french', 'glossy', 85, ARRAY['spring', 'summer'], ARRAY['romantic', 'feminine', 'sweet'], '13-1408 TPX'),
('#F0E68C', 'Khaki', 'Sally Hansen', 'french', 'cream', 78, ARRAY['fall'], ARRAY['natural', 'understated', 'casual'], '14-0950 TPX'),
('#FFF8DC', 'Cornsilk', 'Chanel', 'french', 'glossy', 82, ARRAY['spring', 'summer'], ARRAY['soft', 'warm', 'delicate'], '11-0610 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Insert additional Blues colors
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#00BFFF', 'Deep Sky Blue', 'OPI', 'blues', 'glossy', 87, ARRAY['summer'], ARRAY['vibrant', 'energetic', 'fresh'], '17-4041 TPX'),
('#1E90FF', 'Dodger Blue', 'Essie', 'blues', 'cream', 84, ARRAY['spring', 'summer'], ARRAY['bright', 'cheerful', 'playful'], '17-4133 TPX'),
('#00CED1', 'Dark Turquoise', 'Sally Hansen', 'blues', 'shimmer', 82, ARRAY['summer'], ARRAY['exotic', 'tropical', 'refreshing'], '15-5519 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Insert additional Greens colors
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#90EE90', 'Light Green', 'OPI', 'greens', 'cream', 81, ARRAY['spring'], ARRAY['fresh', 'natural', 'renewing'], '13-0445 TPX'),
('#00FA9A', 'Medium Spring Green', 'Essie', 'greens', 'glossy', 83, ARRAY['spring', 'summer'], ARRAY['vibrant', 'energetic', 'youthful'], '14-0122 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Insert additional Metallics colors
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#C0C0C0', 'Silver Chrome', 'OPI', 'metallics', 'chrome', 92, ARRAY['fall', 'winter'], ARRAY['metallic', 'cool', 'modern'], '16-3900 TPX'),
('#B87333', 'Gold Bronze', 'Essie', 'metallics', 'chrome', 88, ARRAY['fall'], ARRAY['warm', 'luxurious', 'rich'], '17-0940 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- Verify the updates
-- ============================================================================

-- Check count by category
SELECT category, COUNT(*) as color_count
FROM colors
GROUP BY category
ORDER BY color_count DESC;

-- Check trending scores
SELECT category, AVG(trending_score) as avg_trending_score
FROM colors
GROUP BY category
ORDER BY avg_trending_score DESC;

-- Total colors
SELECT COUNT(*) as total_colors FROM colors;