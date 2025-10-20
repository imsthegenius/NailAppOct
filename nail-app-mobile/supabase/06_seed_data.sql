-- ============================================================================
-- Seed Data for Nail App
-- File: 06_seed_data.sql
-- Purpose: Insert initial data including popular nail colors and categories
-- ============================================================================

-- ============================================================================
-- CLASSIC COLORS
-- Timeless nail polish shades that are always in style
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Classic Reds
('#DC143C', 'Crimson Red', 'OPI', 'classic', 'glossy', 85, ARRAY['fall', 'winter'], ARRAY['confident', 'bold', 'classic'], 'P 48-8 C'),
('#C30F23', 'Big Apple Red', 'OPI', 'classic', 'glossy', 90, ARRAY['fall', 'winter'], ARRAY['confident', 'bold', 'professional'], '18-1763 TPX'),
('#B22222', 'Fire Engine Red', 'Essie', 'classic', 'glossy', 80, ARRAY['fall', 'winter'], ARRAY['bold', 'dramatic', 'confident'], '18-1664 TPX'),
('#8B0000', 'Dark Ruby', 'Chanel', 'classic', 'glossy', 75, ARRAY['fall', 'winter'], ARRAY['elegant', 'sophisticated', 'dramatic'], '19-1663 TPX'),

-- Classic Pinks
('#FFB6C1', 'Light Pink', 'Essie', 'classic', 'glossy', 70, ARRAY['spring', 'summer'], ARRAY['romantic', 'soft', 'feminine'], '12-1304 TPX'),
('#F8E4E6', 'Ballet Slippers', 'Essie', 'classic', 'glossy', 95, ARRAY['spring', 'summer'], ARRAY['romantic', 'soft', 'classic'], '11-2511 TPX'),
('#FFD1DC', 'Powder Pink', 'OPI', 'classic', 'glossy', 78, ARRAY['spring', 'summer'], ARRAY['romantic', 'gentle', 'feminine'], '12-1305 TPX'),
('#FF69B4', 'Hot Pink', 'Sally Hansen', 'classic', 'glossy', 82, ARRAY['summer'], ARRAY['bold', 'fun', 'confident'], '17-2034 TPX'),

-- Classic Nudes & Neutrals
('#F5DEB3', 'Nude Beige', 'OPI', 'classic', 'glossy', 88, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['professional', 'elegant', 'versatile'], '12-0605 TPX'),
('#DDB892', 'Sandy Nude', 'Essie', 'classic', 'glossy', 85, ARRAY['spring', 'summer', 'fall'], ARRAY['natural', 'professional', 'versatile'], '13-1015 TPX'),
('#F4E4BC', 'Vanilla Cream', 'Sally Hansen', 'classic', 'cream', 75, ARRAY['spring', 'summer'], ARRAY['soft', 'natural', 'professional'], '11-0507 TPX'),
('#E6D3C7', 'Mushroom', 'Chanel', 'classic', 'glossy', 72, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'elegant', 'natural'], '14-1210 TPX');

-- ============================================================================
-- TRENDING COLORS 2024-2025
-- Current popular shades and viral colors
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Glazed Donut Trend
('#F5E6D3', 'Glazed Donut', 'OPI', 'trending', 'chrome', 100, ARRAY['spring', 'summer'], ARRAY['trendy', 'natural', 'chic'], '12-0404 TPX'),
('#E8D5C4', 'Milk Bath', 'Essie', 'trending', 'chrome', 98, ARRAY['spring', 'summer'], ARRAY['trendy', 'soft', 'minimalist'], '13-1015 TPX'),
('#F0E2D0', 'Vanilla Latte', 'Sally Hansen', 'trending', 'shimmer', 92, ARRAY['spring', 'summer'], ARRAY['trendy', 'cozy', 'natural'], '12-0605 TPX'),

