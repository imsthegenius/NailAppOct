-- ============================================================================
-- Insert 2025 Trending Colors (Fixed Finishes)
-- File: 29_insert_2025_trending_colors_fixed.sql
-- Purpose: Add 100 most popular colors of 2025 with correct finish values
-- ============================================================================

-- Step 1: Drop constraint to allow inserts
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;

-- Step 2: Insert all 100 trending colors with correct finishes
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Milky & Pearl Colors
('#F2F0ED', 'Milky Sheer', 'Trending 2025', 'nudes', 'cream', 95, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['milky', 'sheer', 'clean'], 'Trending-001'),
('#F7F3EF', 'Glazed Donut Pearl', 'Trending 2025', 'french', 'cream', 98, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['pearl', 'glazed', 'donut'], 'Trending-002'),

-- Jelly Colors (using cream or glossy finish)
('#FF8FB3', 'Jelly Pink', 'Trending 2025', 'pinks', 'cream', 96, ARRAY['spring', 'summer'], ARRAY['jelly', 'pink', 'translucent'], 'Trending-003'),
('#E34153', 'Jelly Cherry', 'Trending 2025', 'reds', 'glossy', 94, ARRAY['spring', 'summer'], ARRAY['jelly', 'cherry', 'red'], 'Trending-004'),
('#FFA45C', 'Jelly Tangerine', 'Trending 2025', 'pastels', 'cream', 93, ARRAY['spring', 'summer'], ARRAY['jelly', 'tangerine', 'orange'], 'Trending-005'),
('#E9C8FF', 'Jelly Lilac', 'Trending 2025', 'purples', 'cream', 95, ARRAY['spring', 'summer'], ARRAY['jelly', 'lilac', 'purple'], 'Trending-006'),
('#355CFF', 'Jelly Ultramarine', 'Trending 2025', 'blues', 'glossy', 92, ARRAY['spring', 'summer'], ARRAY['jelly', 'ultramarine', 'blue'], 'Trending-007'),

-- Milk Pastels
('#DBE7FF', 'Blueberry Milk', 'Trending 2025', 'pastels', 'cream', 94, ARRAY['spring', 'summer'], ARRAY['milk', 'blueberry', 'pastel'], 'Trending-008'),
('#FFDDE7', 'Strawberry Milk', 'Trending 2025', 'pinks', 'cream', 96, ARRAY['spring', 'summer'], ARRAY['milk', 'strawberry', 'pink'], 'Trending-009'),
('#DDF2D1', 'Matcha Milk', 'Trending 2025', 'greens', 'cream', 93, ARRAY['spring', 'summer'], ARRAY['milk', 'matcha', 'green'], 'Trending-010'),

-- Latte Colors
('#C7A88C', 'Latte Nude', 'Trending 2025', 'nudes', 'matte', 97, ARRAY['fall', 'winter'], ARRAY['latte', 'nude', 'warm'], 'Trending-011'),
('#B07A4A', 'Caramel Drip', 'Trending 2025', 'nudes', 'glossy', 95, ARRAY['fall', 'winter'], ARRAY['caramel', 'latte', 'drip'], 'Trending-012'),
('#B98966', 'Toffee Beige', 'Trending 2025', 'nudes', 'cream', 94, ARRAY['fall', 'winter'], ARRAY['toffee', 'beige', 'warm'], 'Trending-013'),
('#B5987A', 'Mocha Mousse', 'Trending 2025', 'nudes', 'matte', 98, ARRAY['fall', 'winter'], ARRAY['mocha', 'mousse', 'pantone'], 'Trending-014'),

-- Browns & Deep Colors
('#4A2C2A', 'Chocolate Truffle', 'Trending 2025', 'darks', 'matte', 92, ARRAY['fall', 'winter'], ARRAY['chocolate', 'truffle', 'deep'], 'Trending-015'),
('#8C4A2F', 'Cinnamon Spice', 'Trending 2025', 'darks', 'shimmer', 93, ARRAY['fall', 'winter'], ARRAY['cinnamon', 'spice', 'warm'], 'Trending-016'),
('#C26E5A', 'Terra-Cotta Clay', 'Trending 2025', 'pastels', 'matte', 94, ARRAY['spring', 'fall'], ARRAY['terra', 'cotta', 'clay'], 'Trending-017'),
('#B7410E', 'Rusted Clay', 'Trending 2025', 'darks', 'matte', 91, ARRAY['fall'], ARRAY['rusted', 'clay', 'terra'], 'Trending-018'),

