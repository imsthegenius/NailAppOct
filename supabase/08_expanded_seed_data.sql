-- ============================================================================
-- EXPANDED Seed Data for Nail App - 150+ Colors & Shapes
-- File: 06_seed_data_EXPANDED.sql
-- ============================================================================

-- First run the original seed data
-- Then add these additional colors for a comprehensive palette

-- ============================================================================
-- NAIL SHAPES SEED DATA
-- ============================================================================

INSERT INTO nail_shapes (shape_name, display_name, description, difficulty_level, maintenance_level, suitable_for, style_category, popularity_score) VALUES
('square', 'Square', 'Straight edges with sharp corners', 1, 2, ARRAY['wide_nails', 'short_fingers'], ARRAY['classic', 'professional'], 85),
('round', 'Round', 'Curved edges following natural nail shape', 1, 1, ARRAY['short_nails', 'wide_fingers'], ARRAY['classic', 'natural'], 90),
('oval', 'Oval', 'Egg-shaped with tapered sides', 2, 2, ARRAY['most_hands'], ARRAY['classic', 'elegant'], 95),
('almond', 'Almond', 'Tapered sides with rounded peak', 3, 3, ARRAY['long_fingers', 'narrow_nails'], ARRAY['modern', 'elegant'], 88),
('coffin', 'Coffin/Ballerina', 'Tapered sides with squared tip', 4, 4, ARRAY['long_nails'], ARRAY['modern', 'edgy'], 92),
('stiletto', 'Stiletto', 'Sharp pointed tip', 5, 5, ARRAY['long_fingers'], ARRAY['edgy', 'dramatic'], 75),
('squoval', 'Squoval', 'Square with rounded edges', 2, 2, ARRAY['most_hands'], ARRAY['classic', 'versatile'], 87),
('mountain_peak', 'Mountain Peak', 'Pointed with slight curve', 4, 4, ARRAY['long_nails'], ARRAY['modern', 'unique'], 70),
('lipstick', 'Lipstick', 'Angled asymmetric tip', 3, 3, ARRAY['medium_nails'], ARRAY['modern', 'playful'], 65),
('flare', 'Flare/Duck', 'Wide at tip, narrow at base', 3, 4, ARRAY['narrow_nails'], ARRAY['unique', 'dramatic'], 60)
ON CONFLICT (shape_name) DO NOTHING;

-- ============================================================================
-- ADDITIONAL NUDE & NEUTRAL COLORS (Essential for all skin tones)
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
-- Nudes for Fair Skin
('#FFF5F0', 'Porcelain', 'Dior', 'classic', 'cream', 82, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['elegant', 'minimal', 'clean']),
('#FAEBD7', 'Antique White', 'Chanel', 'classic', 'glossy', 78, ARRAY['spring', 'summer'], ARRAY['soft', 'romantic', 'vintage']),
('#FFE4C4', 'Bisque', 'YSL', 'classic', 'cream', 75, ARRAY['spring', 'summer'], ARRAY['natural', 'warm', 'subtle']),

-- Nudes for Light Skin
('#F5DEB3', 'Wheat', 'OPI', 'classic', 'glossy', 85, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['versatile', 'professional', 'natural']),
('#DEB887', 'Burlywood', 'Essie', 'classic', 'cream', 80, ARRAY['fall', 'winter'], ARRAY['warm', 'cozy', 'sophisticated']),
('#D2B48C', 'Tan', 'Sally Hansen', 'classic', 'glossy', 77, ARRAY['summer', 'fall'], ARRAY['natural', 'beachy', 'casual']),

-- Nudes for Medium Skin
('#C19A6B', 'Camel', 'Zoya', 'classic', 'cream', 83, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'warm', 'rich']),
('#BC9A6A', 'Café Crème', 'OPI', 'classic', 'glossy', 86, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['elegant', 'versatile', 'chic']),
('#A0826D', 'Burnished Brown', 'Essie', 'classic', 'cream', 79, ARRAY['fall', 'winter'], ARRAY['earthy', 'natural', 'grounded']),

-- Nudes for Tan Skin
('#9F8170', 'Beaver', 'Chanel', 'classic', 'glossy', 81, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'neutral', 'timeless']),
('#8B7355', 'French Beige', 'Dior', 'classic', 'cream', 84, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['classic', 'refined', 'professional']),
('#826644', 'Raw Umber', 'YSL', 'classic', 'glossy', 76, ARRAY['fall', 'winter'], ARRAY['bold', 'earthy', 'confident']),

