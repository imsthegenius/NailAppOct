-- ============================================================================
-- Fix Color Categories for Mobile App
-- File: 10_fix_color_categories.sql
-- Purpose: Update colors table constraint and insert mobile app colors
-- ============================================================================

-- First, we need to drop the existing constraint and add a new one
ALTER TABLE colors DROP CONSTRAINT IF EXISTS colors_category_check;

-- Add new constraint with our expanded categories
ALTER TABLE colors ADD CONSTRAINT colors_category_check 
CHECK (category IN (
    'classic', 'seasonal', 'trending', 'french', 'chrome', 'glitter', 'matte',
    'reds', 'pinks', 'nudes', 'burgundies', 'oranges', 'corals',
    'purples', 'blues', 'greens', 'yellows', 'browns', 'grays',
    'blacks', 'whites', 'pastels', 'metallics'
));

-- Clear existing colors if any (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE colors CASCADE;

-- Insert all 108 nail colors organized by categories
INSERT INTO colors (hex_code, name, category, finish, mood_tags, season) VALUES
-- Reds (10 colors)
('#FF0000', 'Classic Red', 'reds', 'glossy', ARRAY['confident', 'bold'], ARRAY['winter', 'fall']),
('#DC143C', 'Crimson Passion', 'reds', 'glossy', ARRAY['romantic', 'elegant'], ARRAY['winter', 'fall']),
('#8B0000', 'Deep Burgundy Red', 'reds', 'cream', ARRAY['sophisticated', 'mysterious'], ARRAY['fall', 'winter']),
('#FF6B6B', 'Coral Red', 'reds', 'glossy', ARRAY['fun', 'vibrant'], ARRAY['summer', 'spring']),
('#CD5C5C', 'Indian Red', 'reds', 'matte', ARRAY['earthy', 'warm'], ARRAY['fall']),
('#B22222', 'Firebrick', 'reds', 'glossy', ARRAY['bold', 'edgy'], ARRAY['all']),
('#FF4444', 'Cherry Pop', 'reds', 'glossy', ARRAY['playful', 'sweet'], ARRAY['summer']),
('#E74C3C', 'Vermillion', 'reds', 'cream', ARRAY['artistic', 'vibrant'], ARRAY['all']),
('#C0392B', 'Pomegranate', 'reds', 'glossy', ARRAY['rich', 'luxurious'], ARRAY['fall', 'winter']),
('#A93226', 'Rust Red', 'reds', 'matte', ARRAY['vintage', 'warm'], ARRAY['fall']),

-- Pinks (10 colors)
('#FFC0CB', 'Baby Pink', 'pinks', 'glossy', ARRAY['sweet', 'innocent'], ARRAY['spring']),
('#FF69B4', 'Hot Pink', 'pinks', 'glossy', ARRAY['fun', 'bold'], ARRAY['summer']),
('#FF1493', 'Deep Pink', 'pinks', 'glossy', ARRAY['vibrant', 'energetic'], ARRAY['all']),
('#DB7093', 'Pale Violet Red', 'pinks', 'cream', ARRAY['romantic', 'soft'], ARRAY['spring']),
('#F08080', 'Light Coral Pink', 'pinks', 'glossy', ARRAY['delicate', 'warm'], ARRAY['summer', 'spring']),
('#FFB6C1', 'Light Pink', 'pinks', 'glossy', ARRAY['gentle', 'feminine'], ARRAY['spring']),
('#FFA0C9', 'Carnation Pink', 'pinks', 'glossy', ARRAY['cheerful', 'sweet'], ARRAY['all']),
('#F8BBD0', 'Powder Pink', 'pinks', 'matte', ARRAY['subtle', 'elegant'], ARRAY['all']),
('#EC407A', 'Strawberry Pink', 'pinks', 'glossy', ARRAY['juicy', 'fresh'], ARRAY['summer']),
('#AD1457', 'Magenta Wine', 'pinks', 'cream', ARRAY['sophisticated', 'bold'], ARRAY['fall', 'winter']),

-- Nudes (10 colors)
('#F5DEB3', 'Nude Beige', 'nudes', 'cream', ARRAY['natural', 'professional'], ARRAY['all']),
('#FFE4E1', 'Misty Rose', 'nudes', 'glossy', ARRAY['subtle', 'romantic'], ARRAY['all']),
('#FAEBD7', 'Antique White', 'nudes', 'matte', ARRAY['classic', 'timeless'], ARRAY['all']),
('#FFF8DC', 'Cornsilk Nude', 'nudes', 'glossy', ARRAY['warm', 'gentle'], ARRAY['all']),
('#F5F5DC', 'Natural Beige', 'nudes', 'cream', ARRAY['minimal', 'clean'], ARRAY['all']),
('#E6B8A2', 'Dusty Rose', 'nudes', 'matte', ARRAY['vintage', 'soft'], ARRAY['all']),
('#D2B48C', 'Tan Nude', 'nudes', 'cream', ARRAY['warm', 'natural'], ARRAY['all']),
('#C8B88B', 'Sand Nude', 'nudes', 'matte', ARRAY['beachy', 'relaxed'], ARRAY['summer']),
('#F4E4C1', 'Cream Nude', 'nudes', 'glossy', ARRAY['luxurious', 'smooth'], ARRAY['all']),
('#E5C4A1', 'Peachy Nude', 'nudes', 'glossy', ARRAY['fresh', 'glowing'], ARRAY['spring', 'summer']),

-- Burgundies (8 colors)
('#800020', 'Classic Burgundy', 'burgundies', 'glossy', ARRAY['elegant', 'sophisticated'], ARRAY['fall', 'winter']),
('#6B2737', 'Wine Burgundy', 'burgundies', 'cream', ARRAY['rich', 'luxurious'], ARRAY['fall', 'winter']),
('#4C1130', 'Plum Burgundy', 'burgundies', 'glossy', ARRAY['mysterious', 'deep'], ARRAY['winter']),
('#722F37', 'Wine Stain', 'burgundies', 'matte', ARRAY['vintage', 'bold'], ARRAY['fall']),
('#943543', 'Bordeaux', 'burgundies', 'glossy', ARRAY['french', 'chic'], ARRAY['all']),
('#5E2129', 'Oxblood', 'burgundies', 'cream', ARRAY['edgy', 'modern'], ARRAY['fall', 'winter']),
('#8B2252', 'Mulberry', 'burgundies', 'glossy', ARRAY['romantic', 'deep'], ARRAY['fall']),
('#6F1E51', 'Berry Burgundy', 'burgundies', 'matte', ARRAY['rich', 'warm'], ARRAY['winter']),

-- Oranges (6 colors)
('#FFA500', 'Bright Orange', 'oranges', 'glossy', ARRAY['energetic', 'fun'], ARRAY['summer']),
('#FF8C00', 'Dark Orange', 'oranges', 'cream', ARRAY['warm', 'vibrant'], ARRAY['fall']),
('#FF7F50', 'Coral Orange', 'oranges', 'glossy', ARRAY['tropical', 'fresh'], ARRAY['summer']),
('#FF6347', 'Tomato Orange', 'oranges', 'glossy', ARRAY['bold', 'juicy'], ARRAY['summer']),
('#FF4500', 'Red Orange', 'oranges', 'matte', ARRAY['fiery', 'intense'], ARRAY['all']),
('#D2691E', 'Chocolate Orange', 'oranges', 'cream', ARRAY['warm', 'cozy'], ARRAY['fall']),

-- Corals (6 colors)
('#FF7F51', 'Living Coral', 'corals', 'glossy', ARRAY['trendy', 'vibrant'], ARRAY['summer', 'spring']),
('#F88379', 'Light Coral', 'corals', 'glossy', ARRAY['soft', 'feminine'], ARRAY['spring']),
('#FA8072', 'Salmon Coral', 'corals', 'cream', ARRAY['warm', 'peachy'], ARRAY['all']),
('#E9967A', 'Dark Salmon', 'corals', 'matte', ARRAY['sophisticated', 'muted'], ARRAY['fall']),
('#FFA07A', 'Light Salmon', 'corals', 'glossy', ARRAY['delicate', 'fresh'], ARRAY['spring', 'summer']),
('#FF6B9D', 'Pink Coral', 'corals', 'glossy', ARRAY['playful', 'bright'], ARRAY['summer']),

-- Purples (8 colors)
('#800080', 'Classic Purple', 'purples', 'glossy', ARRAY['royal', 'mysterious'], ARRAY['all']),
('#9B59B6', 'Amethyst', 'purples', 'glossy', ARRAY['luxurious', 'spiritual'], ARRAY['all']),
('#8E44AD', 'Deep Purple', 'purples', 'cream', ARRAY['rich', 'bold'], ARRAY['fall', 'winter']),
('#DA70D6', 'Orchid', 'purples', 'glossy', ARRAY['exotic', 'elegant'], ARRAY['spring']),
('#BA55D3', 'Medium Orchid', 'purples', 'glossy', ARRAY['vibrant', 'playful'], ARRAY['all']),
('#9400D3', 'Violet', 'purples', 'matte', ARRAY['artistic', 'creative'], ARRAY['all']),
('#E6E6FA', 'Lavender', 'purples', 'glossy', ARRAY['calm', 'serene'], ARRAY['spring']),
('#D8BFD8', 'Thistle', 'purples', 'cream', ARRAY['soft', 'romantic'], ARRAY['spring']),

-- Blues (8 colors)
('#000080', 'Navy Blue', 'blues', 'glossy', ARRAY['professional', 'classic'], ARRAY['all']),
('#4169E1', 'Royal Blue', 'blues', 'glossy', ARRAY['bold', 'confident'], ARRAY['all']),
('#1E90FF', 'Dodger Blue', 'blues', 'glossy', ARRAY['bright', 'energetic'], ARRAY['summer']),
('#87CEEB', 'Sky Blue', 'blues', 'glossy', ARRAY['peaceful', 'airy'], ARRAY['spring', 'summer']),
('#4682B4', 'Steel Blue', 'blues', 'matte', ARRAY['modern', 'cool'], ARRAY['all']),
('#5F9EA0', 'Cadet Blue', 'blues', 'cream', ARRAY['sophisticated', 'muted'], ARRAY['fall']),
('#B0E0E6', 'Powder Blue', 'blues', 'glossy', ARRAY['soft', 'dreamy'], ARRAY['spring']),
('#191970', 'Midnight Blue', 'blues', 'cream', ARRAY['mysterious', 'deep'], ARRAY['winter']),

-- Greens (8 colors)
('#228B22', 'Forest Green', 'greens', 'glossy', ARRAY['natural', 'earthy'], ARRAY['all']),
('#32CD32', 'Lime Green', 'greens', 'glossy', ARRAY['fresh', 'vibrant'], ARRAY['spring', 'summer']),
('#3CB371', 'Sea Green', 'greens', 'glossy', ARRAY['tropical', 'refreshing'], ARRAY['summer']),
('#2E8B57', 'Sea Green Dark', 'greens', 'matte', ARRAY['deep', 'rich'], ARRAY['all']),
('#808000', 'Olive', 'greens', 'cream', ARRAY['vintage', 'military'], ARRAY['fall']),
('#9ACD32', 'Yellow Green', 'greens', 'glossy', ARRAY['bright', 'cheerful'], ARRAY['spring']),
('#98FB98', 'Pale Green', 'greens', 'glossy', ARRAY['soft', 'gentle'], ARRAY['spring']),
('#556B2F', 'Dark Olive', 'greens', 'matte', ARRAY['sophisticated', 'earthy'], ARRAY['fall']),

-- Yellows (5 colors)
('#FFFF00', 'Bright Yellow', 'yellows', 'glossy', ARRAY['cheerful', 'sunny'], ARRAY['summer']),
('#FFD700', 'Gold Yellow', 'yellows', 'shimmer', ARRAY['luxurious', 'warm'], ARRAY['all']),
('#F0E68C', 'Khaki Yellow', 'yellows', 'matte', ARRAY['muted', 'natural'], ARRAY['fall']),
('#FFFFE0', 'Light Yellow', 'yellows', 'glossy', ARRAY['soft', 'delicate'], ARRAY['spring']),
('#BDB76B', 'Dark Khaki', 'yellows', 'cream', ARRAY['earthy', 'warm'], ARRAY['fall']),

-- Browns (6 colors)
('#8B4513', 'Saddle Brown', 'browns', 'cream', ARRAY['rustic', 'warm'], ARRAY['fall']),
('#A52A2A', 'Red Brown', 'browns', 'glossy', ARRAY['rich', 'earthy'], ARRAY['fall']),
('#D26900', 'Chocolate', 'browns', 'glossy', ARRAY['sweet', 'luxurious'], ARRAY['all']),
('#BC8F8F', 'Rosy Brown', 'browns', 'matte', ARRAY['soft', 'vintage'], ARRAY['all']),
('#F4A460', 'Sandy Brown', 'browns', 'glossy', ARRAY['warm', 'beachy'], ARRAY['summer']),
('#8B7355', 'Burlywood Dark', 'browns', 'cream', ARRAY['natural', 'cozy'], ARRAY['fall']),

-- Grays (6 colors)
('#808080', 'Classic Gray', 'grays', 'glossy', ARRAY['neutral', 'modern'], ARRAY['all']),
('#A9A9A9', 'Dark Gray', 'grays', 'matte', ARRAY['sophisticated', 'urban'], ARRAY['all']),
('#D3D3D3', 'Light Gray', 'grays', 'glossy', ARRAY['soft', 'minimal'], ARRAY['all']),
('#C0C0C0', 'Silver Gray', 'grays', 'shimmer', ARRAY['elegant', 'metallic'], ARRAY['winter']),
('#696969', 'Dim Gray', 'grays', 'cream', ARRAY['professional', 'understated'], ARRAY['all']),
('#2F4F4F', 'Dark Slate', 'grays', 'matte', ARRAY['dramatic', 'moody'], ARRAY['winter']),

-- Blacks (4 colors)
('#000000', 'Pure Black', 'blacks', 'glossy', ARRAY['bold', 'edgy'], ARRAY['all']),
('#0C0C0C', 'Charcoal', 'blacks', 'matte', ARRAY['sophisticated', 'modern'], ARRAY['all']),
('#1C1C1C', 'Jet Black', 'blacks', 'cream', ARRAY['luxurious', 'deep'], ARRAY['all']),
('#2B2B2B', 'Soft Black', 'blacks', 'glossy', ARRAY['subtle', 'refined'], ARRAY['all']),

-- Whites (4 colors)
('#FFFFFF', 'Pure White', 'whites', 'glossy', ARRAY['clean', 'fresh'], ARRAY['all']),
('#F8F8FF', 'Ghost White', 'whites', 'matte', ARRAY['ethereal', 'soft'], ARRAY['all']),
('#FFFAFA', 'Snow White', 'whites', 'glossy', ARRAY['pristine', 'bright'], ARRAY['winter']),
('#F5F5F5', 'White Smoke', 'whites', 'cream', ARRAY['subtle', 'neutral'], ARRAY['all']),

-- Pastels (8 colors)
('#FFE4E2', 'Misty Rose Pastel', 'pastels', 'glossy', ARRAY['soft', 'romantic'], ARRAY['spring']),
('#E0BBE4', 'Lavender Pastel', 'pastels', 'glossy', ARRAY['dreamy', 'gentle'], ARRAY['spring']),
('#CDB4E7', 'Lilac Pastel', 'pastels', 'matte', ARRAY['sweet', 'calm'], ARRAY['spring']),
('#BFEFFF', 'Baby Blue Pastel', 'pastels', 'glossy', ARRAY['innocent', 'pure'], ARRAY['spring', 'summer']),
('#C3E9D7', 'Mint Pastel', 'pastels', 'glossy', ARRAY['fresh', 'cool'], ARRAY['spring', 'summer']),
('#FFF4E0', 'Peach Pastel', 'pastels', 'cream', ARRAY['warm', 'soft'], ARRAY['spring']),
('#FFDAB9', 'Peach Puff', 'pastels', 'glossy', ARRAY['delicate', 'sweet'], ARRAY['spring']),
('#F0E68D', 'Khaki Pastel', 'pastels', 'matte', ARRAY['subtle', 'natural'], ARRAY['all'])

ON CONFLICT (hex_code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    finish = EXCLUDED.finish,
    mood_tags = EXCLUDED.mood_tags,
    season = EXCLUDED.season;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully updated color categories and inserted 108 colors!';
END $$;