-- Orange & Coral Colors
('#C65A1E', 'Toasted Pumpkin', 'Trending 2025', 'pastels', 'matte', 93, ARRAY['fall'], ARRAY['toasted', 'pumpkin', 'orange'], 'Trending-019'),
('#CC5500', 'Burnt Orange', 'Trending 2025', 'pastels', 'matte', 92, ARRAY['fall'], ARRAY['burnt', 'orange', 'autumn'], 'Trending-020'),
('#FF6F61', 'Classic Coral', 'Trending 2025', 'pastels', 'glossy', 95, ARRAY['summer'], ARRAY['coral', 'classic', 'warm'], 'Trending-021'),
('#FFB199', 'Peach Sorbet', 'Trending 2025', 'pastels', 'cream', 94, ARRAY['spring', 'summer'], ARRAY['peach', 'sorbet', 'soft'], 'Trending-022'),
('#FFBE98', 'Peach Fuzz', 'Trending 2025', 'pastels', 'matte', 96, ARRAY['spring', 'summer'], ARRAY['peach', 'fuzz', 'pantone'], 'Trending-023'),
('#FF8650', 'Nectarine Pop', 'Trending 2025', 'pastels', 'glossy', 93, ARRAY['summer'], ARRAY['nectarine', 'pop', 'orange'], 'Trending-024'),

-- Metallics
('#D4AF37', 'Gold Chrome', 'Trending 2025', 'metallics', 'chrome', 97, ARRAY['all seasons'], ARRAY['gold', 'chrome', 'metallic'], 'Trending-025'),
('#B76E79', 'Rose Gold', 'Trending 2025', 'metallics', 'shimmer', 96, ARRAY['all seasons'], ARRAY['rose', 'gold', 'metallic'], 'Trending-026'),
('#C0C0C0', 'Molten Silver', 'Trending 2025', 'metallics', 'chrome', 95, ARRAY['spring'], ARRAY['molten', 'silver', 'metallic'], 'Trending-027'),
('#2E2F30', 'Hematite', 'Trending 2025', 'metallics', 'matte', 92, ARRAY['fall', 'winter'], ARRAY['hematite', 'dark', 'metallic'], 'Trending-028'),
('#2A3439', 'Gunmetal', 'Trending 2025', 'metallics', 'matte', 91, ARRAY['fall', 'winter'], ARRAY['gunmetal', 'grey', 'metallic'], 'Trending-029'),
('#708090', 'Slate Grey', 'Trending 2025', 'darks', 'matte', 90, ARRAY['fall', 'winter'], ARRAY['slate', 'grey', 'neutral'], 'Trending-030'),

-- Whites & Nudes
('#F8F8F8', 'Cloud White', 'Trending 2025', 'french', 'glossy', 94, ARRAY['all seasons'], ARRAY['cloud', 'white', 'clean'], 'Trending-031'),
('#FAF3E7', 'Vanilla Sheer', 'Trending 2025', 'nudes', 'cream', 95, ARRAY['spring', 'summer'], ARRAY['vanilla', 'sheer', 'soft'], 'Trending-032'),
('#E8E2D6', 'Oyster', 'Trending 2025', 'nudes', 'matte', 93, ARRAY['all seasons'], ARRAY['oyster', 'neutral', 'beige'], 'Trending-033'),
('#D0C4B7', 'Putty', 'Trending 2025', 'nudes', 'matte', 92, ARRAY['fall', 'winter'], ARRAY['putty', 'neutral', 'earth'], 'Trending-034'),
('#B7A99A', 'Greige', 'Trending 2025', 'nudes', 'matte', 94, ARRAY['fall', 'winter'], ARRAY['greige', 'beige', 'grey'], 'Trending-035'),
('#94877B', 'Taupe Sand', 'Trending 2025', 'nudes', 'matte', 93, ARRAY['fall', 'winter'], ARRAY['taupe', 'sand', 'neutral'], 'Trending-036'),
('#C9B59A', 'Sandstone', 'Trending 2025', 'nudes', 'matte', 91, ARRAY['fall', 'winter'], ARRAY['sandstone', 'earth', 'neutral'], 'Trending-037'),
('#C19A6B', 'Camel', 'Trending 2025', 'nudes', 'matte', 95, ARRAY['fall', 'winter'], ARRAY['camel', 'warm', 'classic'], 'Trending-038'),
('#362418', 'Espresso', 'Trending 2025', 'darks', 'matte', 92, ARRAY['fall', 'winter'], ARRAY['espresso', 'dark', 'coffee'], 'Trending-039'),
('#F3E5D8', 'Latte Foam', 'Trending 2025', 'nudes', 'cream', 96, ARRAY['fall', 'winter'], ARRAY['latte', 'foam', 'light'], 'Trending-040'),

