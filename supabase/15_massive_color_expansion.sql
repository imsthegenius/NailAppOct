-- ============================================================================
-- Massive Color Expansion for Nail App
-- File: 15_massive_color_expansion.sql
-- Purpose: Add 450+ professional nail colors to wow users with variety
-- ============================================================================

-- This file adds colors to the existing colors table
-- All colors use the exact schema from 01_schema.sql
-- Categories: classic, seasonal, trending, french, chrome, glitter, matte

-- ============================================================================
-- CLASSIC CATEGORY - NUDES & NATURALS (60 colors)
-- Comprehensive range for all skin tones
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Nudes for Fair Skin (10 colors)
('#FFF5EE', 'Seashell', 'OPI', 'classic', 'cream', 82, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['elegant', 'minimal', 'clean'], '11-0602 TPX'),
('#FAF0E6', 'Linen', 'Essie', 'classic', 'glossy', 78, ARRAY['spring', 'summer'], ARRAY['soft', 'natural', 'understated'], '11-0603 TPX'),
('#FFEFD5', 'Papaya Whip', 'Sally Hansen', 'classic', 'cream', 75, ARRAY['spring', 'summer'], ARRAY['warm', 'delicate', 'fresh'], '12-0704 TPX'),
('#FFE4CD', 'Peach Puff Light', 'Chanel', 'classic', 'glossy', 80, ARRAY['spring', 'summer'], ARRAY['romantic', 'soft', 'feminine'], '12-0710 TPX'),
('#FFDAB9', 'Peach Puff', 'Dior', 'classic', 'cream', 77, ARRAY['spring', 'summer'], ARRAY['warm', 'gentle', 'natural'], '12-0712 TPX'),
('#FFE7BA', 'Wheat Light', 'YSL', 'classic', 'glossy', 79, ARRAY['spring', 'summer', 'fall'], ARRAY['versatile', 'neutral', 'sophisticated'], '12-0713 TPX'),
('#FFF0DB', 'Cornsilk Nude', 'OPI', 'classic', 'cream', 76, ARRAY['spring', 'summer'], ARRAY['subtle', 'clean', 'professional'], '11-0610 TPX'),
('#FFF4E6', 'Cosmic Latte', 'Essie', 'classic', 'glossy', 81, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['universal', 'elegant', 'timeless'], '11-0604 TPX'),
('#FFF5F5', 'Snow', 'Sally Hansen', 'classic', 'cream', 74, ARRAY['spring', 'summer'], ARRAY['pure', 'fresh', 'minimalist'], '11-0601 TPX'),
('#FFFAFA', 'Snow White', 'Chanel', 'classic', 'glossy', 73, ARRAY['spring', 'summer'], ARRAY['clean', 'crisp', 'modern'], '11-0601 TPX'),

-- Nudes for Light Skin (10 colors)
('#FAEBD7', 'Antique White', 'OPI', 'classic', 'cream', 84, ARRAY['spring', 'summer', 'fall'], ARRAY['vintage', 'warm', 'sophisticated'], '11-0507 TPX'),
('#F5E6D3', 'Almond', 'Essie', 'classic', 'glossy', 86, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['natural', 'versatile', 'elegant'], '12-0605 TPX'),
('#E6D3C7', 'Mushroom', 'Sally Hansen', 'classic', 'cream', 82, ARRAY['fall', 'winter'], ARRAY['earthy', 'sophisticated', 'neutral'], '14-1210 TPX'),
('#DDB892', 'Burlywood Light', 'Chanel', 'classic', 'glossy', 83, ARRAY['fall', 'winter'], ARRAY['warm', 'cozy', 'refined'], '13-1015 TPX'),
('#EDD9C7', 'Almond Buff', 'Dior', 'classic', 'cream', 81, ARRAY['spring', 'summer', 'fall'], ARRAY['subtle', 'professional', 'chic'], '12-0704 TPX'),
('#F4E4BC', 'Vanilla Cream', 'YSL', 'classic', 'glossy', 85, ARRAY['spring', 'summer'], ARRAY['soft', 'natural', 'elegant'], '11-0507 TPX'),
('#EDCDB5', 'Champagne Nude', 'OPI', 'classic', 'shimmer', 87, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['luxurious', 'versatile', 'glamorous'], '13-1008 TPX'),
('#F5DEB3', 'Wheat', 'Essie', 'classic', 'cream', 80, ARRAY['spring', 'summer', 'fall'], ARRAY['natural', 'warm', 'understated'], '13-0711 TPX'),
('#EED5B7', 'Bisque Light', 'Sally Hansen', 'classic', 'glossy', 79, ARRAY['spring', 'summer'], ARRAY['gentle', 'feminine', 'soft'], '12-0806 TPX'),
('#EEDFCC', 'Parchment', 'Chanel', 'classic', 'cream', 78, ARRAY['spring', 'summer', 'fall'], ARRAY['classic', 'refined', 'timeless'], '11-0606 TPX'),

-- Nudes for Medium Skin (10 colors)
('#D2B48C', 'Tan Classic', 'OPI', 'classic', 'cream', 85, ARRAY['summer', 'fall'], ARRAY['natural', 'warm', 'versatile'], '14-1118 TPX'),
('#C19A6B', 'Camel', 'Essie', 'classic', 'glossy', 83, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'rich', 'elegant'], '16-1221 TPX'),
('#BC9A6A', 'Cafe Creme', 'Sally Hansen', 'classic', 'cream', 86, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['chic', 'versatile', 'refined'], '15-1214 TPX'),
('#BDB76B', 'Dark Khaki', 'Chanel', 'classic', 'glossy', 81, ARRAY['fall', 'winter'], ARRAY['earthy', 'sophisticated', 'unique'], '15-0719 TPX'),
('#C3B091', 'Khaki Nude', 'Dior', 'classic', 'cream', 82, ARRAY['fall', 'winter'], ARRAY['modern', 'neutral', 'stylish'], '14-1012 TPX'),
('#CDAA7D', 'Buff', 'YSL', 'classic', 'glossy', 84, ARRAY['summer', 'fall'], ARRAY['warm', 'natural', 'effortless'], '14-1113 TPX'),
('#C8A882', 'Ecru', 'OPI', 'classic', 'cream', 80, ARRAY['spring', 'summer', 'fall'], ARRAY['subtle', 'sophisticated', 'versatile'], '13-1006 TPX'),
('#C4A57B', 'Butterscotch', 'Essie', 'classic', 'shimmer', 79, ARRAY['summer', 'fall'], ARRAY['warm', 'inviting', 'cheerful'], '15-1145 TPX'),
('#CDB79E', 'Desert Sand', 'Sally Hansen', 'classic', 'glossy', 77, ARRAY['summer', 'fall'], ARRAY['natural', 'beachy', 'relaxed'], '13-1016 TPX'),
('#CDAF95', 'Wood Nude', 'Chanel', 'classic', 'cream', 78, ARRAY['fall', 'winter'], ARRAY['earthy', 'grounded', 'natural'], '14-1109 TPX'),

-- Nudes for Tan Skin (10 colors)
('#A0826D', 'Burnished Brown', 'OPI', 'classic', 'cream', 84, ARRAY['fall', 'winter'], ARRAY['rich', 'warm', 'sophisticated'], '17-1320 TPX'),
('#9F8170', 'Beaver', 'Essie', 'classic', 'glossy', 82, ARRAY['fall', 'winter'], ARRAY['elegant', 'neutral', 'timeless'], '17-1316 TPX'),
('#8B7355', 'French Beige', 'Sally Hansen', 'classic', 'cream', 83, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['classic', 'refined', 'professional'], '16-1324 TPX'),
('#996515', 'Golden Brown', 'Chanel', 'classic', 'shimmer', 85, ARRAY['summer', 'fall'], ARRAY['luxurious', 'warm', 'radiant'], '17-1129 TPX'),
('#A68064', 'Sandstone', 'Dior', 'classic', 'glossy', 81, ARRAY['summer', 'fall'], ARRAY['natural', 'earthy', 'grounded'], '16-1318 TPX'),
('#A67B5B', 'Cafe Au Lait', 'YSL', 'classic', 'cream', 86, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['sophisticated', 'warm', 'elegant'], '17-1319 TPX'),
('#A0845C', 'Lion', 'OPI', 'classic', 'glossy', 80, ARRAY['summer', 'fall'], ARRAY['bold', 'warm', 'confident'], '16-1126 TPX'),
('#986960', 'Pastel Brown', 'Essie', 'classic', 'cream', 79, ARRAY['fall', 'winter'], ARRAY['subtle', 'sophisticated', 'unique'], '17-1514 TPX'),
('#AB917A', 'Cork', 'Sally Hansen', 'classic', 'glossy', 77, ARRAY['fall', 'winter'], ARRAY['natural', 'organic', 'earthy'], '15-1308 TPX'),
('#AC9A7A', 'Pale Taupe', 'Chanel', 'classic', 'cream', 78, ARRAY['spring', 'fall'], ARRAY['neutral', 'versatile', 'modern'], '15-1306 TPX'),

-- Nudes for Deep Skin (10 colors)
('#826644', 'Raw Umber', 'OPI', 'classic', 'cream', 85, ARRAY['fall', 'winter'], ARRAY['bold', 'earthy', 'confident'], '18-1142 TPX'),
('#734A12', 'Raw Sienna', 'Essie', 'classic', 'glossy', 83, ARRAY['fall', 'winter'], ARRAY['rich', 'warm', 'luxurious'], '18-1441 TPX'),
('#704214', 'Sepia', 'Sally Hansen', 'classic', 'cream', 82, ARRAY['fall', 'winter'], ARRAY['deep', 'sophisticated', 'bold'], '19-1241 TPX'),
('#6F4E37', 'Coffee', 'Chanel', 'classic', 'glossy', 86, ARRAY['fall', 'winter'], ARRAY['rich', 'indulgent', 'elegant'], '19-1235 TPX'),
('#835C3B', 'Brown Sugar', 'Dior', 'classic', 'shimmer', 84, ARRAY['fall', 'winter'], ARRAY['sweet', 'warm', 'inviting'], '18-1140 TPX'),
('#7B6143', 'Coyote Brown', 'YSL', 'classic', 'cream', 81, ARRAY['fall', 'winter'], ARRAY['earthy', 'natural', 'grounded'], '18-1030 TPX'),
('#755C48', 'Bole', 'OPI', 'classic', 'glossy', 80, ARRAY['fall', 'winter'], ARRAY['deep', 'rich', 'sophisticated'], '18-1032 TPX'),
('#6B4423', 'Umber', 'Essie', 'classic', 'cream', 79, ARRAY['fall', 'winter'], ARRAY['bold', 'earthy', 'confident'], '19-1217 TPX'),
('#7B5141', 'Spice', 'Sally Hansen', 'classic', 'glossy', 78, ARRAY['fall', 'winter'], ARRAY['warm', 'inviting', 'cozy'], '18-1336 TPX'),
('#7F5539', 'Copper Canyon', 'Chanel', 'classic', 'shimmer', 82, ARRAY['fall', 'winter'], ARRAY['metallic', 'warm', 'glamorous'], '18-1338 TPX'),

-- Nudes for Dark Skin (10 colors)
('#5C4033', 'Dark Brown', 'OPI', 'classic', 'cream', 84, ARRAY['fall', 'winter'], ARRAY['powerful', 'grounded', 'elegant'], '19-1317 TPX'),
('#3D2914', 'Dark Chocolate', 'Essie', 'classic', 'glossy', 86, ARRAY['fall', 'winter'], ARRAY['luxurious', 'rich', 'indulgent'], '19-1314 TPX'),
('#321414', 'Black Bean', 'Sally Hansen', 'classic', 'cream', 83, ARRAY['fall', 'winter'], ARRAY['bold', 'sophisticated', 'dramatic'], '19-0912 TPX'),
('#3B302F', 'Black Coffee', 'Chanel', 'classic', 'glossy', 87, ARRAY['fall', 'winter'], ARRAY['intense', 'powerful', 'chic'], '19-0909 TPX'),
('#2F1B14', 'Espresso', 'Dior', 'classic', 'cream', 85, ARRAY['fall', 'winter'], ARRAY['deep', 'rich', 'sophisticated'], '19-1111 TPX'),
('#3B2820', 'Dark Sienna', 'YSL', 'classic', 'glossy', 82, ARRAY['fall', 'winter'], ARRAY['warm', 'deep', 'elegant'], '19-1320 TPX'),
('#3C241B', 'Dark Lava', 'OPI', 'classic', 'shimmer', 81, ARRAY['fall', 'winter'], ARRAY['dramatic', 'bold', 'unique'], '19-1102 TPX'),
('#4A3C28', 'Taupe Gray', 'Essie', 'classic', 'cream', 80, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'neutral', 'modern'], '19-0810 TPX'),
('#453227', 'Wenge', 'Sally Hansen', 'classic', 'glossy', 79, ARRAY['fall', 'winter'], ARRAY['deep', 'natural', 'earthy'], '19-0915 TPX'),
('#49392D', 'Olive Brown', 'Chanel', 'classic', 'cream', 78, ARRAY['fall', 'winter'], ARRAY['unique', 'sophisticated', 'earthy'], '19-0815 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- CLASSIC CATEGORY - REDS (30 colors)
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- True Reds
('#FF0000', 'Pure Red', 'OPI', 'classic', 'glossy', 95, ARRAY['fall', 'winter'], ARRAY['classic', 'bold', 'timeless'], '18-1664 TPX'),
('#ED1C24', 'Rocket Red', 'Essie', 'classic', 'cream', 90, ARRAY['fall', 'winter'], ARRAY['vibrant', 'energetic', 'confident'], '18-1662 TPX'),
('#CE2029', 'Fire Red', 'Sally Hansen', 'classic', 'glossy', 88, ARRAY['fall', 'winter'], ARRAY['passionate', 'bold', 'dramatic'], '18-1763 TPX'),
('#A52A2A', 'Red Brown', 'Chanel', 'classic', 'cream', 82, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'warm', 'rich'], '18-1441 TPX'),
('#CC0000', 'Boston University Red', 'Dior', 'classic', 'glossy', 87, ARRAY['fall', 'winter'], ARRAY['academic', 'classic', 'refined'], '18-1664 TPX'),