-- Nudes for Deep Skin
('#734A12', 'Raw Sienna', 'MAC', 'classic', 'cream', 82, ARRAY['fall', 'winter'], ARRAY['rich', 'warm', 'luxurious']),
('#704214', 'Sepia', 'Zoya', 'classic', 'glossy', 80, ARRAY['fall', 'winter'], ARRAY['deep', 'sophisticated', 'bold']),
('#5C4033', 'Dark Brown', 'OPI', 'classic', 'cream', 78, ARRAY['fall', 'winter'], ARRAY['powerful', 'grounded', 'elegant']),

-- Nudes for Dark Skin
('#3D2914', 'Dark Chocolate', 'Essie', 'classic', 'glossy', 85, ARRAY['fall', 'winter'], ARRAY['luxurious', 'rich', 'indulgent']),
('#321414', 'Black Bean', 'Sally Hansen', 'classic', 'cream', 83, ARRAY['fall', 'winter'], ARRAY['bold', 'sophisticated', 'dramatic']),
('#2F1B14', 'Espresso', 'Chanel', 'classic', 'glossy', 87, ARRAY['fall', 'winter'], ARRAY['intense', 'powerful', 'chic'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- EXPANDED PINK PALETTE
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
('#FFC0CB', 'Bubblegum Pink', 'OPI', 'classic', 'glossy', 88, ARRAY['spring', 'summer'], ARRAY['playful', 'sweet', 'youthful']),
('#FFB7C5', 'Cherry Blossom', 'Essie', 'seasonal', 'shimmer', 92, ARRAY['spring'], ARRAY['romantic', 'delicate', 'feminine']),
('#FF91A4', 'Salmon Pink', 'Sally Hansen', 'classic', 'cream', 76, ARRAY['summer'], ARRAY['warm', 'coral', 'beachy']),
('#FF1493', 'Deep Pink', 'Chanel', 'classic', 'glossy', 85, ARRAY['summer', 'fall'], ARRAY['bold', 'vibrant', 'confident']),
('#C71585', 'Medium Violet Red', 'Dior', 'classic', 'cream', 79, ARRAY['fall', 'winter'], ARRAY['rich', 'luxurious', 'dramatic']),
('#DB7093', 'Pale Violet Red', 'YSL', 'classic', 'glossy', 77, ARRAY['spring', 'fall'], ARRAY['soft', 'vintage', 'romantic']),
('#F08080', 'Light Coral', 'Zoya', 'seasonal', 'cream', 82, ARRAY['summer'], ARRAY['tropical', 'warm', 'fresh']),
('#E75480', 'Dark Pink', 'OPI', 'classic', 'glossy', 83, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'bold', 'evening'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- EXPANDED RED PALETTE
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
('#FF0000', 'Pure Red', 'Chanel', 'classic', 'glossy', 95, ARRAY['fall', 'winter'], ARRAY['classic', 'bold', 'timeless']),
('#CD5C5C', 'Indian Red', 'Dior', 'classic', 'cream', 78, ARRAY['fall'], ARRAY['earthy', 'warm', 'sophisticated']),
('#F08080', 'Light Coral', 'YSL', 'seasonal', 'glossy', 82, ARRAY['summer'], ARRAY['soft', 'coral', 'beachy']),
('#FA8072', 'Salmon', 'Essie', 'seasonal', 'cream', 75, ARRAY['summer'], ARRAY['peachy', 'warm', 'natural']),
('#E9967A', 'Dark Salmon', 'OPI', 'seasonal', 'glossy', 73, ARRAY['summer', 'fall'], ARRAY['sunset', 'warm', 'vibrant']),
('#FFA07A', 'Light Salmon', 'Sally Hansen', 'seasonal', 'shimmer', 71, ARRAY['spring', 'summer'], ARRAY['delicate', 'fresh', 'coral']),
('#FF6347', 'Tomato', 'Zoya', 'seasonal', 'glossy', 80, ARRAY['summer'], ARRAY['bright', 'juicy', 'fun']),
('#FF4500', 'Orange Red', 'MAC', 'trending', 'cream', 85, ARRAY['summer', 'fall'], ARRAY['vibrant', 'energetic', 'bold'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- PURPLE & VIOLET PALETTE
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
('#800080', 'Purple', 'Chanel', 'classic', 'glossy', 82, ARRAY['fall', 'winter'], ARRAY['royal', 'mysterious', 'luxurious']),
('#8B008B', 'Dark Magenta', 'Dior', 'classic', 'cream', 79, ARRAY['fall', 'winter'], ARRAY['dramatic', 'bold', 'sophisticated']),
('#9932CC', 'Dark Orchid', 'YSL', 'seasonal', 'shimmer', 84, ARRAY['spring', 'fall'], ARRAY['exotic', 'vibrant', 'unique']),
('#8A2BE2', 'Blue Violet', 'Essie', 'trending', 'glossy', 86, ARRAY['spring', 'summer'], ARRAY['electric', 'modern', 'bold']),
('#9400D3', 'Violet', 'OPI', 'classic', 'cream', 77, ARRAY['spring'], ARRAY['floral', 'romantic', 'soft']),
('#DA70D6', 'Orchid', 'Sally Hansen', 'seasonal', 'shimmer', 81, ARRAY['spring', 'summer'], ARRAY['tropical', 'exotic', 'feminine']),
('#EE82EE', 'Medium Orchid', 'Zoya', 'seasonal', 'glossy', 78, ARRAY['spring'], ARRAY['playful', 'bright', 'cheerful']),
('#DDA0DD', 'Plum', 'MAC', 'classic', 'cream', 75, ARRAY['fall', 'winter'], ARRAY['muted', 'sophisticated', 'vintage'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- BLUE PALETTE
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
('#0000FF', 'Pure Blue', 'Chanel', 'classic', 'glossy', 80, ARRAY['summer'], ARRAY['bold', 'primary', 'striking']),
('#0000CD', 'Medium Blue', 'Dior', 'classic', 'cream', 76, ARRAY['summer', 'winter'], ARRAY['deep', 'rich', 'classic']),
('#00008B', 'Dark Blue', 'YSL', 'classic', 'glossy', 78, ARRAY['fall', 'winter'], ARRAY['navy', 'sophisticated', 'professional']),
('#4169E1', 'Royal Blue', 'Essie', 'classic', 'shimmer', 85, ARRAY['summer', 'winter'], ARRAY['regal', 'vibrant', 'luxurious']),
('#6495ED', 'Cornflower Blue', 'OPI', 'seasonal', 'cream', 82, ARRAY['spring', 'summer'], ARRAY['soft', 'dreamy', 'romantic']),
('#87CEEB', 'Sky Blue', 'Sally Hansen', 'seasonal', 'glossy', 88, ARRAY['summer'], ARRAY['fresh', 'airy', 'peaceful']),
('#87CEFA', 'Light Sky Blue', 'Zoya', 'seasonal', 'shimmer', 86, ARRAY['spring', 'summer'], ARRAY['ethereal', 'calm', 'serene']),
('#B0E0E6', 'Powder Blue', 'MAC', 'trending', 'cream', 90, ARRAY['spring'], ARRAY['soft', 'baby', 'delicate'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- GREEN PALETTE
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
('#008000', 'Green', 'Chanel', 'classic', 'glossy', 75, ARRAY['spring', 'summer'], ARRAY['natural', 'fresh', 'vibrant']),
('#006400', 'Dark Green', 'Dior', 'classic', 'cream', 72, ARRAY['fall', 'winter'], ARRAY['forest', 'deep', 'mysterious']),
('#228B22', 'Forest Green', 'YSL', 'seasonal', 'glossy', 74, ARRAY['fall', 'winter'], ARRAY['earthy', 'rich', 'natural']),
('#32CD32', 'Lime Green', 'Essie', 'trending', 'shimmer', 85, ARRAY['summer'], ARRAY['bright', 'energetic', 'fun']),
('#00FF00', 'Neon Green', 'OPI', 'trending', 'glossy', 88, ARRAY['summer'], ARRAY['electric', 'bold', 'modern']),
('#7CFC00', 'Lawn Green', 'Sally Hansen', 'seasonal', 'cream', 76, ARRAY['spring', 'summer'], ARRAY['fresh', 'grass', 'natural']),
('#7FFF00', 'Chartreuse', 'Zoya', 'trending', 'shimmer', 82, ARRAY['spring', 'summer'], ARRAY['unique', 'vibrant', 'modern']),
('#2E8B57', 'Sea Green', 'MAC', 'seasonal', 'glossy', 79, ARRAY['summer'], ARRAY['oceanic', 'tropical', 'refreshing'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- YELLOW & GOLD PALETTE
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
('#FFFF00', 'Pure Yellow', 'Chanel', 'seasonal', 'glossy', 82, ARRAY['summer'], ARRAY['sunny', 'bright', 'cheerful']),
('#FFD700', 'Gold', 'Dior', 'chrome', 'chrome', 90, ARRAY['fall', 'winter'], ARRAY['luxurious', 'golden', 'glamorous']),
('#FFA500', 'Orange', 'YSL', 'seasonal', 'cream', 78, ARRAY['summer', 'fall'], ARRAY['warm', 'vibrant', 'energetic']),
('#FF8C00', 'Dark Orange', 'Essie', 'seasonal', 'glossy', 76, ARRAY['fall'], ARRAY['autumn', 'warm', 'cozy']),
('#FFE4B5', 'Moccasin', 'OPI', 'classic', 'cream', 74, ARRAY['spring', 'summer'], ARRAY['neutral', 'soft', 'natural']),
('#FFDEAD', 'Navajo White', 'Sally Hansen', 'classic', 'glossy', 72, ARRAY['spring', 'summer'], ARRAY['warm', 'subtle', 'elegant']),
('#F0E68C', 'Khaki', 'Zoya', 'classic', 'cream', 70, ARRAY['fall'], ARRAY['earthy', 'muted', 'sophisticated']),
('#BDB76B', 'Dark Khaki', 'MAC', 'classic', 'glossy', 68, ARRAY['fall'], ARRAY['military', 'neutral', 'versatile'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- BLACK, WHITE & GRAY PALETTE
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
('#000000', 'Pure Black', 'Chanel', 'classic', 'glossy', 92, ARRAY['fall', 'winter'], ARRAY['edgy', 'sophisticated', 'timeless']),
('#FFFFFF', 'Pure White', 'Dior', 'french', 'glossy', 88, ARRAY['spring', 'summer'], ARRAY['clean', 'minimal', 'fresh']),
('#808080', 'Gray', 'YSL', 'classic', 'cream', 80, ARRAY['fall', 'winter'], ARRAY['neutral', 'modern', 'versatile']),
('#696969', 'Dim Gray', 'Essie', 'classic', 'glossy', 78, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'muted', 'professional']),
('#A9A9A9', 'Dark Gray', 'OPI', 'classic', 'cream', 76, ARRAY['fall', 'winter'], ARRAY['neutral', 'subtle', 'elegant']),
('#C0C0C0', 'Silver', 'Sally Hansen', 'chrome', 'chrome', 85, ARRAY['winter'], ARRAY['silver', 'futuristic', 'cool']),
('#D3D3D3', 'Light Gray', 'Zoya', 'classic', 'glossy', 74, ARRAY['spring', 'fall'], ARRAY['soft', 'neutral', 'minimal']),
('#DCDCDC', 'Gainsboro', 'MAC', 'classic', 'cream', 72, ARRAY['spring'], ARRAY['pale', 'subtle', 'delicate'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- SPECIAL EFFECTS & UNIQUE FINISHES
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags) VALUES
('#FFB6C1', 'Holographic Pink', 'ILNP', 'chrome', 'chrome', 95, ARRAY['spring', 'summer'], ARRAY['futuristic', 'magical', 'trendy']),
('#E0FFFF', 'Light Cyan Chrome', 'Holo Taco', 'chrome', 'chrome', 93, ARRAY['summer'], ARRAY['iridescent', 'dreamy', 'modern']),
('#F0FFFF', 'Azure Shimmer', 'ORLY', 'glitter', 'glitter', 88, ARRAY['winter'], ARRAY['sparkly', 'festive', 'glamorous']),
('#F5FFFA', 'Mint Cream Matte', 'Zoya', 'matte', 'matte', 82, ARRAY['spring'], ARRAY['modern', 'subtle', 'sophisticated']),
('#FFF8DC', 'Cornsilk Glitter', 'China Glaze', 'glitter', 'glitter', 79, ARRAY['summer'], ARRAY['sparkly', 'festive', 'fun'])
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
DO $$
DECLARE
    color_count INTEGER;
    shape_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO color_count FROM colors;
    SELECT COUNT(*) INTO shape_count FROM nail_shapes;
    
    RAISE NOTICE 'Seed data loaded successfully!';
    RAISE NOTICE 'Total colors in database: %', color_count;
    RAISE NOTICE 'Total nail shapes: %', shape_count;
    RAISE NOTICE 'Colors span all skin tones and include diverse finishes';
END $$;