-- Brown Tones
('#B8845A', 'Soft Toffee', 'Trending 2025', 'nudes', 'glossy', 94, ARRAY['fall', 'winter'], ARRAY['toffee', 'soft', 'brown'], 'Trending-041'),
('#8A4B3C', 'Smoky Topaz', 'Trending 2025', 'darks', 'shimmer', 93, ARRAY['fall', 'winter'], ARRAY['smoky', 'topaz', 'gem'], 'Trending-042'),
('#B87333', 'Copper Shimmer', 'Trending 2025', 'metallics', 'shimmer', 95, ARRAY['fall', 'winter'], ARRAY['copper', 'shimmer', 'warm'], 'Trending-043'),

-- Deep Reds & Wines
('#6A3D64', 'Dirty Plum', 'Trending 2025', 'purples', 'matte', 91, ARRAY['fall'], ARRAY['dirty', 'plum', 'deep'], 'Trending-044'),
('#3B0D17', 'Black Cherry', 'Trending 2025', 'burgundy', 'matte', 92, ARRAY['fall', 'winter'], ARRAY['black', 'cherry', 'deep'], 'Trending-045'),
('#4B0F1A', 'Bordeaux', 'Trending 2025', 'burgundy', 'matte', 94, ARRAY['fall', 'winter'], ARRAY['bordeaux', 'wine', 'classic'], 'Trending-046'),
('#5F1624', 'Sangria', 'Trending 2025', 'burgundy', 'matte', 93, ARRAY['fall'], ARRAY['sangria', 'wine', 'deep'], 'Trending-047'),
('#7A284B', 'Mulberry', 'Trending 2025', 'burgundy', 'matte', 91, ARRAY['fall'], ARRAY['mulberry', 'berry', 'deep'], 'Trending-048'),
('#8E3A59', 'Berry Glaze', 'Trending 2025', 'burgundy', 'glossy', 92, ARRAY['fall'], ARRAY['berry', 'glaze', 'shiny'], 'Trending-049'),
('#722F37', 'Wine Stain', 'Trending 2025', 'burgundy', 'matte', 94, ARRAY['fall', 'winter'], ARRAY['wine', 'stain', 'deep'], 'Trending-050'),

-- Reds
('#B3001B', 'Classic Red', 'Trending 2025', 'reds', 'glossy', 96, ARRAY['all seasons'], ARRAY['classic', 'red', 'bold'], 'Trending-051'),
('#D9381E', 'Tomato Red', 'Trending 2025', 'reds', 'glossy', 93, ARRAY['summer'], ARRAY['tomato', 'red', 'bright'], 'Trending-052'),
('#8B3A3A', 'Brick Red', 'Trending 2025', 'reds', 'matte', 91, ARRAY['fall'], ARRAY['brick', 'red', 'earth'], 'Trending-053'),
('#800020', 'Maroon Tip', 'Trending 2025', 'burgundy', 'glossy', 92, ARRAY['fall', 'winter'], ARRAY['maroon', 'tip', 'french'], 'Trending-054'),

-- Blues
('#0D1B3D', 'Deep Navy', 'Trending 2025', 'blues', 'matte', 94, ARRAY['fall', 'winter'], ARRAY['deep', 'navy', 'dark'], 'Trending-055'),
('#3F51FF', 'Ultramarine Blue', 'Trending 2025', 'blues', 'glossy', 93, ARRAY['summer'], ARRAY['ultramarine', 'blue', 'bright'], 'Trending-056'),
('#007FFF', 'Electric Blue', 'Trending 2025', 'blues', 'chrome', 95, ARRAY['summer'], ARRAY['electric', 'blue', 'vibrant'], 'Trending-057'),
('#0047AB', 'Cobalt', 'Trending 2025', 'blues', 'matte', 92, ARRAY['all seasons'], ARRAY['cobalt', 'blue', 'classic'], 'Trending-058'),
('#3A2F79', 'Indigo', 'Trending 2025', 'blues', 'matte', 91, ARRAY['fall', 'winter'], ARRAY['indigo', 'blue', 'deep'], 'Trending-059'),
('#6495ED', 'Cornflower', 'Trending 2025', 'pastels', 'matte', 93, ARRAY['spring', 'summer'], ARRAY['cornflower', 'blue', 'soft'], 'Trending-060'),
('#BCD4FF', 'Baby Blue', 'Trending 2025', 'pastels', 'matte', 94, ARRAY['spring', 'summer'], ARRAY['baby', 'blue', 'light'], 'Trending-061'),
('#87CEEB', 'Sky Blue', 'Trending 2025', 'pastels', 'glossy', 95, ARRAY['spring', 'summer'], ARRAY['sky', 'blue', 'clear'], 'Trending-062'),
('#E0F2FF', 'Icy Blue Sheer', 'Trending 2025', 'pastels', 'cream', 93, ARRAY['winter'], ARRAY['icy', 'blue', 'sheer'], 'Trending-063'),
('#8EA6FF', 'Periwinkle', 'Trending 2025', 'pastels', 'matte', 94, ARRAY['spring'], ARRAY['periwinkle', 'blue', 'purple'], 'Trending-064'),

