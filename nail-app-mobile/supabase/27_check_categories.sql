-- ============================================================================
-- Check Current Categories
-- File: 27_check_categories.sql
-- Purpose: Quick check of all category counts
-- ============================================================================

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

-- Total colors
SELECT COUNT(*) as total_colors FROM colors;