-- Blueberry Milk Trend
('#E6E6FA', 'Blueberry Milk', 'OPI', 'trending', 'cream', 95, ARRAY['spring', 'summer'], ARRAY['trendy', 'soft', 'dreamy'], '14-3612 TPX'),
('#B8C5E6', 'Periwinkle Dreams', 'Essie', 'trending', 'glossy', 90, ARRAY['spring', 'summer'], ARRAY['trendy', 'calm', 'ethereal'], '15-3915 TPX'),
('#D8BFD8', 'Lavender Haze', 'Sally Hansen', 'trending', 'glossy', 88, ARRAY['spring'], ARRAY['trendy', 'romantic', 'dreamy'], '15-3207 TPX'),

-- Chrome Trend
('#C0C0C0', 'Chrome Silver', 'OPI', 'trending', 'chrome', 93, ARRAY['fall', 'winter'], ARRAY['futuristic', 'bold', 'edgy'], 'P 179-1 C'),
('#FFD700', 'Chrome Gold', 'Essie', 'trending', 'chrome', 91, ARRAY['fall', 'winter'], ARRAY['luxurious', 'bold', 'glamorous'], '13-0859 TPX'),
('#FFC0CB', 'Chrome Pink', 'Sally Hansen', 'trending', 'chrome', 89, ARRAY['spring', 'summer'], ARRAY['trendy', 'bold', 'futuristic'], '12-1304 TPX');

-- ============================================================================
-- SEASONAL COLORS
-- Colors that peak during specific seasons
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Spring Colors
('#98FB98', 'Mint Fresh', 'OPI', 'seasonal', 'glossy', 70, ARRAY['spring'], ARRAY['fresh', 'energizing', 'optimistic'], '13-0221 TPX'),
('#FFB347', 'Peach Blossom', 'Essie', 'seasonal', 'glossy', 75, ARRAY['spring'], ARRAY['warm', 'cheerful', 'romantic'], '15-1247 TPX'),
('#E6E6FA', 'Lilac Breeze', 'Sally Hansen', 'seasonal', 'glossy', 72, ARRAY['spring'], ARRAY['soft', 'romantic', 'dreamy'], '14-3612 TPX'),
('#F0E68C', 'Sunny Daffodil', 'China Glaze', 'seasonal', 'glossy', 68, ARRAY['spring'], ARRAY['cheerful', 'energizing', 'optimistic'], '12-0752 TPX'),

-- Summer Colors
('#FF6347', 'Coral Sunset', 'OPI', 'seasonal', 'glossy', 82, ARRAY['summer'], ARRAY['vibrant', 'energetic', 'fun'], '16-1546 TPX'),
('#40E0D0', 'Turquoise Waters', 'Essie', 'seasonal', 'glossy', 80, ARRAY['summer'], ARRAY['tropical', 'refreshing', 'adventurous'], '15-5519 TPX'),
('#FFD700', 'Sunshine Yellow', 'Sally Hansen', 'seasonal', 'glossy', 65, ARRAY['summer'], ARRAY['bright', 'cheerful', 'bold'], '13-0859 TPX'),
('#FF1493', 'Fuchsia Fever', 'China Glaze', 'seasonal', 'glossy', 77, ARRAY['summer'], ARRAY['bold', 'fun', 'confident'], '18-2436 TPX'),

-- Fall Colors
('#A0522D', 'Cinnamon Spice', 'OPI', 'seasonal', 'glossy', 78, ARRAY['fall'], ARRAY['cozy', 'warm', 'sophisticated'], '18-1142 TPX'),
('#D2691E', 'Burnt Orange', 'Essie', 'seasonal', 'glossy', 75, ARRAY['fall'], ARRAY['warm', 'earthy', 'bold'], '16-1459 TPX'),
('#8B4513', 'Chocolate Brown', 'Sally Hansen', 'seasonal', 'glossy', 70, ARRAY['fall'], ARRAY['rich', 'sophisticated', 'earthy'], '19-1314 TPX'),
('#800080', 'Deep Plum', 'China Glaze', 'seasonal', 'glossy', 73, ARRAY['fall'], ARRAY['sophisticated', 'dramatic', 'rich'], '19-2524 TPX'),