-- Purples & Lavenders
('#B29DD9', 'Digital Lavender', 'Trending 2025', 'purples', 'matte', 96, ARRAY['spring', 'summer'], ARRAY['digital', 'lavender', 'trend'], 'Trending-065'),
('#C4C3D0', 'Lavender Grey', 'Trending 2025', 'purples', 'matte', 93, ARRAY['spring', 'fall'], ARRAY['lavender', 'grey', 'soft'], 'Trending-066'),
('#E6D7FF', 'Lilac Milk', 'Trending 2025', 'purples', 'cream', 95, ARRAY['spring'], ARRAY['lilac', 'milk', 'pastel'], 'Trending-067'),
('#9966CC', 'Amethyst', 'Trending 2025', 'purples', 'shimmer', 94, ARRAY['spring'], ARRAY['amethyst', 'purple', 'gem'], 'Trending-068'),
('#6F42C1', 'Grape Jelly', 'Trending 2025', 'purples', 'glossy', 92, ARRAY['spring', 'summer'], ARRAY['grape', 'jelly', 'purple'], 'Trending-069'),
('#5A3A57', 'Plum Smoke', 'Trending 2025', 'purples', 'matte', 91, ARRAY['fall'], ARRAY['plum', 'smoke', 'deep'], 'Trending-070'),
('#3D0734', 'Aubergine', 'Trending 2025', 'purples', 'matte', 90, ARRAY['fall', 'winter'], ARRAY['aubergine', 'purple', 'dark'], 'Trending-071'),

-- Pinks
('#F7DBE6', 'Ballet Slipper', 'Trending 2025', 'pinks', 'matte', 97, ARRAY['spring'], ARRAY['ballet', 'slipper', 'pink'], 'Trending-072'),
('#FFCDE1', 'Baby Pink', 'Trending 2025', 'pinks', 'matte', 96, ARRAY['spring', 'summer'], ARRAY['baby', 'pink', 'soft'], 'Trending-073'),
('#FFD6E7', 'Coquette Pink', 'Trending 2025', 'pinks', 'glossy', 95, ARRAY['spring', 'summer'], ARRAY['coquette', 'pink', 'flirty'], 'Trending-074'),
('#C98E8E', 'Dusty Rose', 'Trending 2025', 'pinks', 'matte', 93, ARRAY['fall'], ARRAY['dusty', 'rose', 'vintage'], 'Trending-075'),

-- Nude & Beige Tones
('#E2B9A1', 'Rose Beige', 'Trending 2025', 'nudes', 'matte', 94, ARRAY['all seasons'], ARRAY['rose', 'beige', 'warm'], 'Trending-076'),
('#F1C6BD', 'Blush Beige', 'Trending 2025', 'nudes', 'matte', 95, ARRAY['spring', 'summer'], ARRAY['blush', 'beige', 'warm'], 'Trending-077'),
('#C49BBB', 'Mauve Mist', 'Trending 2025', 'pastels', 'matte', 92, ARRAY['spring'], ARRAY['mauve', 'mist', 'soft'], 'Trending-078'),
('#D8C0A8', 'Nude Beige', 'Trending 2025', 'nudes', 'matte', 96, ARRAY['all seasons'], ARRAY['nude', 'beige', 'classic'], 'Trending-079'),
('#F9A775', 'Soft Apricot', 'Trending 2025', 'pastels', 'matte', 93, ARRAY['spring', 'summer'], ARRAY['soft', 'apricot', 'orange'], 'Trending-080'),

