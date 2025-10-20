-- Get all colors with their current categories
SELECT 
    hex_code,
    name,
    brand,
    category,
    finish,
    trending_score
FROM colors 
ORDER BY category, name;