-- Winter Colors
('#191970', 'Midnight Blue', 'OPI', 'seasonal', 'glossy', 72, ARRAY['winter'], ARRAY['sophisticated', 'elegant', 'dramatic'], '19-4052 TPX'),
('#2F4F4F', 'Slate Gray', 'Essie', 'seasonal', 'matte', 68, ARRAY['winter'], ARRAY['modern', 'sophisticated', 'minimalist'], '18-4005 TPX'),
('#8B008B', 'Royal Purple', 'Sally Hansen', 'seasonal', 'glossy', 74, ARRAY['winter'], ARRAY['regal', 'dramatic', 'sophisticated'], '19-3536 TPX'),
('#000000', 'Jet Black', 'China Glaze', 'seasonal', 'glossy', 76, ARRAY['winter'], ARRAY['dramatic', 'edgy', 'classic'], '19-0303 TPX');

-- ============================================================================
-- FRENCH MANICURE COLORS
-- Traditional and modern French manicure shades
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Classic French
('#FFFFFF', 'French White', 'OPI', 'french', 'glossy', 85, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['classic', 'professional', 'clean'], '11-0601 TPX'),
('#FFF8DC', 'French Cream', 'Essie', 'french', 'glossy', 82, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['classic', 'elegant', 'soft'], '11-0507 TPX'),

-- Modern French Variations
('#FFB6C1', 'French Pink', 'Sally Hansen', 'french', 'glossy', 80, ARRAY['spring', 'summer'], ARRAY['romantic', 'modern', 'feminine'], '12-1304 TPX'),
('#E6E6FA', 'French Lavender', 'China Glaze', 'french', 'glossy', 75, ARRAY['spring'], ARRAY['modern', 'soft', 'trendy'], '14-3612 TPX'),
('#F0E68C', 'French Yellow', 'OPI', 'french', 'glossy', 60, ARRAY['spring', 'summer'], ARRAY['modern', 'cheerful', 'bold'], '12-0752 TPX'),
('#98FB98', 'French Mint', 'Essie', 'french', 'glossy', 65, ARRAY['spring', 'summer'], ARRAY['modern', 'fresh', 'unique'], '13-0221 TPX');

-- ============================================================================
-- CHROME AND METALLIC FINISHES
-- Mirror-like and metallic nail colors
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#C0C0C0', 'Mirror Chrome', 'OPI', 'chrome', 'chrome', 95, ARRAY['fall', 'winter'], ARRAY['futuristic', 'edgy', 'bold'], 'P 179-1 C'),
('#FFD700', 'Gold Chrome', 'Essie', 'chrome', 'chrome', 93, ARRAY['fall', 'winter'], ARRAY['luxurious', 'glamorous', 'bold'], '13-0859 TPX'),
('#E5E4E2', 'Platinum', 'Sally Hansen', 'chrome', 'chrome', 88, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'modern', 'chic'], 'P 179-1 C'),
('#B87333', 'Rose Gold', 'China Glaze', 'chrome', 'chrome', 90, ARRAY['fall', 'winter'], ARRAY['elegant', 'romantic', 'luxurious'], '16-1439 TPX'),
('#4682B4', 'Steel Blue Chrome', 'OPI', 'chrome', 'chrome', 78, ARRAY['winter'], ARRAY['cool', 'modern', 'sophisticated'], '18-4028 TPX');

-- ============================================================================
-- GLITTER AND SPARKLE
-- Festive and party-ready glitter colors
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#FFD700', 'Gold Glitter', 'OPI', 'glitter', 'glitter', 80, ARRAY['fall', 'winter'], ARRAY['festive', 'glamorous', 'celebratory'], '13-0859 TPX'),
('#C0C0C0', 'Silver Sparkle', 'Essie', 'glitter', 'glitter', 82, ARRAY['fall', 'winter'], ARRAY['festive', 'elegant', 'celebratory'], 'P 179-1 C'),
('#FF1493', 'Pink Glitter', 'Sally Hansen', 'glitter', 'glitter', 75, ARRAY['spring', 'summer'], ARRAY['fun', 'playful', 'bold'], '18-2436 TPX'),
('#800080', 'Purple Sparkle', 'China Glaze', 'glitter', 'glitter', 70, ARRAY['fall', 'winter'], ARRAY['dramatic', 'festive', 'bold'], '19-3536 TPX'),
('#FF4500', 'Orange Glitter', 'OPI', 'glitter', 'glitter', 65, ARRAY['fall'], ARRAY['bold', 'festive', 'energetic'], '16-1459 TPX');