-- Burgundy Reds
('#800020', 'Burgundy', 'YSL', 'classic', 'glossy', 89, ARRAY['fall', 'winter'], ARRAY['luxurious', 'rich', 'elegant'], '19-1617 TPX'),
('#722F37', 'Wine', 'OPI', 'classic', 'cream', 85, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'deep', 'mature'], '19-1522 TPX'),
('#673147', 'Eggplant', 'Essie', 'classic', 'glossy', 83, ARRAY['fall', 'winter'], ARRAY['unique', 'bold', 'artistic'], '19-2025 TPX'),
('#614051', 'Deep Maroon', 'Sally Hansen', 'classic', 'cream', 81, ARRAY['fall', 'winter'], ARRAY['mysterious', 'deep', 'sophisticated'], '19-1518 TPX'),
('#5E2129', 'Pomegranate', 'Chanel', 'classic', 'shimmer', 84, ARRAY['fall', 'winter'], ARRAY['rich', 'festive', 'glamorous'], '19-1621 TPX'),

-- Berry Reds
('#B03060', 'Maroon X11', 'Dior', 'classic', 'glossy', 86, ARRAY['fall', 'winter'], ARRAY['bold', 'confident', 'modern'], '18-1741 TPX'),
('#DC143C', 'Crimson', 'YSL', 'classic', 'cream', 88, ARRAY['fall', 'winter'], ARRAY['classic', 'bold', 'passionate'], '18-1763 TPX'),
('#E3256B', 'Razzmatazz', 'OPI', 'classic', 'shimmer', 82, ARRAY['spring', 'summer'], ARRAY['playful', 'fun', 'vibrant'], '17-1937 TPX'),
('#CC397B', 'Fuchsia Purple', 'Essie', 'classic', 'glossy', 80, ARRAY['spring', 'summer'], ARRAY['bright', 'bold', 'feminine'], '17-2031 TPX'),
('#C54B8C', 'Mulberry', 'Sally Hansen', 'classic', 'cream', 79, ARRAY['fall', 'winter'], ARRAY['rich', 'berry', 'sophisticated'], '17-1926 TPX'),

-- Coral Reds
('#FF6B6B', 'Pastel Red', 'Chanel', 'classic', 'glossy', 85, ARRAY['spring', 'summer'], ARRAY['soft', 'romantic', 'gentle'], '16-1546 TPX'),
('#FF7F50', 'Coral', 'Dior', 'classic', 'cream', 87, ARRAY['summer'], ARRAY['tropical', 'warm', 'cheerful'], '16-1546 TPX'),
('#CD5C5C', 'Indian Red', 'YSL', 'classic', 'glossy', 83, ARRAY['fall'], ARRAY['earthy', 'warm', 'natural'], '17-1544 TPX'),
('#E9967A', 'Dark Salmon', 'OPI', 'classic', 'shimmer', 81, ARRAY['summer', 'fall'], ARRAY['sunset', 'warm', 'inviting'], '16-1450 TPX'),
('#FA8072', 'Salmon', 'Essie', 'classic', 'cream', 80, ARRAY['summer'], ARRAY['peachy', 'fresh', 'natural'], '16-1450 TPX'),

-- Blue-Based Reds
('#C21E56', 'Rose Red', 'Sally Hansen', 'classic', 'glossy', 84, ARRAY['fall', 'winter'], ARRAY['romantic', 'elegant', 'feminine'], '18-1755 TPX'),
('#960018', 'Carmine', 'Chanel', 'classic', 'cream', 86, ARRAY['fall', 'winter'], ARRAY['deep', 'luxurious', 'sophisticated'], '19-1663 TPX'),
('#8E3A59', 'Quinacridone Magenta', 'Dior', 'classic', 'glossy', 82, ARRAY['fall', 'winter'], ARRAY['artistic', 'unique', 'bold'], '18-2025 TPX'),
('#B22222', 'Firebrick', 'YSL', 'classic', 'cream', 88, ARRAY['fall', 'winter'], ARRAY['classic', 'warm', 'traditional'], '18-1664 TPX'),
('#8B0000', 'Dark Red', 'OPI', 'classic', 'glossy', 90, ARRAY['fall', 'winter'], ARRAY['intense', 'dramatic', 'powerful'], '19-1557 TPX'),

