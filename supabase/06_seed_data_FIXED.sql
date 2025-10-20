-- ============================================================================
-- FIXED: Seed Data for Nail App
-- This version fixes the duplicate hex_code issue
-- ============================================================================

-- Clear existing data first (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE colors CASCADE;

-- Use ON CONFLICT to handle duplicates
-- This will skip inserting if hex_code already exists

-- ============================================================================
-- CLASSIC COLORS
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Classic Reds
('#DC143C', 'Crimson Red', 'OPI', 'classic', 'glossy', 85, ARRAY['fall', 'winter'], ARRAY['confident', 'bold', 'classic'], 'P 48-8 C'),
('#C30F23', 'Big Apple Red', 'OPI', 'classic', 'glossy', 90, ARRAY['fall', 'winter'], ARRAY['confident', 'bold', 'professional'], '18-1763 TPX'),
('#B22222', 'Fire Engine Red', 'Essie', 'classic', 'glossy', 80, ARRAY['fall', 'winter'], ARRAY['bold', 'dramatic', 'confident'], '18-1664 TPX'),
('#8B0000', 'Dark Ruby', 'Chanel', 'classic', 'glossy', 75, ARRAY['fall', 'winter'], ARRAY['elegant', 'sophisticated', 'dramatic'], '19-1663 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Classic Pinks
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#FFB6C1', 'Light Pink', 'Essie', 'classic', 'glossy', 70, ARRAY['spring', 'summer'], ARRAY['romantic', 'soft', 'feminine'], '12-1304 TPX'),
('#F8E4E6', 'Ballet Slippers', 'Essie', 'classic', 'glossy', 95, ARRAY['spring', 'summer'], ARRAY['romantic', 'soft', 'classic'], '11-2511 TPX'),
('#FFD1DC', 'Powder Pink', 'OPI', 'classic', 'glossy', 78, ARRAY['spring', 'summer'], ARRAY['romantic', 'gentle', 'feminine'], '12-1305 TPX'),
('#FF69B4', 'Hot Pink', 'Sally Hansen', 'classic', 'glossy', 82, ARRAY['summer'], ARRAY['bold', 'fun', 'confident'], '17-2034 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Classic Nudes & Neutrals
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#F5DEB3', 'Nude Beige', 'OPI', 'classic', 'glossy', 88, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['professional', 'elegant', 'versatile'], '12-0304 TPX'),
('#D4B5A0', 'Café au Lait', 'Essie', 'classic', 'glossy', 85, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'warm', 'professional'], '14-1012 TPX'),
('#F5E6D3', 'Vanilla Cream', 'Sally Hansen', 'classic', 'glossy', 82, ARRAY['spring', 'summer'], ARRAY['soft', 'natural', 'elegant'], '11-0602 TPX'),
('#E6D3C7', 'Mushroom', 'Chanel', 'classic', 'glossy', 72, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'elegant', 'natural'], '14-1210 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- TRENDING COLORS 2024-2025
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Glazed Donut Trend (note: #F5E6D3 might already exist as Vanilla Cream)
('#F5E6D8', 'Glazed Donut', 'OPI', 'trending', 'chrome', 100, ARRAY['spring', 'summer'], ARRAY['trendy', 'natural', 'chic'], '12-0404 TPX'),
('#E8D5C4', 'Milk Bath', 'Essie', 'trending', 'chrome', 98, ARRAY['spring', 'summer'], ARRAY['trendy', 'soft', 'minimalist'], '13-1015 TPX'),
('#F0E2D0', 'Vanilla Latte', 'Sally Hansen', 'trending', 'shimmer', 92, ARRAY['spring', 'summer'], ARRAY['trendy', 'cozy', 'natural'], '12-0605 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Blueberry Milk Trend - use different hex codes for variations
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#B8C5E6', 'Blueberry Milk', 'OPI', 'trending', 'cream', 95, ARRAY['spring', 'summer'], ARRAY['trendy', 'soft', 'dreamy'], '14-3612 TPX'),
('#D6D6FA', 'Lavender Milk', 'Essie', 'trending', 'cream', 93, ARRAY['spring', 'summer'], ARRAY['trendy', 'ethereal', 'soft'], '14-3613 TPX'),
('#C5C5E0', 'Periwinkle Dream', 'Sally Hansen', 'trending', 'shimmer', 91, ARRAY['spring', 'summer'], ARRAY['trendy', 'dreamy', 'romantic'], '14-3614 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Chrome and Metallic Trend
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#FFB6C1', 'Chrome Pink', 'OPI', 'trending', 'chrome', 94, ARRAY['spring', 'summer'], ARRAY['bold', 'futuristic', 'trendy'], '13-2520 TPX'),
('#C0C0C0', 'Silver Chrome', 'Essie', 'trending', 'chrome', 90, ARRAY['fall', 'winter'], ARRAY['futuristic', 'edgy', 'modern'], '14-4002 TPX'),
('#FFD700', 'Gold Chrome', 'Sally Hansen', 'trending', 'chrome', 88, ARRAY['fall', 'winter'], ARRAY['luxurious', 'bold', 'glamorous'], '14-0846 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Red Theory Colors
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#C41E3A', 'Red Theory Classic', 'OPI', 'trending', 'glossy', 96, ARRAY['fall', 'winter'], ARRAY['confident', 'bold', 'viral'], '18-1664 TPX'),
('#8B0020', 'Deep Wine Theory', 'Essie', 'trending', 'glossy', 92, ARRAY['fall', 'winter'], ARRAY['mysterious', 'sophisticated', 'viral'], '19-1726 TPX'),
('#DC2C44', 'Bright Theory Red', 'Sally Hansen', 'trending', 'glossy', 90, ARRAY['spring', 'summer'], ARRAY['vibrant', 'confident', 'viral'], '17-1937 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- SEASONAL COLORS
-- ============================================================================

-- Spring Collection
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#FFE4E1', 'Misty Rose', 'OPI', 'seasonal', 'glossy', 75, ARRAY['spring'], ARRAY['romantic', 'soft', 'feminine'], '11-1602 TPX'),
('#E6E6FA', 'Lilac Breeze', 'Sally Hansen', 'seasonal', 'glossy', 72, ARRAY['spring'], ARRAY['soft', 'romantic', 'dreamy'], '14-3612 TPX'),
('#98FB98', 'Mint Green', 'Essie', 'seasonal', 'glossy', 70, ARRAY['spring'], ARRAY['fresh', 'natural', 'calming'], '13-0117 TPX'),
('#F0E68C', 'Khaki Yellow', 'China Glaze', 'seasonal', 'glossy', 68, ARRAY['spring'], ARRAY['cheerful', 'warm', 'optimistic'], '13-0633 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Summer Collection
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#00CED1', 'Turquoise Sea', 'OPI', 'seasonal', 'glossy', 78, ARRAY['summer'], ARRAY['vibrant', 'tropical', 'refreshing'], '15-5519 TPX'),
('#FF7F50', 'Coral Sunset', 'Essie', 'seasonal', 'glossy', 76, ARRAY['summer'], ARRAY['warm', 'cheerful', 'tropical'], '16-1546 TPX'),
('#FFDAB9', 'Peach Bellini', 'Sally Hansen', 'seasonal', 'glossy', 74, ARRAY['summer'], ARRAY['soft', 'warm', 'feminine'], '12-0912 TPX'),
('#00FA9A', 'Seafoam Green', 'China Glaze', 'seasonal', 'glossy', 72, ARRAY['summer'], ARRAY['fresh', 'tropical', 'vibrant'], '14-5721 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Fall Collection
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#D2691E', 'Cinnamon Spice', 'OPI', 'seasonal', 'glossy', 80, ARRAY['fall'], ARRAY['warm', 'cozy', 'autumnal'], '18-1142 TPX'),
('#8B4513', 'Saddle Brown', 'Essie', 'seasonal', 'matte', 77, ARRAY['fall'], ARRAY['earthy', 'sophisticated', 'warm'], '18-1048 TPX'),
('#B22234', 'Firebrick Red', 'Sally Hansen', 'seasonal', 'glossy', 75, ARRAY['fall'], ARRAY['bold', 'warm', 'dramatic'], '18-1550 TPX'),
('#483D8B', 'Dark Slate Blue', 'China Glaze', 'seasonal', 'glossy', 73, ARRAY['fall'], ARRAY['mysterious', 'deep', 'sophisticated'], '19-3933 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Winter Collection
INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#2F4F4F', 'Midnight Green', 'OPI', 'seasonal', 'glossy', 82, ARRAY['winter'], ARRAY['elegant', 'deep', 'sophisticated'], '19-5414 TPX'),
('#4B0082', 'Royal Purple', 'Essie', 'seasonal', 'shimmer', 79, ARRAY['winter'], ARRAY['luxurious', 'regal', 'dramatic'], '18-3838 TPX'),
('#800020', 'Burgundy Wine', 'Sally Hansen', 'seasonal', 'glossy', 77, ARRAY['winter'], ARRAY['rich', 'elegant', 'sophisticated'], '19-1724 TPX'),
('#000080', 'Navy Blue', 'China Glaze', 'seasonal', 'glossy', 75, ARRAY['winter'], ARRAY['classic', 'professional', 'timeless'], '19-3933 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- FRENCH MANICURE VARIATIONS
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#FFFFFF', 'Classic White Tip', 'OPI', 'french', 'glossy', 85, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['classic', 'clean', 'timeless'], '11-0601 TPX'),
('#FFF5EE', 'Seashell Tips', 'Essie', 'french', 'glossy', 80, ARRAY['spring', 'summer'], ARRAY['soft', 'natural', 'elegant'], '11-0602 TPX'),
('#F5F5DC', 'Beige Tips', 'Sally Hansen', 'french', 'glossy', 78, ARRAY['fall', 'winter'], ARRAY['subtle', 'sophisticated', 'modern'], '12-0703 TPX'),
-- Using different hex for French Lavender to avoid duplicate
('#E0E0FA', 'French Lavender', 'China Glaze', 'french', 'glossy', 75, ARRAY['spring'], ARRAY['modern', 'soft', 'trendy'], '14-3612 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- CHROME AND METALLIC FINISHES
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#E8B4B8', 'Rose Gold Chrome', 'OPI', 'chrome', 'chrome', 92, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['luxurious', 'trendy', 'feminine'], '14-1508 TPX'),
('#B8860B', 'Champagne Gold', 'Essie', 'chrome', 'chrome', 88, ARRAY['fall', 'winter'], ARRAY['celebratory', 'luxurious', 'elegant'], '15-1050 TPX'),
('#4682B4', 'Steel Blue Chrome', 'Sally Hansen', 'chrome', 'chrome', 85, ARRAY['winter'], ARRAY['modern', 'cool', 'futuristic'], '17-4037 TPX'),
('#9370DB', 'Purple Chrome', 'China Glaze', 'chrome', 'chrome', 83, ARRAY['fall', 'winter'], ARRAY['mystical', 'bold', 'futuristic'], '17-3628 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- Print summary
SELECT 
    category,
    finish,
    COUNT(*) as count
FROM colors
GROUP BY category, finish
ORDER BY category, finish;