-- ============================================================================
-- MATTE FINISHES
-- Modern matte nail colors
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
('#2F4F4F', 'Matte Charcoal', 'OPI', 'matte', 'matte', 85, ARRAY['fall', 'winter'], ARRAY['modern', 'edgy', 'sophisticated'], '18-4005 TPX'),
('#000000', 'Matte Black', 'Essie', 'matte', 'matte', 88, ARRAY['fall', 'winter'], ARRAY['edgy', 'dramatic', 'modern'], '19-0303 TPX'),
('#FFFFFF', 'Matte White', 'Sally Hansen', 'matte', 'matte', 75, ARRAY['spring', 'summer'], ARRAY['clean', 'modern', 'minimalist'], '11-0601 TPX'),
('#DC143C', 'Matte Red', 'China Glaze', 'matte', 'matte', 82, ARRAY['fall', 'winter'], ARRAY['bold', 'sophisticated', 'modern'], '18-1763 TPX'),
('#FFB6C1', 'Matte Pink', 'OPI', 'matte', 'matte', 78, ARRAY['spring', 'summer'], ARRAY['soft', 'modern', 'chic'], '12-1304 TPX');

-- ============================================================================
-- INITIALIZE TRENDING DATA
-- Create initial trending data for the current week
-- ============================================================================

-- Insert trending data for popular colors
INSERT INTO trending_colors (color_id, date, score, region)
SELECT 
    id,
    CURRENT_DATE,
    trending_score,
    'global'
FROM colors
WHERE trending_score > 70;

-- Insert regional trending data for top colors
INSERT INTO trending_colors (color_id, date, score, region)
SELECT 
    id,
    CURRENT_DATE,
    trending_score + (RANDOM() * 10)::INTEGER, -- Add some regional variation
    region_name
FROM colors
CROSS JOIN (VALUES ('north_america'), ('europe'), ('asia'), ('australia')) AS regions(region_name)
WHERE trending_score > 85;

-- ============================================================================
-- CREATE SAMPLE COLLECTIONS FOR INSPIRATION
-- Note: These would typically be created by admin users or as featured content
-- ============================================================================

-- First, we need a system user for creating sample collections
-- This would be done through Supabase Auth, but for seed data we'll create a placeholder

-- Sample collection data would be inserted here after user creation
-- For now, we'll create the structure but actual collections would be added
-- via the application after proper user authentication is set up

-- ============================================================================
-- ANALYTICS SEED DATA
-- Create some initial analytics data for testing
-- ============================================================================

-- Insert system analytics events
INSERT INTO user_analytics (user_id, event_type, event_data) VALUES
(NULL, 'system_startup', jsonb_build_object('version', '1.0.0', 'environment', 'production', 'timestamp', NOW())),
(NULL, 'seed_data_created', jsonb_build_object('colors_added', (SELECT COUNT(*) FROM colors), 'timestamp', NOW()));

-- ============================================================================
-- SUCCESS MESSAGE AND STATISTICS
-- ============================================================================
DO $$
DECLARE
    color_count INTEGER;
    trending_count INTEGER;
    category_breakdown JSONB;
BEGIN
    SELECT COUNT(*) INTO color_count FROM colors;
    SELECT COUNT(*) INTO trending_count FROM trending_colors;
    
    SELECT jsonb_object_agg(category, count) INTO category_breakdown
    FROM (
        SELECT category, COUNT(*) as count 
        FROM colors 
        GROUP BY category
    ) category_stats;
    
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Total colors added: %', color_count;
    RAISE NOTICE 'Category breakdown: %', category_breakdown;
    RAISE NOTICE 'Trending records created: %', trending_count;
    RAISE NOTICE 'Categories: classic, trending, seasonal, french, chrome, glitter, matte';
    RAISE NOTICE 'Finishes: glossy, matte, chrome, shimmer, glitter, cream';
    RAISE NOTICE 'Popular brands included: OPI, Essie, Sally Hansen, China Glaze, Chanel';
END $$;