-- Orange-Based Reds
('#FF4500', 'Orange Red', 'Essie', 'classic', 'glossy', 83, ARRAY['summer', 'fall'], ARRAY['vibrant', 'energetic', 'bold'], '17-1464 TPX'),
('#FF6347', 'Tomato', 'Sally Hansen', 'classic', 'cream', 81, ARRAY['summer'], ARRAY['bright', 'juicy', 'fun'], '17-1463 TPX'),
('#FF2400', 'Scarlet', 'Chanel', 'classic', 'glossy', 87, ARRAY['fall', 'winter'], ARRAY['bold', 'confident', 'striking'], '18-1664 TPX'),
('#E34234', 'Vermillion', 'Dior', 'classic', 'shimmer', 85, ARRAY['summer', 'fall'], ARRAY['artistic', 'warm', 'vibrant'], '17-1562 TPX'),
('#D2691E', 'Cinnamon Red', 'YSL', 'classic', 'cream', 79, ARRAY['fall'], ARRAY['spicy', 'warm', 'cozy'], '18-1142 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- CLASSIC CATEGORY - PINKS (30 colors)
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Light Pinks
('#FFE4E1', 'Misty Rose', 'OPI', 'classic', 'cream', 85, ARRAY['spring', 'summer'], ARRAY['romantic', 'soft', 'delicate'], '11-1602 TPX'),
('#FFF0F5', 'Lavender Blush', 'Essie', 'classic', 'glossy', 82, ARRAY['spring'], ARRAY['feminine', 'gentle', 'ethereal'], '11-2511 TPX'),
('#FFDDF4', 'Pink Lace', 'Sally Hansen', 'classic', 'shimmer', 80, ARRAY['spring', 'summer'], ARRAY['delicate', 'romantic', 'sweet'], '11-2512 TPX'),
('#F8BBD0', 'Orchid Pink', 'Chanel', 'classic', 'cream', 83, ARRAY['spring', 'summer'], ARRAY['elegant', 'soft', 'sophisticated'], '12-2904 TPX'),
('#FADBD8', 'Pale Rose', 'Dior', 'classic', 'glossy', 81, ARRAY['spring'], ARRAY['subtle', 'romantic', 'gentle'], '11-1408 TPX'),

-- Medium Pinks
('#FFB6C1', 'Light Pink', 'YSL', 'classic', 'cream', 87, ARRAY['spring', 'summer'], ARRAY['classic', 'feminine', 'sweet'], '12-1304 TPX'),
('#FFC0CB', 'Pink', 'OPI', 'classic', 'glossy', 88, ARRAY['spring', 'summer'], ARRAY['playful', 'cheerful', 'youthful'], '12-1706 TPX'),
('#FFB7C5', 'Cherry Blossom Pink', 'Essie', 'classic', 'shimmer', 90, ARRAY['spring'], ARRAY['romantic', 'delicate', 'seasonal'], '12-1707 TPX'),
('#FF91AF', 'Baker Miller Pink', 'Sally Hansen', 'classic', 'cream', 84, ARRAY['spring', 'summer'], ARRAY['calming', 'soft', 'modern'], '13-1906 TPX'),
('#FC89AC', 'Flamingo Pink', 'Chanel', 'classic', 'glossy', 86, ARRAY['summer'], ARRAY['tropical', 'fun', 'vibrant'], '14-1714 TPX'),

-- Hot Pinks
('#FF69B4', 'Hot Pink', 'Dior', 'classic', 'glossy', 89, ARRAY['summer'], ARRAY['bold', 'fun', 'energetic'], '17-2034 TPX'),
('#FF1493', 'Deep Pink', 'YSL', 'classic', 'cream', 91, ARRAY['summer'], ARRAY['vibrant', 'bold', 'confident'], '18-2436 TPX'),
('#FF10F0', 'Shocking Pink', 'OPI', 'classic', 'shimmer', 85, ARRAY['summer'], ARRAY['electric', 'bold', 'attention-grabbing'], '18-2436 TPX'),
('#FC0FC0', 'Hot Magenta', 'Essie', 'classic', 'glossy', 83, ARRAY['summer'], ARRAY['intense', 'modern', 'striking'], '18-2045 TPX'),
('#FF0066', 'Winter Sky', 'Sally Hansen', 'classic', 'cream', 82, ARRAY['winter'], ARRAY['bold', 'festive', 'dramatic'], '18-1764 TPX'),

-- Dusty/Muted Pinks
('#CC8899', 'Puce', 'Chanel', 'classic', 'cream', 79, ARRAY['fall'], ARRAY['sophisticated', 'muted', 'vintage'], '16-1715 TPX'),
('#C08081', 'Old Rose', 'Dior', 'classic', 'glossy', 81, ARRAY['fall', 'winter'], ARRAY['vintage', 'romantic', 'nostalgic'], '16-1511 TPX'),
('#BC8F8F', 'Rosy Brown', 'YSL', 'classic', 'cream', 77, ARRAY['fall'], ARRAY['earthy', 'subtle', 'natural'], '16-1412 TPX'),
('#D8BFD8', 'Thistle', 'OPI', 'classic', 'shimmer', 80, ARRAY['spring', 'fall'], ARRAY['unique', 'soft', 'ethereal'], '14-3209 TPX'),
('#DDA0DD', 'Plum', 'Essie', 'classic', 'glossy', 82, ARRAY['fall'], ARRAY['rich', 'sophisticated', 'elegant'], '15-3412 TPX'),

-- Coral Pinks
('#F88379', 'Coral Pink', 'Sally Hansen', 'classic', 'cream', 86, ARRAY['summer'], ARRAY['warm', 'tropical', 'cheerful'], '15-1423 TPX'),
('#FF9999', 'Light Coral Pink', 'Chanel', 'classic', 'glossy', 84, ARRAY['spring', 'summer'], ARRAY['fresh', 'soft', 'romantic'], '14-1420 TPX'),
('#F08080', 'Light Coral', 'Dior', 'classic', 'shimmer', 85, ARRAY['summer'], ARRAY['beachy', 'warm', 'inviting'], '15-1415 TPX'),
('#E9967A', 'Dark Salmon Pink', 'YSL', 'classic', 'cream', 81, ARRAY['summer', 'fall'], ARRAY['sunset', 'warm', 'natural'], '15-1516 TPX'),
('#FFA07A', 'Light Salmon Pink', 'OPI', 'classic', 'glossy', 83, ARRAY['summer'], ARRAY['peachy', 'fresh', 'delicate'], '14-1323 TPX'),

-- Mauve Pinks
('#E0B0FF', 'Mauve', 'Essie', 'classic', 'cream', 82, ARRAY['spring', 'fall'], ARRAY['sophisticated', 'unique', 'elegant'], '15-3412 TPX'),
('#D473D4', 'Deep Mauve', 'Sally Hansen', 'classic', 'glossy', 80, ARRAY['fall'], ARRAY['rich', 'luxurious', 'bold'], '17-3020 TPX'),
('#C89FA3', 'Dusty Rose', 'Chanel', 'classic', 'shimmer', 88, ARRAY['fall', 'winter'], ARRAY['romantic', 'vintage', 'sophisticated'], '15-1607 TPX'),
('#AB82FF', 'Medium Purple Pink', 'Dior', 'classic', 'cream', 79, ARRAY['spring', 'fall'], ARRAY['dreamy', 'artistic', 'unique'], '16-3416 TPX'),
('#B784A7', 'Opera Mauve', 'YSL', 'classic', 'glossy', 81, ARRAY['fall', 'winter'], ARRAY['dramatic', 'elegant', 'theatrical'], '17-2514 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- TRENDING CATEGORY (80 colors)
-- Current viral trends and social media favorites
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Latte Makeup Trend (20 colors)
('#F5E6D3', 'Glazed Donut', 'OPI', 'trending', 'chrome', 95, ARRAY['spring', 'summer'], ARRAY['trendy', 'natural', 'chic'], '12-0404 TPX'),
('#E8D5C4', 'Milk Bath', 'Essie', 'trending', 'chrome', 98, ARRAY['spring', 'summer'], ARRAY['trendy', 'soft', 'minimalist'], '13-1015 TPX'),
('#F0E2D0', 'Vanilla Latte', 'Sally Hansen', 'trending', 'shimmer', 96, ARRAY['spring', 'summer'], ARRAY['trendy', 'cozy', 'natural'], '12-0605 TPX'),
('#E5D4B1', 'Cappuccino Foam', 'Chanel', 'trending', 'cream', 94, ARRAY['spring', 'summer', 'fall'], ARRAY['trendy', 'warm', 'sophisticated'], '13-1011 TPX'),
('#F3E5D0', 'Oat Milk', 'Dior', 'trending', 'glossy', 92, ARRAY['spring', 'summer'], ARRAY['trendy', 'clean', 'modern'], '11-0907 TPX'),
('#E8D0B3', 'Almond Milk', 'YSL', 'trending', 'chrome', 90, ARRAY['spring', 'summer'], ARRAY['trendy', 'neutral', 'versatile'], '12-0911 TPX'),
('#F4E8D0', 'Coconut Cream', 'OPI', 'trending', 'shimmer', 88, ARRAY['summer'], ARRAY['trendy', 'tropical', 'creamy'], '11-0710 TPX'),
('#ECDCC7', 'Cashew Cream', 'Essie', 'trending', 'cream', 86, ARRAY['spring', 'fall'], ARRAY['trendy', 'nutty', 'natural'], '13-1106 TPX'),
('#F2E1C1', 'Soy Latte', 'Sally Hansen', 'trending', 'glossy', 84, ARRAY['spring', 'summer'], ARRAY['trendy', 'vegan', 'modern'], '12-0710 TPX'),
('#E6D3B3', 'Macadamia Milk', 'Chanel', 'trending', 'chrome', 82, ARRAY['spring', 'summer'], ARRAY['trendy', 'luxe', 'creamy'], '13-1009 TPX'),
('#F5E9D3', 'Rice Milk', 'Dior', 'trending', 'shimmer', 80, ARRAY['spring', 'summer'], ARRAY['trendy', 'clean', 'minimal'], '11-0606 TPX'),
('#E9D9C3', 'Hemp Milk', 'YSL', 'trending', 'cream', 78, ARRAY['spring', 'summer'], ARRAY['trendy', 'earthy', 'natural'], '12-0804 TPX'),
('#F0E4CC', 'Flax Milk', 'OPI', 'trending', 'glossy', 76, ARRAY['spring', 'summer'], ARRAY['trendy', 'healthy', 'subtle'], '11-0809 TPX'),
('#E7D5BB', 'Pea Milk', 'Essie', 'trending', 'chrome', 74, ARRAY['spring'], ARRAY['trendy', 'unique', 'modern'], '12-0807 TPX'),
('#F3E8D5', 'Quinoa Milk', 'Sally Hansen', 'trending', 'shimmer', 72, ARRAY['spring', 'summer'], ARRAY['trendy', 'superfood', 'chic'], '11-0608 TPX'),
('#EAD9BD', 'Hazelnut Latte', 'Chanel', 'trending', 'cream', 95, ARRAY['fall', 'winter'], ARRAY['trendy', 'cozy', 'rich'], '13-1107 TPX'),
('#F1E5CF', 'Pistachio Latte', 'Dior', 'trending', 'glossy', 93, ARRAY['spring'], ARRAY['trendy', 'unique', 'sophisticated'], '12-0607 TPX'),
('#E4D1B9', 'Walnut Milk', 'YSL', 'trending', 'chrome', 91, ARRAY['fall'], ARRAY['trendy', 'nutty', 'warm'], '14-1108 TPX'),
('#F6EBD8', 'Barista Blend', 'OPI', 'trending', 'shimmer', 89, ARRAY['spring', 'summer', 'fall'], ARRAY['trendy', 'professional', 'chic'], '11-0507 TPX'),
('#E8DCC5', 'Flat White', 'Essie', 'trending', 'cream', 87, ARRAY['spring', 'summer'], ARRAY['trendy', 'minimalist', 'modern'], '12-0605 TPX'),

-- Clean Girl Aesthetic (20 colors)
('#FDF5E6', 'Old Lace', 'Sally Hansen', 'trending', 'glossy', 92, ARRAY['spring', 'summer'], ARRAY['clean', 'fresh', 'minimal'], '11-0602 TPX'),
('#FAF0DD', 'Vanilla Ice', 'Chanel', 'trending', 'cream', 90, ARRAY['spring', 'summer'], ARRAY['clean', 'pure', 'effortless'], '11-0603 TPX'),
('#F5F5DC', 'Beige Clean', 'Dior', 'trending', 'glossy', 88, ARRAY['spring', 'summer', 'fall'], ARRAY['clean', 'neutral', 'sophisticated'], '12-0605 TPX'),
('#FAEEE7', 'Cloud White', 'YSL', 'trending', 'shimmer', 86, ARRAY['spring', 'summer'], ARRAY['clean', 'airy', 'light'], '11-0601 TPX'),
('#FFF5ED', 'Seashell Clean', 'OPI', 'trending', 'cream', 84, ARRAY['summer'], ARRAY['clean', 'beachy', 'natural'], '11-0602 TPX'),
('#FFF8E7', 'Cosmic Clean', 'Essie', 'trending', 'glossy', 82, ARRAY['spring', 'summer'], ARRAY['clean', 'ethereal', 'modern'], '11-0604 TPX'),
('#FFFEF7', 'Ivory Clean', 'Sally Hansen', 'trending', 'chrome', 80, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['clean', 'classic', 'timeless'], '11-0601 TPX'),
('#FFF9F0', 'Pearl Clean', 'Chanel', 'trending', 'shimmer', 78, ARRAY['spring', 'summer'], ARRAY['clean', 'luxurious', 'elegant'], '11-0602 TPX'),
('#FFFDFA', 'Snow Clean', 'Dior', 'trending', 'cream', 76, ARRAY['winter', 'spring'], ARRAY['clean', 'pure', 'crisp'], '11-0601 TPX'),
('#FFFDF5', 'Cream Clean', 'YSL', 'trending', 'glossy', 74, ARRAY['spring', 'summer'], ARRAY['clean', 'smooth', 'refined'], '11-0603 TPX'),
('#E0F2E9', 'Mint Clean', 'OPI', 'trending', 'shimmer', 85, ARRAY['spring', 'summer'], ARRAY['clean', 'fresh', 'cooling'], '12-5504 TPX'),
('#F0F8FF', 'Alice Blue Clean', 'Essie', 'trending', 'cream', 83, ARRAY['spring', 'summer'], ARRAY['clean', 'dreamy', 'soft'], '11-4301 TPX'),
('#F5FFFA', 'Mint Cream Clean', 'Sally Hansen', 'trending', 'glossy', 81, ARRAY['spring', 'summer'], ARRAY['clean', 'refreshing', 'spa-like'], '11-4802 TPX'),
('#F0FFF0', 'Honeydew Clean', 'Chanel', 'trending', 'chrome', 79, ARRAY['spring', 'summer'], ARRAY['clean', 'natural', 'dewy'], '11-0205 TPX'),
('#FFFFF0', 'Ivory Yellow Clean', 'Dior', 'trending', 'shimmer', 77, ARRAY['spring', 'summer'], ARRAY['clean', 'sunny', 'bright'], '11-0601 TPX'),
('#FFF0F5', 'Lavender Clean', 'YSL', 'trending', 'cream', 87, ARRAY['spring'], ARRAY['clean', 'romantic', 'gentle'], '11-2511 TPX'),
('#FFE4F1', 'Pink Clean', 'OPI', 'trending', 'glossy', 89, ARRAY['spring', 'summer'], ARRAY['clean', 'feminine', 'fresh'], '11-1602 TPX'),
('#FFF4E6', 'Linen Clean', 'Essie', 'trending', 'shimmer', 91, ARRAY['spring', 'summer'], ARRAY['clean', 'natural', 'breathable'], '11-0606 TPX'),
('#FFFAED', 'Cornsilk Clean', 'Sally Hansen', 'trending', 'cream', 93, ARRAY['spring', 'summer'], ARRAY['clean', 'warm', 'subtle'], '11-0710 TPX'),
('#FFF6E5', 'Blanched Clean', 'Chanel', 'trending', 'glossy', 95, ARRAY['spring', 'summer'], ARRAY['clean', 'pure', 'minimal'], '11-0507 TPX'),

-- Blueberry Milk Trend (20 colors)
('#E6E6FA', 'Lavender Milk', 'Dior', 'trending', 'cream', 95, ARRAY['spring', 'summer'], ARRAY['trendy', 'soft', 'dreamy'], '14-3612 TPX'),
('#D8BFD8', 'Thistle Milk', 'YSL', 'trending', 'glossy', 93, ARRAY['spring'], ARRAY['trendy', 'unique', 'ethereal'], '14-3209 TPX'),
('#DDA0DD', 'Plum Milk', 'OPI', 'trending', 'shimmer', 91, ARRAY['spring', 'fall'], ARRAY['trendy', 'rich', 'creamy'], '15-3412 TPX'),
('#E0D0E5', 'Lilac Milk', 'Essie', 'trending', 'cream', 89, ARRAY['spring'], ARRAY['trendy', 'gentle', 'romantic'], '13-3820 TPX'),
('#B8C5E6', 'Periwinkle Milk', 'Sally Hansen', 'trending', 'glossy', 94, ARRAY['spring', 'summer'], ARRAY['trendy', 'calming', 'serene'], '15-3915 TPX'),
('#C5CAE9', 'Blue Lavender Milk', 'Chanel', 'trending', 'chrome', 92, ARRAY['spring', 'summer'], ARRAY['trendy', 'modern', 'cool'], '15-3909 TPX'),
('#BBDEFB', 'Sky Blue Milk', 'Dior', 'trending', 'shimmer', 90, ARRAY['summer'], ARRAY['trendy', 'airy', 'light'], '14-4313 TPX'),
('#C5E1F5', 'Powder Blue Milk', 'YSL', 'trending', 'cream', 88, ARRAY['spring', 'summer'], ARRAY['trendy', 'soft', 'baby'], '14-4306 TPX'),
('#D6E4F0', 'Alice Milk', 'OPI', 'trending', 'glossy', 86, ARRAY['spring', 'summer'], ARRAY['trendy', 'dreamy', 'whimsical'], '13-4303 TPX'),
('#E1E8ED', 'Ghost Blue Milk', 'Essie', 'trending', 'chrome', 84, ARRAY['spring', 'summer'], ARRAY['trendy', 'subtle', 'sophisticated'], '13-4103 TPX'),
('#D4E0ED', 'Ice Blue Milk', 'Sally Hansen', 'trending', 'shimmer', 82, ARRAY['winter', 'spring'], ARRAY['trendy', 'cool', 'refreshing'], '13-4403 TPX'),
('#E8EAF6', 'Indigo Milk', 'Chanel', 'trending', 'cream', 80, ARRAY['spring', 'summer'], ARRAY['trendy', 'deep', 'mysterious'], '13-3919 TPX'),
('#E3F2FD', 'Blue Cream', 'Dior', 'trending', 'glossy', 78, ARRAY['summer'], ARRAY['trendy', 'light', 'summery'], '12-4306 TPX'),
('#E7E5F1', 'Wisteria Milk', 'YSL', 'trending', 'chrome', 76, ARRAY['spring'], ARRAY['trendy', 'floral', 'romantic'], '13-3817 TPX'),
('#EDE7F6', 'Deep Lavender Milk', 'OPI', 'trending', 'shimmer', 85, ARRAY['spring', 'fall'], ARRAY['trendy', 'luxurious', 'velvety'], '13-3820 TPX'),
('#E6E2ED', 'Violet Milk', 'Essie', 'trending', 'cream', 87, ARRAY['spring', 'fall'], ARRAY['trendy', 'elegant', 'refined'], '13-3802 TPX'),
('#E9E4F5', 'Amethyst Milk', 'Sally Hansen', 'trending', 'glossy', 89, ARRAY['spring', 'winter'], ARRAY['trendy', 'mystical', 'magical'], '13-3820 TPX'),
('#E5E5F7', 'Periwinkle Cream', 'Chanel', 'trending', 'chrome', 91, ARRAY['spring', 'summer'], ARRAY['trendy', 'delicate', 'fresh'], '13-3919 TPX'),
('#E8E3F5', 'Orchid Milk', 'Dior', 'trending', 'shimmer', 93, ARRAY['spring'], ARRAY['trendy', 'exotic', 'sophisticated'], '13-3817 TPX'),
('#E4E1ED', 'Iris Milk', 'YSL', 'trending', 'cream', 96, ARRAY['spring'], ARRAY['trendy', 'floral', 'elegant'], '13-3802 TPX'),

-- Chrome & Holo Trend (20 colors)
('#C0C0C0', 'Chrome Silver', 'OPI', 'trending', 'chrome', 95, ARRAY['fall', 'winter'], ARRAY['futuristic', 'bold', 'edgy'], 'P 179-1 C'),
('#FFD700', 'Chrome Gold', 'Essie', 'trending', 'chrome', 93, ARRAY['fall', 'winter'], ARRAY['luxurious', 'bold', 'glamorous'], '13-0859 TPX'),
('#FFC0CB', 'Chrome Pink', 'Sally Hansen', 'trending', 'chrome', 91, ARRAY['spring', 'summer'], ARRAY['trendy', 'bold', 'futuristic'], '12-1706 TPX'),
('#E6E6FA', 'Chrome Lavender', 'Chanel', 'trending', 'chrome', 89, ARRAY['spring'], ARRAY['trendy', 'ethereal', 'modern'], '14-3612 TPX'),
('#98FB98', 'Chrome Mint', 'Dior', 'trending', 'chrome', 87, ARRAY['spring', 'summer'], ARRAY['trendy', 'fresh', 'cool'], '13-0221 TPX'),
('#87CEEB', 'Chrome Sky', 'YSL', 'trending', 'chrome', 85, ARRAY['summer'], ARRAY['trendy', 'airy', 'light'], '14-4318 TPX'),
('#DDA0DD', 'Chrome Plum', 'OPI', 'trending', 'chrome', 83, ARRAY['fall'], ARRAY['trendy', 'rich', 'sophisticated'], '15-3412 TPX'),
('#F0E68C', 'Chrome Yellow', 'Essie', 'trending', 'chrome', 81, ARRAY['summer'], ARRAY['trendy', 'bright', 'sunny'], '12-0752 TPX'),
('#FF69B4', 'Chrome Hot Pink', 'Sally Hansen', 'trending', 'chrome', 90, ARRAY['summer'], ARRAY['trendy', 'bold', 'energetic'], '17-2034 TPX'),
('#40E0D0', 'Chrome Turquoise', 'Chanel', 'trending', 'chrome', 88, ARRAY['summer'], ARRAY['trendy', 'tropical', 'vibrant'], '15-5519 TPX'),
('#B87333', 'Chrome Copper', 'Dior', 'trending', 'chrome', 92, ARRAY['fall', 'winter'], ARRAY['trendy', 'warm', 'metallic'], '16-1439 TPX'),
('#4682B4', 'Chrome Steel Blue', 'YSL', 'trending', 'chrome', 86, ARRAY['winter'], ARRAY['trendy', 'cool', 'modern'], '18-4028 TPX'),
('#8A2BE2', 'Chrome Violet', 'OPI', 'trending', 'chrome', 84, ARRAY['spring', 'fall'], ARRAY['trendy', 'electric', 'bold'], '18-3838 TPX'),
('#FF1493', 'Chrome Deep Pink', 'Essie', 'trending', 'chrome', 94, ARRAY['summer'], ARRAY['trendy', 'vibrant', 'striking'], '18-2436 TPX'),
('#00CED1', 'Chrome Cyan', 'Sally Hansen', 'trending', 'chrome', 82, ARRAY['summer'], ARRAY['trendy', 'oceanic', 'cool'], '15-4825 TPX'),
('#FF4500', 'Chrome Orange', 'Chanel', 'trending', 'chrome', 80, ARRAY['summer', 'fall'], ARRAY['trendy', 'bold', 'energetic'], '17-1464 TPX'),
('#9370DB', 'Chrome Purple', 'Dior', 'trending', 'chrome', 88, ARRAY['spring', 'fall'], ARRAY['trendy', 'royal', 'luxurious'], '17-3725 TPX'),
('#3CB371', 'Chrome Sea Green', 'YSL', 'trending', 'chrome', 78, ARRAY['spring', 'summer'], ARRAY['trendy', 'natural', 'fresh'], '15-5718 TPX'),
('#FF6347', 'Chrome Tomato', 'OPI', 'trending', 'chrome', 76, ARRAY['summer'], ARRAY['trendy', 'bright', 'fun'], '17-1463 TPX'),
('#8B008B', 'Chrome Magenta', 'Essie', 'trending', 'chrome', 74, ARRAY['fall', 'winter'], ARRAY['trendy', 'dramatic', 'bold'], '19-2432 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- SEASONAL CATEGORY (100 colors)
-- 25 colors per season
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Spring Collection (25 colors)
('#98FB98', 'Mint Fresh', 'OPI', 'seasonal', 'glossy', 70, ARRAY['spring'], ARRAY['fresh', 'energizing', 'optimistic'], '13-0221 TPX'),
('#90EE90', 'Light Green', 'Essie', 'seasonal', 'cream', 68, ARRAY['spring'], ARRAY['natural', 'fresh', 'young'], '13-0220 TPX'),
('#8FBC8F', 'Dark Sea Green', 'Sally Hansen', 'seasonal', 'glossy', 66, ARRAY['spring'], ARRAY['calming', 'natural', 'serene'], '14-0114 TPX'),
('#00FF7F', 'Spring Green', 'Chanel', 'seasonal', 'shimmer', 72, ARRAY['spring'], ARRAY['vibrant', 'lively', 'fresh'], '14-0156 TPX'),
('#00FA9A', 'Medium Spring', 'Dior', 'seasonal', 'cream', 69, ARRAY['spring'], ARRAY['bright', 'cheerful', 'energetic'], '14-0157 TPX'),
('#FFB6C1', 'Light Pink Spring', 'YSL', 'seasonal', 'glossy', 74, ARRAY['spring'], ARRAY['romantic', 'soft', 'feminine'], '12-1706 TPX'),
('#FFC0CB', 'Pink Blossom', 'OPI', 'seasonal', 'shimmer', 76, ARRAY['spring'], ARRAY['blooming', 'sweet', 'delicate'], '12-1707 TPX'),
('#FFB7C5', 'Cherry Spring', 'Essie', 'seasonal', 'cream', 78, ARRAY['spring'], ARRAY['floral', 'romantic', 'fresh'], '12-1708 TPX'),
('#F0E68C', 'Khaki Spring', 'Sally Hansen', 'seasonal', 'glossy', 65, ARRAY['spring'], ARRAY['earthy', 'natural', 'subtle'], '12-0825 TPX'),
('#EEE8AA', 'Pale Goldenrod', 'Chanel', 'seasonal', 'cream', 67, ARRAY['spring'], ARRAY['soft', 'warm', 'gentle'], '12-0824 TPX'),
('#E6E6FA', 'Lavender Spring', 'Dior', 'seasonal', 'shimmer', 80, ARRAY['spring'], ARRAY['ethereal', 'dreamy', 'calm'], '14-3612 TPX'),
('#DDA0DD', 'Plum Spring', 'YSL', 'seasonal', 'glossy', 73, ARRAY['spring'], ARRAY['rich', 'elegant', 'sophisticated'], '15-3412 TPX'),
('#DA70D6', 'Orchid Spring', 'OPI', 'seasonal', 'cream', 75, ARRAY['spring'], ARRAY['exotic', 'vibrant', 'luxurious'], '16-3416 TPX'),
('#FFE4B5', 'Moccasin Spring', 'Essie', 'seasonal', 'glossy', 71, ARRAY['spring'], ARRAY['warm', 'neutral', 'versatile'], '12-0811 TPX'),
('#FFDEAD', 'Navajo Spring', 'Sally Hansen', 'seasonal', 'shimmer', 69, ARRAY['spring'], ARRAY['earthy', 'warm', 'natural'], '13-0917 TPX'),
('#F5DEB3', 'Wheat Spring', 'Chanel', 'seasonal', 'cream', 70, ARRAY['spring'], ARRAY['golden', 'warm', 'comforting'], '13-0922 TPX'),
('#FFB347', 'Peach Spring', 'Dior', 'seasonal', 'glossy', 77, ARRAY['spring'], ARRAY['sweet', 'warm', 'cheerful'], '15-1247 TPX'),
('#FFCC99', 'Peach Puff Spring', 'YSL', 'seasonal', 'shimmer', 75, ARRAY['spring'], ARRAY['soft', 'delicate', 'romantic'], '14-1228 TPX'),
('#FFDAB9', 'Peach Light', 'OPI', 'seasonal', 'cream', 73, ARRAY['spring'], ARRAY['gentle', 'warm', 'inviting'], '12-0917 TPX'),
('#87CEEB', 'Sky Blue Spring', 'Essie', 'seasonal', 'glossy', 79, ARRAY['spring'], ARRAY['clear', 'fresh', 'optimistic'], '14-4318 TPX'),
('#87CEFA', 'Light Sky Spring', 'Sally Hansen', 'seasonal', 'shimmer', 81, ARRAY['spring'], ARRAY['airy', 'light', 'peaceful'], '14-4313 TPX'),
('#ADD8E6', 'Light Blue Spring', 'Chanel', 'seasonal', 'cream', 77, ARRAY['spring'], ARRAY['calm', 'serene', 'gentle'], '13-4411 TPX'),
('#AFEEEE', 'Pale Turquoise', 'Dior', 'seasonal', 'glossy', 76, ARRAY['spring'], ARRAY['refreshing', 'cool', 'tropical'], '13-5309 TPX'),
('#40E0D0', 'Turquoise Spring', 'YSL', 'seasonal', 'shimmer', 82, ARRAY['spring'], ARRAY['vibrant', 'energetic', 'exotic'], '15-5519 TPX'),
('#48D1CC', 'Medium Turquoise Spring', 'OPI', 'seasonal', 'cream', 78, ARRAY['spring'], ARRAY['lively', 'bright', 'refreshing'], '15-5217 TPX'),

-- Summer Collection (25 colors)
('#FF6347', 'Tomato Summer', 'Essie', 'seasonal', 'glossy', 82, ARRAY['summer'], ARRAY['juicy', 'vibrant', 'fun'], '17-1463 TPX'),
('#FF7F50', 'Coral Summer', 'Sally Hansen', 'seasonal', 'shimmer', 84, ARRAY['summer'], ARRAY['tropical', 'warm', 'beachy'], '16-1546 TPX'),
('#FF8C00', 'Dark Orange Summer', 'Chanel', 'seasonal', 'cream', 78, ARRAY['summer'], ARRAY['sunset', 'warm', 'energetic'], '16-1459 TPX'),
('#FFA500', 'Orange Summer', 'Dior', 'seasonal', 'glossy', 76, ARRAY['summer'], ARRAY['bright', 'cheerful', 'citrus'], '15-1263 TPX'),
('#FFD700', 'Gold Summer', 'YSL', 'seasonal', 'chrome', 88, ARRAY['summer'], ARRAY['luxurious', 'sunny', 'radiant'], '13-0859 TPX'),
('#FFFF00', 'Yellow Summer', 'OPI', 'seasonal', 'shimmer', 74, ARRAY['summer'], ARRAY['bright', 'happy', 'energetic'], '12-0643 TPX'),
('#FFFFE0', 'Light Yellow Summer', 'Essie', 'seasonal', 'cream', 70, ARRAY['summer'], ARRAY['soft', 'gentle', 'sunny'], '11-0616 TPX'),
('#00CED1', 'Dark Turquoise', 'Sally Hansen', 'seasonal', 'glossy', 86, ARRAY['summer'], ARRAY['oceanic', 'cool', 'refreshing'], '15-4825 TPX'),
('#00BFFF', 'Deep Sky Blue', 'Chanel', 'seasonal', 'shimmer', 85, ARRAY['summer'], ARRAY['clear', 'bright', 'infinite'], '15-4535 TPX'),
('#1E90FF', 'Dodger Blue', 'Dior', 'seasonal', 'cream', 83, ARRAY['summer'], ARRAY['electric', 'bold', 'modern'], '16-4535 TPX'),
('#00FFFF', 'Cyan Summer', 'YSL', 'seasonal', 'glossy', 80, ARRAY['summer'], ARRAY['vibrant', 'cool', 'futuristic'], '14-4811 TPX'),
('#7FFFD4', 'Aquamarine', 'OPI', 'seasonal', 'shimmer', 79, ARRAY['summer'], ARRAY['tropical', 'serene', 'exotic'], '14-5416 TPX'),
('#66CDAA', 'Medium Aquamarine', 'Essie', 'seasonal', 'cream', 77, ARRAY['summer'], ARRAY['refreshing', 'natural', 'calming'], '14-5714 TPX'),
('#FF1493', 'Deep Pink Summer', 'Sally Hansen', 'seasonal', 'glossy', 87, ARRAY['summer'], ARRAY['hot', 'bold', 'passionate'], '18-2436 TPX'),
('#FF69B4', 'Hot Pink Summer', 'Chanel', 'seasonal', 'shimmer', 89, ARRAY['summer'], ARRAY['fun', 'energetic', 'playful'], '17-2034 TPX'),
('#FF00FF', 'Magenta Summer', 'Dior', 'seasonal', 'cream', 81, ARRAY['summer'], ARRAY['electric', 'vibrant', 'bold'], '18-2045 TPX'),
('#F0F8FF', 'Alice Blue Summer', 'YSL', 'seasonal', 'glossy', 72, ARRAY['summer'], ARRAY['dreamy', 'soft', 'ethereal'], '11-4301 TPX'),
('#E0FFFF', 'Light Cyan Summer', 'OPI', 'seasonal', 'shimmer', 75, ARRAY['summer'], ARRAY['icy', 'cool', 'refreshing'], '12-5204 TPX'),
('#B0E0E6', 'Powder Blue Summer', 'Essie', 'seasonal', 'cream', 73, ARRAY['summer'], ARRAY['soft', 'baby', 'gentle'], '14-4306 TPX'),
('#98FF98', 'Pale Green Summer', 'Sally Hansen', 'seasonal', 'glossy', 71, ARRAY['summer'], ARRAY['fresh', 'natural', 'light'], '13-0221 TPX'),
('#32CD32', 'Lime Green Summer', 'Chanel', 'seasonal', 'shimmer', 76, ARRAY['summer'], ARRAY['zesty', 'bright', 'energetic'], '14-0452 TPX'),
('#00FF00', 'Neon Green Summer', 'Dior', 'seasonal', 'cream', 78, ARRAY['summer'], ARRAY['electric', 'bold', 'modern'], '15-0545 TPX'),
('#7FFF00', 'Chartreuse Summer', 'YSL', 'seasonal', 'glossy', 74, ARRAY['summer'], ARRAY['unique', 'bright', 'fresh'], '14-0445 TPX'),
('#ADFF2F', 'Green Yellow Summer', 'OPI', 'seasonal', 'shimmer', 72, ARRAY['summer'], ARRAY['citrus', 'tangy', 'vibrant'], '13-0550 TPX'),
('#9AFF9A', 'Mint Summer', 'Essie', 'seasonal', 'cream', 70, ARRAY['summer'], ARRAY['cooling', 'fresh', 'soothing'], '13-0117 TPX'),

-- Fall Collection (25 colors)
('#D2691E', 'Chocolate Fall', 'Sally Hansen', 'seasonal', 'glossy', 80, ARRAY['fall'], ARRAY['rich', 'warm', 'indulgent'], '18-1142 TPX'),
('#8B4513', 'Saddle Brown', 'Chanel', 'seasonal', 'cream', 78, ARRAY['fall'], ARRAY['earthy', 'rustic', 'grounded'], '19-1217 TPX'),
('#A0522D', 'Sienna Fall', 'Dior', 'seasonal', 'shimmer', 82, ARRAY['fall'], ARRAY['warm', 'terracotta', 'sophisticated'], '18-1340 TPX'),
('#B22222', 'Firebrick Fall', 'YSL', 'seasonal', 'glossy', 85, ARRAY['fall'], ARRAY['bold', 'warm', 'traditional'], '18-1664 TPX'),
('#DC143C', 'Crimson Fall', 'OPI', 'seasonal', 'cream', 87, ARRAY['fall'], ARRAY['classic', 'passionate', 'elegant'], '18-1763 TPX'),
('#8B0000', 'Dark Red Fall', 'Essie', 'seasonal', 'shimmer', 89, ARRAY['fall'], ARRAY['deep', 'luxurious', 'dramatic'], '19-1557 TPX'),
('#800020', 'Burgundy Fall', 'Sally Hansen', 'seasonal', 'glossy', 90, ARRAY['fall'], ARRAY['wine', 'sophisticated', 'rich'], '19-1617 TPX'),
('#FF8C00', 'Dark Orange Fall', 'Chanel', 'seasonal', 'cream', 76, ARRAY['fall'], ARRAY['harvest', 'warm', 'festive'], '16-1459 TPX'),
('#FF7F50', 'Coral Fall', 'Dior', 'seasonal', 'shimmer', 74, ARRAY['fall'], ARRAY['sunset', 'warm', 'transitional'], '16-1546 TPX'),
('#CD853F', 'Peru Fall', 'YSL', 'seasonal', 'glossy', 72, ARRAY['fall'], ARRAY['nutty', 'warm', 'natural'], '16-1439 TPX'),
('#DEB887', 'Burlywood Fall', 'OPI', 'seasonal', 'cream', 73, ARRAY['fall'], ARRAY['cozy', 'neutral', 'versatile'], '14-1118 TPX'),
('#F4A460', 'Sandy Brown Fall', 'Essie', 'seasonal', 'shimmer', 71, ARRAY['fall'], ARRAY['beachy', 'warm', 'soft'], '15-1327 TPX'),
('#DAA520', 'Goldenrod Fall', 'Sally Hansen', 'seasonal', 'glossy', 77, ARRAY['fall'], ARRAY['golden', 'harvest', 'rich'], '15-0953 TPX'),
('#B8860B', 'Dark Goldenrod', 'Chanel', 'seasonal', 'cream', 75, ARRAY['fall'], ARRAY['deep gold', 'luxurious', 'warm'], '16-0953 TPX'),
('#4B0082', 'Indigo Fall', 'Dior', 'seasonal', 'shimmer', 83, ARRAY['fall'], ARRAY['mysterious', 'deep', 'cosmic'], '19-3938 TPX'),
('#483D8B', 'Dark Slate Blue Fall', 'YSL', 'seasonal', 'glossy', 81, ARRAY['fall'], ARRAY['sophisticated', 'cool', 'elegant'], '19-3939 TPX'),
('#6A5ACD', 'Slate Blue Fall', 'OPI', 'seasonal', 'cream', 79, ARRAY['fall'], ARRAY['calming', 'regal', 'unique'], '18-3943 TPX'),
('#9932CC', 'Dark Orchid Fall', 'Essie', 'seasonal', 'shimmer', 84, ARRAY['fall'], ARRAY['exotic', 'rich', 'luxurious'], '18-3339 TPX'),
('#8B008B', 'Dark Magenta Fall', 'Sally Hansen', 'seasonal', 'glossy', 86, ARRAY['fall'], ARRAY['dramatic', 'bold', 'intense'], '19-2432 TPX'),
('#2F4F4F', 'Dark Slate Gray', 'Chanel', 'seasonal', 'cream', 77, ARRAY['fall'], ARRAY['moody', 'sophisticated', 'neutral'], '19-4006 TPX'),
('#556B2F', 'Dark Olive Green', 'Dior', 'seasonal', 'shimmer', 70, ARRAY['fall'], ARRAY['military', 'earthy', 'unique'], '18-0426 TPX'),
('#8B7D6B', 'Bisque Fall', 'YSL', 'seasonal', 'glossy', 68, ARRAY['fall'], ARRAY['neutral', 'warm', 'understated'], '16-1412 TPX'),
('#CD919E', 'Pink Fall', 'OPI', 'seasonal', 'cream', 76, ARRAY['fall'], ARRAY['dusty', 'romantic', 'soft'], '16-1715 TPX'),
('#BC8F8F', 'Rosy Brown Fall', 'Essie', 'seasonal', 'shimmer', 74, ARRAY['fall'], ARRAY['muted', 'warm', 'vintage'], '16-1412 TPX'),
('#F0E68C', 'Khaki Fall', 'Sally Hansen', 'seasonal', 'glossy', 69, ARRAY['fall'], ARRAY['military', 'neutral', 'versatile'], '14-0935 TPX'),

-- Winter Collection (25 colors)
('#191970', 'Midnight Blue Winter', 'Chanel', 'seasonal', 'glossy', 85, ARRAY['winter'], ARRAY['deep', 'mysterious', 'elegant'], '19-4052 TPX'),
('#000080', 'Navy Winter', 'Dior', 'seasonal', 'cream', 87, ARRAY['winter'], ARRAY['classic', 'professional', 'timeless'], '19-4057 TPX'),
('#00008B', 'Dark Blue Winter', 'YSL', 'seasonal', 'shimmer', 83, ARRAY['winter'], ARRAY['rich', 'deep', 'sophisticated'], '19-4050 TPX'),
('#4169E1', 'Royal Blue Winter', 'OPI', 'seasonal', 'glossy', 89, ARRAY['winter'], ARRAY['regal', 'vibrant', 'luxurious'], '19-4049 TPX'),
('#0000CD', 'Medium Blue Winter', 'Essie', 'seasonal', 'cream', 81, ARRAY['winter'], ARRAY['bold', 'electric', 'modern'], '19-4055 TPX'),
('#6495ED', 'Cornflower Winter', 'Sally Hansen', 'seasonal', 'shimmer', 79, ARRAY['winter'], ARRAY['soft', 'dreamy', 'romantic'], '17-4037 TPX'),
('#708090', 'Slate Gray Winter', 'Chanel', 'seasonal', 'glossy', 82, ARRAY['winter'], ARRAY['neutral', 'sophisticated', 'modern'], '18-4005 TPX'),
('#696969', 'Dim Gray Winter', 'Dior', 'seasonal', 'cream', 80, ARRAY['winter'], ARRAY['understated', 'elegant', 'versatile'], '18-0306 TPX'),
('#2F4F4F', 'Dark Slate Winter', 'YSL', 'seasonal', 'shimmer', 84, ARRAY['winter'], ARRAY['moody', 'deep', 'mysterious'], '19-4006 TPX'),
('#000000', 'Black Winter', 'OPI', 'seasonal', 'glossy', 92, ARRAY['winter'], ARRAY['classic', 'edgy', 'timeless'], '19-0303 TPX'),
('#36454F', 'Charcoal Winter', 'Essie', 'seasonal', 'cream', 86, ARRAY['winter'], ARRAY['sophisticated', 'modern', 'sleek'], '19-4007 TPX'),
('#800080', 'Purple Winter', 'Sally Hansen', 'seasonal', 'shimmer', 88, ARRAY['winter'], ARRAY['royal', 'mysterious', 'luxurious'], '19-3536 TPX'),
('#4B0082', 'Indigo Winter', 'Chanel', 'seasonal', 'glossy', 85, ARRAY['winter'], ARRAY['deep', 'cosmic', 'magical'], '19-3938 TPX'),
('#8B008B', 'Dark Magenta Winter', 'Dior', 'seasonal', 'cream', 83, ARRAY['winter'], ARRAY['bold', 'dramatic', 'rich'], '19-2432 TPX'),
('#C0C0C0', 'Silver Winter', 'YSL', 'seasonal', 'chrome', 90, ARRAY['winter'], ARRAY['metallic', 'festive', 'modern'], 'P 179-1 C'),
('#F8F8FF', 'Ghost White Winter', 'OPI', 'seasonal', 'shimmer', 78, ARRAY['winter'], ARRAY['ethereal', 'pure', 'delicate'], '11-0601 TPX'),
('#FFFAFA', 'Snow Winter', 'Essie', 'seasonal', 'cream', 76, ARRAY['winter'], ARRAY['pure', 'crisp', 'clean'], '11-0602 TPX'),
('#F0FFFF', 'Azure Winter', 'Sally Hansen', 'seasonal', 'glossy', 74, ARRAY['winter'], ARRAY['icy', 'cool', 'refreshing'], '11-4301 TPX'),
('#B0C4DE', 'Light Steel Blue', 'Chanel', 'seasonal', 'shimmer', 77, ARRAY['winter'], ARRAY['cool', 'metallic', 'elegant'], '14-4110 TPX'),
('#778899', 'Light Slate Winter', 'Dior', 'seasonal', 'cream', 75, ARRAY['winter'], ARRAY['subtle', 'sophisticated', 'neutral'], '17-4111 TPX'),
('#8B0000', 'Deep Wine Winter', 'YSL', 'seasonal', 'glossy', 91, ARRAY['winter'], ARRAY['rich', 'festive', 'elegant'], '19-1557 TPX'),
('#228B22', 'Forest Green Winter', 'OPI', 'seasonal', 'shimmer', 80, ARRAY['winter'], ARRAY['evergreen', 'natural', 'festive'], '19-5513 TPX'),
('#006400', 'Dark Green Winter', 'Essie', 'seasonal', 'cream', 78, ARRAY['winter'], ARRAY['deep', 'forest', 'mysterious'], '19-5420 TPX'),
('#FFD700', 'Gold Winter', 'Sally Hansen', 'seasonal', 'chrome', 93, ARRAY['winter'], ARRAY['festive', 'luxurious', 'celebratory'], '13-0859 TPX'),
('#B87333', 'Copper Winter', 'Chanel', 'seasonal', 'chrome', 88, ARRAY['winter'], ARRAY['warm metallic', 'rich', 'elegant'], '16-1439 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- CHROME CATEGORY (60 colors)
-- Metallic and chrome finishes
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Silver Chrome Variations (10 colors)
('#C0C0C0', 'Mirror Chrome', 'OPI', 'chrome', 'chrome', 95, ARRAY['fall', 'winter'], ARRAY['futuristic', 'edgy', 'bold'], 'P 179-1 C'),
('#E5E4E2', 'Platinum Chrome', 'Essie', 'chrome', 'chrome', 92, ARRAY['fall', 'winter'], ARRAY['luxurious', 'sophisticated', 'modern'], 'P 179-2 C'),
('#BCC6CC', 'Blue Silver Chrome', 'Sally Hansen', 'chrome', 'chrome', 88, ARRAY['winter'], ARRAY['cool', 'icy', 'sleek'], '14-4107 TPX'),
('#838996', 'Roman Silver Chrome', 'Chanel', 'chrome', 'chrome', 85, ARRAY['fall', 'winter'], ARRAY['antique', 'elegant', 'timeless'], '17-4111 TPX'),
('#C4AEAD', 'Silver Pink Chrome', 'Dior', 'chrome', 'chrome', 83, ARRAY['spring', 'winter'], ARRAY['romantic', 'soft', 'feminine'], '14-4103 TPX'),
('#71797E', 'Silver Chalice Chrome', 'YSL', 'chrome', 'chrome', 80, ARRAY['fall', 'winter'], ARRAY['mysterious', 'deep', 'sophisticated'], '18-4005 TPX'),
('#B2BEB5', 'Ash Gray Chrome', 'OPI', 'chrome', 'chrome', 78, ARRAY['fall', 'winter'], ARRAY['subtle', 'neutral', 'versatile'], '14-4107 TPX'),
('#A8A9AD', 'Silver Chrome', 'Essie', 'chrome', 'chrome', 90, ARRAY['fall', 'winter'], ARRAY['classic', 'metallic', 'timeless'], 'P 179-1 C'),
('#848482', 'Battleship Chrome', 'Sally Hansen', 'chrome', 'chrome', 76, ARRAY['fall', 'winter'], ARRAY['industrial', 'strong', 'modern'], '18-0306 TPX'),
('#C9C0BB', 'Pale Silver Chrome', 'Chanel', 'chrome', 'chrome', 82, ARRAY['spring', 'winter'], ARRAY['delicate', 'ethereal', 'soft'], '13-4103 TPX'),

-- Gold Chrome Variations (10 colors)
('#FFD700', 'Pure Gold Chrome', 'Dior', 'chrome', 'chrome', 94, ARRAY['fall', 'winter'], ARRAY['luxurious', 'opulent', 'rich'], '13-0859 TPX'),
('#FFC125', 'Goldenrod Chrome', 'YSL', 'chrome', 'chrome', 91, ARRAY['fall', 'winter'], ARRAY['warm', 'radiant', 'festive'], '14-0957 TPX'),
('#F4C430', 'Saffron Chrome', 'OPI', 'chrome', 'chrome', 87, ARRAY['fall', 'winter'], ARRAY['exotic', 'spicy', 'unique'], '14-0951 TPX'),
('#FFBF00', 'Amber Chrome', 'Essie', 'chrome', 'chrome', 84, ARRAY['fall', 'winter'], ARRAY['warm', 'honey', 'glowing'], '14-0955 TPX'),
('#B8860B', 'Dark Goldenrod Chrome', 'Sally Hansen', 'chrome', 'chrome', 81, ARRAY['fall', 'winter'], ARRAY['deep', 'rich', 'antique'], '16-0953 TPX'),
('#FFD800', 'School Bus Chrome', 'Chanel', 'chrome', 'chrome', 79, ARRAY['summer', 'fall'], ARRAY['bright', 'bold', 'playful'], '13-0858 TPX'),
('#FDD017', 'Bright Gold Chrome', 'Dior', 'chrome', 'chrome', 88, ARRAY['fall', 'winter'], ARRAY['shiny', 'luxurious', 'eye-catching'], '13-0859 TPX'),
('#F0DC82', 'Buff Chrome', 'YSL', 'chrome', 'chrome', 75, ARRAY['spring', 'fall'], ARRAY['subtle', 'warm', 'understated'], '13-0940 TPX'),
('#EEE8AA', 'Pale Goldenrod Chrome', 'OPI', 'chrome', 'chrome', 73, ARRAY['spring', 'summer'], ARRAY['soft', 'gentle', 'delicate'], '12-0824 TPX'),
('#F0E130', 'Dandelion Chrome', 'Essie', 'chrome', 'chrome', 77, ARRAY['spring', 'summer'], ARRAY['cheerful', 'bright', 'sunny'], '12-0752 TPX'),

-- Rose Gold Chrome (10 colors)
('#B76E79', 'Rose Gold Chrome', 'Sally Hansen', 'chrome', 'chrome', 93, ARRAY['spring', 'fall', 'winter'], ARRAY['romantic', 'trendy', 'feminine'], '16-1620 TPX'),
('#E8B4B8', 'Soft Rose Gold', 'Chanel', 'chrome', 'chrome', 95, ARRAY['spring', 'summer'], ARRAY['delicate', 'elegant', 'sophisticated'], '14-1714 TPX'),
('#C9A0A1', 'Dusty Rose Gold', 'Dior', 'chrome', 'chrome', 89, ARRAY['fall', 'winter'], ARRAY['vintage', 'muted', 'classy'], '15-1607 TPX'),
('#D4A76A', 'Bronze Gold Chrome', 'YSL', 'chrome', 'chrome', 86, ARRAY['fall', 'winter'], ARRAY['warm', 'earthy', 'luxurious'], '16-1139 TPX'),
('#CC9966', 'Camel Gold Chrome', 'OPI', 'chrome', 'chrome', 82, ARRAY['fall', 'winter'], ARRAY['neutral', 'sophisticated', 'versatile'], '16-1220 TPX'),
('#CD7F32', 'Bronze Chrome', 'Essie', 'chrome', 'chrome', 84, ARRAY['fall', 'winter'], ARRAY['antique', 'warm', 'rich'], '17-1336 TPX'),
('#C19A6B', 'Camel Chrome', 'Sally Hansen', 'chrome', 'chrome', 78, ARRAY['fall', 'winter'], ARRAY['earthy', 'natural', 'warm'], '16-1221 TPX'),
('#B87333', 'Copper Chrome', 'Chanel', 'chrome', 'chrome', 90, ARRAY['fall', 'winter'], ARRAY['metallic', 'warm', 'striking'], '16-1439 TPX'),
('#DA8A67', 'Pale Copper Chrome', 'Dior', 'chrome', 'chrome', 76, ARRAY['summer', 'fall'], ARRAY['peachy', 'soft', 'warm'], '15-1334 TPX'),
('#CC7722', 'Ochre Chrome', 'YSL', 'chrome', 'chrome', 74, ARRAY['fall'], ARRAY['earthy', 'artistic', 'unique'], '16-1139 TPX'),

-- Colored Chrome (30 colors)
('#4682B4', 'Steel Blue Chrome', 'OPI', 'chrome', 'chrome', 85, ARRAY['winter'], ARRAY['cool', 'modern', 'sleek'], '18-4028 TPX'),
('#4169E1', 'Royal Blue Chrome', 'Essie', 'chrome', 'chrome', 87, ARRAY['winter'], ARRAY['regal', 'bold', 'luxurious'], '19-4049 TPX'),
('#00CED1', 'Dark Turquoise Chrome', 'Sally Hansen', 'chrome', 'chrome', 83, ARRAY['summer'], ARRAY['tropical', 'vibrant', 'exotic'], '15-4825 TPX'),
('#40E0D0', 'Turquoise Chrome', 'Chanel', 'chrome', 'chrome', 88, ARRAY['summer'], ARRAY['bright', 'refreshing', 'energetic'], '15-5519 TPX'),
('#48D1CC', 'Medium Turquoise Chrome', 'Dior', 'chrome', 'chrome', 81, ARRAY['summer'], ARRAY['oceanic', 'cool', 'serene'], '15-5217 TPX'),
('#20B2AA', 'Light Sea Green Chrome', 'YSL', 'chrome', 'chrome', 79, ARRAY['summer'], ARRAY['aquatic', 'fresh', 'vibrant'], '15-5218 TPX'),
('#3CB371', 'Medium Sea Green Chrome', 'OPI', 'chrome', 'chrome', 77, ARRAY['spring', 'summer'], ARRAY['natural', 'lush', 'refreshing'], '15-5718 TPX'),
('#2E8B57', 'Sea Green Chrome', 'Essie', 'chrome', 'chrome', 75, ARRAY['spring', 'summer'], ARRAY['deep', 'natural', 'calming'], '16-5721 TPX'),
('#228B22', 'Forest Green Chrome', 'Sally Hansen', 'chrome', 'chrome', 80, ARRAY['fall', 'winter'], ARRAY['evergreen', 'rich', 'natural'], '19-5513 TPX'),
('#008000', 'Green Chrome', 'Chanel', 'chrome', 'chrome', 82, ARRAY['spring', 'summer'], ARRAY['fresh', 'vibrant', 'lively'], '16-6340 TPX'),
('#9370DB', 'Medium Purple Chrome', 'Dior', 'chrome', 'chrome', 86, ARRAY['spring', 'fall'], ARRAY['mystical', 'elegant', 'luxurious'], '17-3725 TPX'),
('#8A2BE2', 'Blue Violet Chrome', 'YSL', 'chrome', 'chrome', 84, ARRAY['spring', 'fall'], ARRAY['electric', 'bold', 'modern'], '18-3838 TPX'),
('#9400D3', 'Violet Chrome', 'OPI', 'chrome', 'chrome', 82, ARRAY['spring', 'fall'], ARRAY['royal', 'rich', 'dramatic'], '18-3839 TPX'),
('#8B008B', 'Dark Magenta Chrome', 'Essie', 'chrome', 'chrome', 88, ARRAY['fall', 'winter'], ARRAY['intense', 'sophisticated', 'bold'], '19-2432 TPX'),
('#FF1493', 'Deep Pink Chrome', 'Sally Hansen', 'chrome', 'chrome', 90, ARRAY['summer'], ARRAY['hot', 'vibrant', 'energetic'], '18-2436 TPX'),
('#FF69B4', 'Hot Pink Chrome', 'Chanel', 'chrome', 'chrome', 92, ARRAY['summer'], ARRAY['playful', 'bold', 'fun'], '17-2034 TPX'),
('#FFC0CB', 'Pink Chrome', 'Dior', 'chrome', 'chrome', 89, ARRAY['spring', 'summer'], ARRAY['soft', 'romantic', 'feminine'], '12-1706 TPX'),
('#FFB6C1', 'Light Pink Chrome', 'YSL', 'chrome', 'chrome', 86, ARRAY['spring'], ARRAY['delicate', 'sweet', 'gentle'], '12-1304 TPX'),
('#FFA07A', 'Light Salmon Chrome', 'OPI', 'chrome', 'chrome', 83, ARRAY['summer'], ARRAY['peachy', 'warm', 'inviting'], '14-1323 TPX'),
('#FA8072', 'Salmon Chrome', 'Essie', 'chrome', 'chrome', 81, ARRAY['summer'], ARRAY['coral', 'tropical', 'warm'], '16-1450 TPX'),
('#FF7F50', 'Coral Chrome', 'Sally Hansen', 'chrome', 'chrome', 87, ARRAY['summer'], ARRAY['vibrant', 'beachy', 'cheerful'], '16-1546 TPX'),
('#FF6347', 'Tomato Chrome', 'Chanel', 'chrome', 'chrome', 85, ARRAY['summer'], ARRAY['bright', 'juicy', 'bold'], '17-1463 TPX'),
('#FF4500', 'Orange Red Chrome', 'Dior', 'chrome', 'chrome', 83, ARRAY['summer', 'fall'], ARRAY['fiery', 'energetic', 'intense'], '17-1464 TPX'),
('#FFA500', 'Orange Chrome', 'YSL', 'chrome', 'chrome', 81, ARRAY['summer', 'fall'], ARRAY['citrus', 'bright', 'cheerful'], '15-1263 TPX'),
('#FF8C00', 'Dark Orange Chrome', 'OPI', 'chrome', 'chrome', 79, ARRAY['fall'], ARRAY['autumn', 'warm', 'rich'], '16-1459 TPX'),
('#DC143C', 'Crimson Chrome', 'Essie', 'chrome', 'chrome', 91, ARRAY['fall', 'winter'], ARRAY['classic', 'bold', 'passionate'], '18-1763 TPX'),
('#B22222', 'Firebrick Chrome', 'Sally Hansen', 'chrome', 'chrome', 88, ARRAY['fall', 'winter'], ARRAY['deep', 'warm', 'intense'], '18-1664 TPX'),
('#8B0000', 'Dark Red Chrome', 'Chanel', 'chrome', 'chrome', 93, ARRAY['fall', 'winter'], ARRAY['luxurious', 'rich', 'sophisticated'], '19-1557 TPX'),
('#800020', 'Burgundy Chrome', 'Dior', 'chrome', 'chrome', 94, ARRAY['fall', 'winter'], ARRAY['wine', 'elegant', 'deep'], '19-1617 TPX'),
('#4B0082', 'Indigo Chrome', 'YSL', 'chrome', 'chrome', 89, ARRAY['fall', 'winter'], ARRAY['mysterious', 'cosmic', 'deep'], '19-3938 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- GLITTER CATEGORY (40 colors)
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Gold Glitters (8 colors)
('#FFD700', 'Gold Glitter', 'OPI', 'glitter', 'glitter', 90, ARRAY['fall', 'winter'], ARRAY['festive', 'glamorous', 'celebratory'], '13-0859 TPX'),
('#FFC125', 'Goldenrod Glitter', 'Essie', 'glitter', 'glitter', 87, ARRAY['fall', 'winter'], ARRAY['warm', 'sparkling', 'luxurious'], '14-0957 TPX'),
('#F0E68C', 'Khaki Gold Glitter', 'Sally Hansen', 'glitter', 'glitter', 82, ARRAY['fall'], ARRAY['subtle', 'elegant', 'sophisticated'], '12-0825 TPX'),
('#EEE8AA', 'Pale Gold Glitter', 'Chanel', 'glitter', 'glitter', 79, ARRAY['spring', 'summer'], ARRAY['delicate', 'shimmering', 'soft'], '12-0824 TPX'),
('#FFE55C', 'Mustard Glitter', 'Dior', 'glitter', 'glitter', 75, ARRAY['fall'], ARRAY['unique', 'warm', 'bold'], '13-0755 TPX'),
('#F4C430', 'Saffron Glitter', 'YSL', 'glitter', 'glitter', 84, ARRAY['fall', 'winter'], ARRAY['exotic', 'rich', 'vibrant'], '14-0951 TPX'),
('#FFB300', 'Amber Glitter', 'OPI', 'glitter', 'glitter', 86, ARRAY['fall', 'winter'], ARRAY['honey', 'warm', 'glowing'], '14-0955 TPX'),
('#FFA000', 'Orange Gold Glitter', 'Essie', 'glitter', 'glitter', 81, ARRAY['fall'], ARRAY['sunset', 'warm', 'energetic'], '15-1050 TPX'),

-- Silver Glitters (8 colors)
('#C0C0C0', 'Silver Sparkle', 'Sally Hansen', 'glitter', 'glitter', 92, ARRAY['fall', 'winter'], ARRAY['festive', 'elegant', 'classic'], 'P 179-1 C'),
('#E5E4E2', 'Platinum Glitter', 'Chanel', 'glitter', 'glitter', 89, ARRAY['winter'], ARRAY['luxurious', 'sophisticated', 'icy'], 'P 179-2 C'),
('#D3D3D3', 'Light Gray Glitter', 'Dior', 'glitter', 'glitter', 83, ARRAY['fall', 'winter'], ARRAY['subtle', 'modern', 'versatile'], '13-4103 TPX'),
('#A9A9A9', 'Dark Gray Glitter', 'YSL', 'glitter', 'glitter', 80, ARRAY['fall', 'winter'], ARRAY['edgy', 'sophisticated', 'mysterious'], '17-4111 TPX'),
('#DCDCDC', 'Gainsboro Glitter', 'OPI', 'glitter', 'glitter', 77, ARRAY['spring', 'winter'], ARRAY['soft', 'ethereal', 'delicate'], '13-4103 TPX'),
('#B8B8B8', 'Silver Gray Glitter', 'Essie', 'glitter', 'glitter', 85, ARRAY['fall', 'winter'], ARRAY['neutral', 'shimmering', 'elegant'], '14-4107 TPX'),
('#C0C0C0', 'Pure Silver Glitter', 'Sally Hansen', 'glitter', 'glitter', 91, ARRAY['winter'], ARRAY['bright', 'festive', 'eye-catching'], 'P 179-1 C'),
('#E0E0E0', 'Light Silver Glitter', 'Chanel', 'glitter', 'glitter', 78, ARRAY['spring', 'winter'], ARRAY['subtle', 'sparkling', 'refined'], '13-4103 TPX'),

-- Colored Glitters (24 colors)
('#FF1493', 'Pink Glitter', 'Dior', 'glitter', 'glitter', 88, ARRAY['spring', 'summer'], ARRAY['fun', 'playful', 'bold'], '18-2436 TPX'),
('#FF69B4', 'Hot Pink Glitter', 'YSL', 'glitter', 'glitter', 90, ARRAY['summer'], ARRAY['vibrant', 'energetic', 'party'], '17-2034 TPX'),
('#FFC0CB', 'Baby Pink Glitter', 'OPI', 'glitter', 'glitter', 84, ARRAY['spring'], ARRAY['soft', 'romantic', 'sweet'], '12-1706 TPX'),
('#FFB6C1', 'Light Pink Glitter', 'Essie', 'glitter', 'glitter', 82, ARRAY['spring', 'summer'], ARRAY['delicate', 'feminine', 'gentle'], '12-1304 TPX'),
('#800080', 'Purple Sparkle', 'Sally Hansen', 'glitter', 'glitter', 85, ARRAY['fall', 'winter'], ARRAY['dramatic', 'festive', 'bold'], '19-3536 TPX'),
('#9370DB', 'Medium Purple Glitter', 'Chanel', 'glitter', 'glitter', 83, ARRAY['spring', 'fall'], ARRAY['mystical', 'magical', 'dreamy'], '17-3725 TPX'),
('#8A2BE2', 'Blue Violet Glitter', 'Dior', 'glitter', 'glitter', 81, ARRAY['spring', 'fall'], ARRAY['electric', 'bold', 'modern'], '18-3838 TPX'),
('#4B0082', 'Indigo Glitter', 'YSL', 'glitter', 'glitter', 87, ARRAY['winter'], ARRAY['deep', 'mysterious', 'cosmic'], '19-3938 TPX'),
('#0000FF', 'Blue Glitter', 'OPI', 'glitter', 'glitter', 86, ARRAY['summer', 'winter'], ARRAY['bright', 'bold', 'electric'], '19-4055 TPX'),
('#4169E1', 'Royal Blue Glitter', 'Essie', 'glitter', 'glitter', 89, ARRAY['winter'], ARRAY['regal', 'luxurious', 'festive'], '19-4049 TPX'),
('#00CED1', 'Turquoise Glitter', 'Sally Hansen', 'glitter', 'glitter', 84, ARRAY['summer'], ARRAY['tropical', 'vibrant', 'exotic'], '15-4825 TPX'),
('#40E0D0', 'Bright Turquoise Glitter', 'Chanel', 'glitter', 'glitter', 82, ARRAY['summer'], ARRAY['oceanic', 'refreshing', 'lively'], '15-5519 TPX'),
('#00FF00', 'Green Glitter', 'Dior', 'glitter', 'glitter', 78, ARRAY['spring', 'summer'], ARRAY['fresh', 'vibrant', 'energetic'], '15-0545 TPX'),
('#32CD32', 'Lime Green Glitter', 'YSL', 'glitter', 'glitter', 76, ARRAY['summer'], ARRAY['zesty', 'bright', 'fun'], '14-0452 TPX'),
('#228B22', 'Forest Green Glitter', 'OPI', 'glitter', 'glitter', 80, ARRAY['winter'], ARRAY['evergreen', 'festive', 'rich'], '19-5513 TPX'),
('#FF4500', 'Orange Glitter', 'Essie', 'glitter', 'glitter', 83, ARRAY['fall'], ARRAY['bold', 'festive', 'energetic'], '16-1459 TPX'),
('#FFA500', 'Bright Orange Glitter', 'Sally Hansen', 'glitter', 'glitter', 81, ARRAY['summer', 'fall'], ARRAY['citrus', 'vibrant', 'cheerful'], '15-1263 TPX'),
('#FF6347', 'Tomato Glitter', 'Chanel', 'glitter', 'glitter', 79, ARRAY['summer'], ARRAY['bright', 'juicy', 'playful'], '17-1463 TPX'),
('#DC143C', 'Crimson Glitter', 'Dior', 'glitter', 'glitter', 91, ARRAY['fall', 'winter'], ARRAY['classic', 'bold', 'festive'], '18-1763 TPX'),
('#8B0000', 'Dark Red Glitter', 'YSL', 'glitter', 'glitter', 93, ARRAY['winter'], ARRAY['luxurious', 'rich', 'dramatic'], '19-1557 TPX'),
('#000000', 'Black Glitter', 'OPI', 'glitter', 'glitter', 88, ARRAY['fall', 'winter'], ARRAY['edgy', 'mysterious', 'sophisticated'], '19-0303 TPX'),
('#FFFFFF', 'White Glitter', 'Essie', 'glitter', 'glitter', 85, ARRAY['winter'], ARRAY['pure', 'festive', 'angelic'], '11-0601 TPX'),
('#F0F8FF', 'Alice Blue Glitter', 'Sally Hansen', 'glitter', 'glitter', 73, ARRAY['winter', 'spring'], ARRAY['dreamy', 'soft', 'ethereal'], '11-4301 TPX'),
('#E6E6FA', 'Lavender Glitter', 'Chanel', 'glitter', 'glitter', 77, ARRAY['spring'], ARRAY['romantic', 'gentle', 'magical'], '14-3612 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- MATTE CATEGORY (40 colors)
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Matte Neutrals (10 colors)
('#2F4F4F', 'Matte Charcoal', 'OPI', 'matte', 'matte', 85, ARRAY['fall', 'winter'], ARRAY['modern', 'edgy', 'sophisticated'], '18-4005 TPX'),
('#000000', 'Matte Black', 'Essie', 'matte', 'matte', 92, ARRAY['fall', 'winter'], ARRAY['edgy', 'dramatic', 'modern'], '19-0303 TPX'),
('#FFFFFF', 'Matte White', 'Sally Hansen', 'matte', 'matte', 78, ARRAY['spring', 'summer'], ARRAY['clean', 'modern', 'minimalist'], '11-0601 TPX'),
('#808080', 'Matte Gray', 'Chanel', 'matte', 'matte', 83, ARRAY['fall', 'winter'], ARRAY['neutral', 'sophisticated', 'versatile'], '18-0306 TPX'),
('#696969', 'Matte Dim Gray', 'Dior', 'matte', 'matte', 80, ARRAY['fall', 'winter'], ARRAY['understated', 'elegant', 'modern'], '18-0306 TPX'),
('#A9A9A9', 'Matte Dark Gray', 'YSL', 'matte', 'matte', 77, ARRAY['fall', 'winter'], ARRAY['subtle', 'sophisticated', 'neutral'], '17-4111 TPX'),
('#D3D3D3', 'Matte Light Gray', 'OPI', 'matte', 'matte', 75, ARRAY['spring', 'fall'], ARRAY['soft', 'minimal', 'clean'], '13-4103 TPX'),
('#F5F5F5', 'Matte White Smoke', 'Essie', 'matte', 'matte', 72, ARRAY['spring', 'summer'], ARRAY['ethereal', 'light', 'airy'], '11-0602 TPX'),
('#36454F', 'Matte Charcoal Blue', 'Sally Hansen', 'matte', 'matte', 81, ARRAY['fall', 'winter'], ARRAY['deep', 'mysterious', 'sophisticated'], '19-4007 TPX'),
('#1C1C1C', 'Matte Eerie Black', 'Chanel', 'matte', 'matte', 88, ARRAY['fall', 'winter'], ARRAY['ultra-dark', 'edgy', 'bold'], '19-0303 TPX'),

-- Matte Reds & Pinks (10 colors)
('#DC143C', 'Matte Red', 'Dior', 'matte', 'matte', 90, ARRAY['fall', 'winter'], ARRAY['bold', 'sophisticated', 'modern'], '18-1763 TPX'),
('#8B0000', 'Matte Dark Red', 'YSL', 'matte', 'matte', 87, ARRAY['fall', 'winter'], ARRAY['deep', 'luxurious', 'dramatic'], '19-1557 TPX'),
('#B22222', 'Matte Firebrick', 'OPI', 'matte', 'matte', 84, ARRAY['fall', 'winter'], ARRAY['warm', 'intense', 'bold'], '18-1664 TPX'),
('#FFB6C1', 'Matte Pink', 'Essie', 'matte', 'matte', 82, ARRAY['spring', 'summer'], ARRAY['soft', 'modern', 'chic'], '12-1304 TPX'),
('#FF69B4', 'Matte Hot Pink', 'Sally Hansen', 'matte', 'matte', 86, ARRAY['summer'], ARRAY['bold', 'trendy', 'vibrant'], '17-2034 TPX'),
('#C71585', 'Matte Violet Red', 'Chanel', 'matte', 'matte', 79, ARRAY['fall', 'winter'], ARRAY['rich', 'sophisticated', 'unique'], '18-2025 TPX'),
('#DB7093', 'Matte Pale Violet', 'Dior', 'matte', 'matte', 76, ARRAY['spring', 'fall'], ARRAY['subtle', 'romantic', 'vintage'], '15-2215 TPX'),
('#FF1493', 'Matte Deep Pink', 'YSL', 'matte', 'matte', 88, ARRAY['summer'], ARRAY['vibrant', 'bold', 'modern'], '18-2436 TPX'),
('#CD5C5C', 'Matte Indian Red', 'OPI', 'matte', 'matte', 74, ARRAY['fall'], ARRAY['earthy', 'warm', 'natural'], '17-1544 TPX'),
('#F08080', 'Matte Light Coral', 'Essie', 'matte', 'matte', 71, ARRAY['summer'], ARRAY['soft', 'beachy', 'gentle'], '15-1415 TPX'),

-- Matte Blues & Purples (10 colors)
('#000080', 'Matte Navy', 'Sally Hansen', 'matte', 'matte', 89, ARRAY['fall', 'winter'], ARRAY['classic', 'professional', 'deep'], '19-4057 TPX'),
('#191970', 'Matte Midnight Blue', 'Chanel', 'matte', 'matte', 91, ARRAY['winter'], ARRAY['mysterious', 'elegant', 'sophisticated'], '19-4052 TPX'),
('#4169E1', 'Matte Royal Blue', 'Dior', 'matte', 'matte', 85, ARRAY['winter'], ARRAY['regal', 'bold', 'luxurious'], '19-4049 TPX'),
('#6495ED', 'Matte Cornflower', 'YSL', 'matte', 'matte', 73, ARRAY['spring', 'summer'], ARRAY['soft', 'dreamy', 'calm'], '17-4037 TPX'),
('#800080', 'Matte Purple', 'OPI', 'matte', 'matte', 86, ARRAY['fall', 'winter'], ARRAY['royal', 'mysterious', 'bold'], '19-3536 TPX'),
('#4B0082', 'Matte Indigo', 'Essie', 'matte', 'matte', 84, ARRAY['winter'], ARRAY['deep', 'cosmic', 'mystical'], '19-3938 TPX'),
('#8B008B', 'Matte Dark Magenta', 'Sally Hansen', 'matte', 'matte', 82, ARRAY['fall', 'winter'], ARRAY['dramatic', 'bold', 'sophisticated'], '19-2432 TPX'),
('#9370DB', 'Matte Medium Purple', 'Chanel', 'matte', 'matte', 78, ARRAY['spring', 'fall'], ARRAY['elegant', 'unique', 'refined'], '17-3725 TPX'),
('#8A2BE2', 'Matte Blue Violet', 'Dior', 'matte', 'matte', 76, ARRAY['spring', 'fall'], ARRAY['electric', 'modern', 'bold'], '18-3838 TPX'),
('#483D8B', 'Matte Dark Slate Blue', 'YSL', 'matte', 'matte', 74, ARRAY['fall', 'winter'], ARRAY['sophisticated', 'deep', 'mysterious'], '19-3939 TPX'),

-- Matte Greens & Earth Tones (10 colors)
('#228B22', 'Matte Forest Green', 'OPI', 'matte', 'matte', 81, ARRAY['fall', 'winter'], ARRAY['natural', 'rich', 'earthy'], '19-5513 TPX'),
('#006400', 'Matte Dark Green', 'Essie', 'matte', 'matte', 79, ARRAY['winter'], ARRAY['deep', 'mysterious', 'forest'], '19-5420 TPX'),
('#556B2F', 'Matte Olive', 'Sally Hansen', 'matte', 'matte', 75, ARRAY['fall'], ARRAY['military', 'earthy', 'unique'], '18-0426 TPX'),
('#8B4513', 'Matte Saddle Brown', 'Chanel', 'matte', 'matte', 77, ARRAY['fall', 'winter'], ARRAY['rustic', 'warm', 'grounded'], '19-1217 TPX'),
('#A0522D', 'Matte Sienna', 'Dior', 'matte', 'matte', 73, ARRAY['fall'], ARRAY['terracotta', 'warm', 'earthy'], '18-1340 TPX'),
('#D2691E', 'Matte Chocolate', 'YSL', 'matte', 'matte', 80, ARRAY['fall', 'winter'], ARRAY['rich', 'indulgent', 'warm'], '18-1142 TPX'),
('#BC8F8F', 'Matte Rosy Brown', 'OPI', 'matte', 'matte', 70, ARRAY['fall'], ARRAY['subtle', 'vintage', 'warm'], '16-1412 TPX'),
('#F4A460', 'Matte Sandy Brown', 'Essie', 'matte', 'matte', 68, ARRAY['summer', 'fall'], ARRAY['beachy', 'warm', 'natural'], '15-1327 TPX'),
('#DAA520', 'Matte Goldenrod', 'Sally Hansen', 'matte', 'matte', 72, ARRAY['fall'], ARRAY['golden', 'harvest', 'warm'], '15-0953 TPX'),
('#BDB76B', 'Matte Dark Khaki', 'Chanel', 'matte', 'matte', 69, ARRAY['fall'], ARRAY['military', 'neutral', 'understated'], '15-0719 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- FRENCH CATEGORY (30 colors)
-- Classic and modern French manicure variations
-- ============================================================================

INSERT INTO colors (hex_code, name, brand, category, finish, trending_score, season, mood_tags, pantone_code) VALUES
-- Classic French Base Colors (10 colors)
('#FFFFFF', 'French White', 'OPI', 'french', 'glossy', 90, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['classic', 'professional', 'clean'], '11-0601 TPX'),
('#FFF8DC', 'French Cream', 'Essie', 'french', 'glossy', 88, ARRAY['spring', 'summer', 'fall', 'winter'], ARRAY['classic', 'elegant', 'soft'], '11-0507 TPX'),
('#FAF0E6', 'French Linen', 'Sally Hansen', 'french', 'cream', 85, ARRAY['spring', 'summer'], ARRAY['subtle', 'natural', 'sophisticated'], '11-0603 TPX'),
('#FFF5EE', 'French Seashell', 'Chanel', 'french', 'glossy', 83, ARRAY['spring', 'summer'], ARRAY['delicate', 'romantic', 'soft'], '11-0602 TPX'),
('#FFFAF0', 'French Floral White', 'Dior', 'french', 'cream', 81, ARRAY['spring'], ARRAY['pure', 'bridal', 'elegant'], '11-0601 TPX'),
('#F5FFFA', 'French Mint Cream', 'YSL', 'french', 'glossy', 79, ARRAY['spring', 'summer'], ARRAY['fresh', 'clean', 'modern'], '11-4802 TPX'),
('#F0FFF0', 'French Honeydew', 'OPI', 'french', 'cream', 77, ARRAY['spring', 'summer'], ARRAY['natural', 'fresh', 'subtle'], '11-0205 TPX'),
('#F0FFFF', 'French Azure', 'Essie', 'french', 'glossy', 75, ARRAY['summer'], ARRAY['cool', 'refreshing', 'clean'], '11-4301 TPX'),
('#FFF0F5', 'French Lavender Blush', 'Sally Hansen', 'french', 'cream', 82, ARRAY['spring'], ARRAY['romantic', 'soft', 'feminine'], '11-2511 TPX'),
('#FFF5F5', 'French Snow', 'Chanel', 'french', 'glossy', 80, ARRAY['winter', 'spring'], ARRAY['pure', 'crisp', 'minimal'], '11-0601 TPX'),

-- Modern French Pink Tips (10 colors)
('#FFB6C1', 'French Pink', 'Dior', 'french', 'glossy', 86, ARRAY['spring', 'summer'], ARRAY['romantic', 'modern', 'feminine'], '12-1304 TPX'),
('#FFC0CB', 'French Rose', 'YSL', 'french', 'cream', 84, ARRAY['spring', 'summer'], ARRAY['sweet', 'delicate', 'trendy'], '12-1706 TPX'),
('#FFE4E1', 'French Misty Rose', 'OPI', 'french', 'glossy', 82, ARRAY['spring'], ARRAY['subtle', 'romantic', 'soft'], '11-1602 TPX'),
('#FFDDF4', 'French Pink Lace', 'Essie', 'french', 'shimmer', 87, ARRAY['spring', 'summer'], ARRAY['delicate', 'bridal', 'elegant'], '11-2512 TPX'),
('#F8BBD0', 'French Orchid Pink', 'Sally Hansen', 'french', 'cream', 78, ARRAY['spring'], ARRAY['exotic', 'soft', 'unique'], '12-2904 TPX'),
('#FADBD8', 'French Pale Rose', 'Chanel', 'french', 'glossy', 76, ARRAY['spring', 'summer'], ARRAY['vintage', 'romantic', 'gentle'], '11-1408 TPX'),
('#FFB7C5', 'French Cherry Blossom', 'Dior', 'french', 'shimmer', 89, ARRAY['spring'], ARRAY['seasonal', 'delicate', 'beautiful'], '12-1707 TPX'),
('#FF91AF', 'French Baker Miller', 'YSL', 'french', 'cream', 74, ARRAY['spring', 'summer'], ARRAY['calming', 'modern', 'unique'], '13-1906 TPX'),
('#FC89AC', 'French Flamingo', 'OPI', 'french', 'glossy', 81, ARRAY['summer'], ARRAY['tropical', 'fun', 'vibrant'], '14-1714 TPX'),
('#FFD1DC', 'French Powder Pink', 'Essie', 'french', 'cream', 85, ARRAY['spring', 'summer'], ARRAY['soft', 'baby', 'gentle'], '12-1305 TPX'),

-- Modern French Colored Tips (10 colors)
('#E6E6FA', 'French Lavender', 'Sally Hansen', 'french', 'glossy', 83, ARRAY['spring'], ARRAY['modern', 'soft', 'trendy'], '14-3612 TPX'),
('#F0E68C', 'French Yellow', 'Chanel', 'french', 'cream', 70, ARRAY['spring', 'summer'], ARRAY['modern', 'cheerful', 'bold'], '12-0752 TPX'),
('#98FB98', 'French Mint', 'Dior', 'french', 'glossy', 75, ARRAY['spring', 'summer'], ARRAY['modern', 'fresh', 'unique'], '13-0221 TPX'),
('#87CEEB', 'French Sky Blue', 'YSL', 'french', 'shimmer', 78, ARRAY['summer'], ARRAY['modern', 'airy', 'trendy'], '14-4318 TPX'),
('#DDA0DD', 'French Plum', 'OPI', 'french', 'cream', 72, ARRAY['fall'], ARRAY['modern', 'sophisticated', 'unique'], '15-3412 TPX'),
('#F0F8FF', 'French Alice Blue', 'Essie', 'french', 'glossy', 73, ARRAY['spring', 'summer'], ARRAY['modern', 'dreamy', 'soft'], '11-4301 TPX'),
('#FFDAB9', 'French Peach', 'Sally Hansen', 'french', 'cream', 77, ARRAY['summer'], ARRAY['modern', 'warm', 'cheerful'], '12-0917 TPX'),
('#E0FFFF', 'French Light Cyan', 'Chanel', 'french', 'shimmer', 71, ARRAY['summer'], ARRAY['modern', 'cool', 'refreshing'], '12-5204 TPX'),
('#FFE4B5', 'French Moccasin', 'Dior', 'french', 'glossy', 74, ARRAY['spring', 'summer'], ARRAY['modern', 'neutral', 'warm'], '12-0811 TPX'),
('#F5DEB3', 'French Wheat', 'YSL', 'french', 'cream', 76, ARRAY['summer', 'fall'], ARRAY['modern', 'natural', 'subtle'], '13-0922 TPX')
ON CONFLICT (hex_code) DO NOTHING;

-- ============================================================================
-- Update trending scores for seasonal relevance (with cap at 100)
-- ============================================================================

UPDATE colors 
SET trending_score = LEAST(trending_score + 5, 100)
WHERE 'winter' = ANY(season) 
AND category IN ('seasonal', 'chrome', 'glitter');

UPDATE colors 
SET trending_score = LEAST(trending_score + 10, 100)
WHERE category = 'trending' 
AND finish = 'chrome';

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

DO $$
DECLARE
    total_colors INTEGER;
    category_counts JSONB;
    finish_counts JSONB;
BEGIN
    SELECT COUNT(*) INTO total_colors FROM colors;
    
    SELECT jsonb_object_agg(category, count) INTO category_counts
    FROM (
        SELECT category, COUNT(*) as count 
        FROM colors 
        GROUP BY category
        ORDER BY category
    ) category_stats;
    
    SELECT jsonb_object_agg(finish, count) INTO finish_counts
    FROM (
        SELECT finish, COUNT(*) as count 
        FROM colors 
        WHERE finish IS NOT NULL
        GROUP BY finish
        ORDER BY finish
    ) finish_stats;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MASSIVE COLOR EXPANSION COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total colors in database: %', total_colors;
    RAISE NOTICE 'Category breakdown: %', category_counts;
    RAISE NOTICE 'Finish breakdown: %', finish_counts;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users will be WOWED by the variety!';
    RAISE NOTICE '========================================';
END $$;