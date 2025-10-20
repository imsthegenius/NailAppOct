-- ============================================================================
-- Check French Colors Insertion
-- File: 25_check_french_colors.sql
-- Purpose: Check if French colors were missed due to hex conflicts
-- ============================================================================

-- Check which French colors from file 15 actually made it into the database
WITH expected_french AS (
    SELECT 
        hex_code,
        name,
        'expected' as status
    FROM (VALUES
        -- Classic French Base Colors
        ('#FFFFFF', 'French White'),
        ('#FFF8DC', 'French Cream'),
        ('#FAF0E6', 'French Linen'),
        ('#FFF5EE', 'French Seashell'),
        ('#FFFAF0', 'French Floral White'),
        ('#F5FFFA', 'French Mint Cream'),
        ('#F0FFF0', 'French Honeydew'),
        ('#F0FFFF', 'French Azure'),
        ('#FFF0F5', 'French Lavender Blush'),
        ('#FFF5F5', 'French Snow'),
        -- Modern French Pink Tips
        ('#FFB6C1', 'French Pink'),
        ('#FFC0CB', 'French Rose'),
        ('#FFE4E1', 'French Misty Rose'),
        ('#FFDDF4', 'French Pink Lace'),
        ('#F8BBD0', 'French Orchid Pink'),
        ('#FADBD8', 'French Pale Rose'),
        ('#FFB7C5', 'French Cherry Blossom'),
        ('#FF91AF', 'French Baker Miller'),
        ('#FC89AC', 'French Flamingo'),
        ('#FFD1DC', 'French Powder Pink'),
        -- Modern French Colored Tips
        ('#E6E6FA', 'French Lavender'),
        ('#F0E68C', 'French Yellow'),
        ('#98FB98', 'French Mint'),
        ('#87CEEB', 'French Sky Blue'),
        ('#DDA0DD', 'French Plum'),
        ('#F0F8FF', 'French Alice Blue'),
        ('#FFDAB9', 'French Peach'),
        ('#E0FFFF', 'French Light Cyan'),
        ('#FFE4B5', 'French Moccasin'),
        ('#F5DEB3', 'French Wheat')
    ) AS expected(hex_code, name)
)
SELECT 
    e.hex_code,
    e.name,
    CASE 
        WHEN d.hex_code IS NOT NULL THEN 'found'
        ELSE 'missing'
    END as actual_status,
    d.category as current_category
FROM expected_french e
LEFT JOIN colors d ON e.hex_code = d.hex_code
ORDER BY actual_status, e.name;

-- Check what colors have these hex codes but different names
SELECT 
    hex_code,
    name,
    category,
    'conflict - hex exists with different name' as issue
FROM colors
WHERE hex_code IN (
    '#FFFFFF', '#FFF8DC', '#FAF0E6', '#FFF5EE', '#FFFAF0', '#F5FFFA', 
    '#F0FFF0', '#F0FFFF', '#FFF0F5', '#FFF5F5', '#FFB6C1', '#FFC0CB', 
    '#FFE4E1', '#FFDDF4', '#F8BBD0', '#FADBD8', '#FFB7C5', '#FF91AF', 
    '#FC89AC', '#FFD1DC', '#E6E6FA', '#F0E68C', '#98FB98', '#87CEEB', 
    '#DDA0DD', '#F0F8FF', '#FFDAB9', '#E0FFFF', '#FFE4B5', '#F5DEB3'
)
AND name NOT LIKE '%French%';

-- Count total French colors in database now
SELECT COUNT(*) as current_french_count
FROM colors
WHERE category = 'french';

-- List all current French colors
SELECT name, hex_code
FROM colors
WHERE category = 'french'
ORDER BY name;