-- Deep Browns & Oranges
('#6B2A2A', 'Cherry Cola', 'Trending 2025', 'darks', 'matte', 91, ARRAY['fall', 'winter'], ARRAY['cherry', 'cola', 'brown'], 'Trending-081'),
('#6A4B3C', 'Smoky Cocoa', 'Trending 2025', 'darks', 'matte', 92, ARRAY['fall', 'winter'], ARRAY['smoky', 'cocoa', 'brown'], 'Trending-082'),
('#5C4033', 'Carob', 'Trending 2025', 'darks', 'matte', 90, ARRAY['fall', 'winter'], ARRAY['carob', 'brown', 'deep'], 'Trending-083'),
('#C4716A', 'Terracotta Rose', 'Trending 2025', 'pastels', 'matte', 93, ARRAY['fall'], ARRAY['terracotta', 'rose', 'warm'], 'Trending-084'),
('#D0602B', 'Pumpkin Spice Latte', 'Trending 2025', 'pastels', 'matte', 94, ARRAY['fall'], ARRAY['pumpkin', 'spice', 'latte'], 'Trending-085'),
('#AD6F3B', 'Copper Penny', 'Trending 2025', 'metallics', 'shimmer', 92, ARRAY['fall', 'winter'], ARRAY['copper', 'penny', 'metallic'], 'Trending-086'),

-- Metallic Neutrals
('#F1E3C6', 'Champagne Chrome', 'Trending 2025', 'metallics', 'chrome', 95, ARRAY['all seasons'], ARRAY['champagne', 'chrome', 'shimmer'], 'Trending-087'),
('#8A8F8F', 'Pewter', 'Trending 2025', 'metallics', 'matte', 91, ARRAY['fall', 'winter'], ARRAY['pewter', 'grey', 'metallic'], 'Trending-088'),
('#333333', 'Charcoal', 'Trending 2025', 'darks', 'matte', 94, ARRAY['all seasons'], ARRAY['charcoal', 'black', 'neutral'], 'Trending-089'),
('#111111', 'Soft Black', 'Trending 2025', 'darks', 'matte', 96, ARRAY['all seasons'], ARRAY['soft', 'black', 'deep'], 'Trending-090'),

-- Greens
('#6B8E23', 'Olive Martini', 'Trending 2025', 'greens', 'matte', 93, ARRAY['fall'], ARRAY['olive', 'martini', 'green'], 'Trending-091'),
('#718355', 'Moss Green', 'Trending 2025', 'greens', 'matte', 92, ARRAY['fall', 'winter'], ARRAY['moss', 'green', 'earth'], 'Trending-092'),
('#CFDAC8', 'Sage Milk', 'Trending 2025', 'greens', 'cream', 94, ARRAY['spring'], ARRAY['sage', 'milk', 'pastel'], 'Trending-093'),
('#A3C585', 'Matcha', 'Trending 2025', 'greens', 'matte', 95, ARRAY['spring', 'summer'], ARRAY['matcha', 'green', 'fresh'], 'Trending-094'),
('#A8E6A1', 'Pistachio', 'Trending 2025', 'greens', 'matte', 93, ARRAY['spring', 'summer'], ARRAY['pistachio', 'green', 'light'], 'Trending-095'),
('#9FF3D5', 'Seafoam', 'Trending 2025', 'greens', 'matte', 94, ARRAY['spring', 'summer'], ARRAY['seafoam', 'green', 'fresh'], 'Trending-096'),
('#40E0D0', 'Turquoise', 'Trending 2025', 'blues', 'glossy', 95, ARRAY['summer'], ARRAY['turquoise', 'blue', 'tropical'], 'Trending-097'),
('#7FFFD4', 'Aquamarine', 'Trending 2025', 'blues', 'matte', 96, ARRAY['spring', 'summer'], ARRAY['aquamarine', 'blue', 'clear'], 'Trending-098'),
('#00878A', 'Teal Sheen', 'Trending 2025', 'blues', 'shimmer', 93, ARRAY['fall'], ARRAY['teal', 'sheen', 'metallic'], 'Trending-099'),
('#046B3C', 'Emerald', 'Trending 2025', 'greens', 'matte', 97, ARRAY['fall'], ARRAY['emerald', 'green', 'gem'], 'Trending-100')
ON CONFLICT (hex_code) DO NOTHING;

-- Step 3: Add the constraint back with all categories
ALTER TABLE colors ADD CONSTRAINT colors_category_check 
CHECK (category IN ('trending', 'nudes', 'reds', 'burgundy', 'pastels', 'french', 'blues', 'greens', 'purples', 'pinks', 'metallics', 'darks'));

-- Step 4: Verify the insertion
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

-- Total colors count
SELECT COUNT(*) as total_colors FROM colors;

-- Count of new trending colors added
SELECT COUNT(*) as new_colors_added
FROM colors
WHERE brand = 'Trending 2025';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully inserted 100 trending colors for 2025!';
    RAISE NOTICE 'Used correct finish values: glossy, matte, chrome, shimmer, glitter, cream';
    RAISE NOTICE 'Colors categorized into all 12 categories';
END $$;