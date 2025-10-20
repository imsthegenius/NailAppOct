-- Update color categories based on the recategorized CSV
-- This script updates all colors to their correct categories

-- Blues
UPDATE colors SET category = 'blues' WHERE hex_code IN (
    '#F0F8FF', '#8A2BE2', '#B8C5E6', '#5F9EA0', '#40E0D0', '#0047AB', '#0D1B3D',
    '#1E90FF', '#007FFF', '#E1E8ED', '#D4E0ED', '#3A2F79', '#355CFF', '#191970',
    '#000080', '#C5E1F5', '#4169E1', '#87CEEB', '#BBDEFB', '#4682B4', '#00878A',
    '#3F51FF', '#6495ED', '#00FFFF', '#00008B', '#87CEFA', '#B0C4DE', '#00BFFF',
    '#87CEFA', '#B0C4DE', '#C5CAE9', '#4B0082'
);

-- Burgundy
UPDATE colors SET category = 'burgundy' WHERE hex_code IN (
    '#6F1E51', '#3B0D17', '#4B0F1A', '#800020', '#8B0020', '#7A284B', '#4C1130',
    '#5F1624', '#6B2737', '#722F37', '#943543', '#5E2129', '#614051', '#B03060',
    '#8B2252'
);

-- Darks
UPDATE colors SET category = 'darks' WHERE hex_code IN (
    '#0C0C0C', '#333333', '#6B2A2A', '#4A2C2A', '#8C4A2F', '#808080', '#A9A9A9',
    '#696969', '#362418', '#1C1C1C', '#D3D3D3', '#000000', '#B7410E', '#6A4B3C',
    '#8A4B3C', '#111111', '#2B2B2B', '#321414', '#3B302F', '#36454F', '#6F4E37',
    '#3C241B', '#3B2820', '#2F4F4F', '#483D8B', '#453227', '#3D2914', '#704214',
    '#5E2129', '#2F1B14', '#8E3A59', '#734A12', '#453227', '#826644', '#2F4F4F',
    '#483D8B', '#5E2129', '#704214', '#453227', '#3D2914', '#3C241B', '#3B2820',
    '#2F4F4F', '#483D8B', '#778899', '#5A3A57', '#5E2129'
);

-- French
UPDATE colors SET category = 'french' WHERE hex_code IN (
    '#FAEEE7', '#F8F8F8', '#E8DCC5', '#E0E0FA', '#F8F8FF', '#F7F3EF', '#FFFEF7',
    '#FFFFF0', '#FFFFFF', '#FFF5EE', '#FFFAFA', '#F5F5F5', '#FAEBD7', '#FFFAED',
    '#FFF8DC', '#FFF8E7', '#FFFDFA', '#FFFDF5', '#FFF5F5', '#FDF5E6',
    '#FFF5ED', '#F2F0ED'
);

-- Greens
UPDATE colors SET category = 'greens' WHERE hex_code IN (
    '#556B2F', '#046B3C', '#228B22', '#A3C585', '#DDF2D1', '#718355', '#00FF00',
    '#808000', '#6B8E23', '#98FB98', '#A8E6A1', '#CFDAC8', '#3CB371', '#2E8B57',
    '#9FF3D5', '#9ACD32', '#008000', '#ADFF2F', '#7CFC00', '#90EE90', '#66CDAA',
    '#00FA9A', '#9AFF9A', '#00FF7F', '#00CED1', '#00FFFF', '#AFEEEE', '#E0F2E9',
    '#48D1CC', '#20B2AA', '#66CDAA', '#3CB371', '#98FB98', '#90EE90', '#7CFC00',
    '#ADFF2F', '#9ACD32', '#7FFFD4', '#66CDAA', '#00CED1', '#48D1CC', '#40E0D0',
    '#00FFFF', '#E0FFFF', '#AFEEEE', '#B0E0E6', '#87CEEB', '#87CEFA', '#00BFFF',
    '#6495ED', '#4169E1', '#0000FF', '#000080', '#191970', '#00008B', '#0047AB',
    '#1E90FF', '#007FFF', '#87CEEB', '#87CEFA', '#00BFFF', '#6495ED', '#4169E1',
    '#0000FF', '#000080', '#191970', '#00008B', '#4B0082', '#483D8B', '#6A5ACD',
    '#778899'
);

-- Metallics
UPDATE colors SET category = 'metallics' WHERE hex_code IN (
    '#FFBF00', '#FFB300', '#B2BEB5', '#F0FFFF', '#848482', '#BCC6CC', '#FDD017',
    '#CD7F32', '#D4A76A', '#F0DC82', '#CC9966', '#F1E3C6', '#B8860B', '#B87333',
    '#AD6F3B', '#F0E130', '#C9A0A1', '#D4AF37', '#FFD700', '#FFC125', '#2A3439',
    '#2E2F30', '#E0FFFF', '#20B2AA', '#E0E0E0', '#FFE55C', '#CC7722', '#FFA000',
    '#DA8A67', '#C9C0BB', '#8A8F8F', '#E5E4E2', '#9370DB', '#838996', '#E8B4B8',
    '#F4C430', '#FFD800', '#71797E', '#A8A9AD', '#C0C0C0', '#B8B8B8', '#C4AEAD',
    '#996515', '#DAA520', '#F0E4CC', '#E8D5C4', '#E7E5F1', '#EEE8AA', '#F5E6D8'
);

-- Pastels
UPDATE colors SET category = 'pastels' WHERE hex_code IN (
    '#D6E4F0', '#E9E4F5', '#E8E2D6', '#E0BBE4', '#E0D0E5', '#CDB4E7', '#EDE7F6',
    '#E0F2FF', '#D6D6FA', '#BCD4FF', '#BFEFFF', '#C5CAE9', '#DBE7FF', '#FFA500',
    '#CC5500', '#D2691E', '#FF6F61', '#FF7F50', '#FF8C00', '#EDE7F6', '#E0F2FF',
    '#FFA45C', '#F0E68D', '#D6D6FA', '#E0BBE4', '#E0D0E5', '#CDB4E7', '#C49BBB',
    '#E0F2E9', '#C3E9D7', '#FF8650', '#FFBE98', '#FFF4E0', '#FFDAB9', '#FFB199',
    '#8EA6FF', '#D0602B', '#F9A775', '#C26E5A', '#C4716A', '#C65A1E', '#FF6347'
);

-- Pinks
UPDATE colors SET category = 'pinks' WHERE hex_code IN (
    '#FF91AF', '#FFB7C5', '#FC89AC', '#E75480', '#8B008B', 'FF9999', 'FF91A4',
    'FC0FC0', 'FF00FF', 'FF10F0', 'FF2400', 'FFCDE1', 'F7DBE6', 'FFA0C9',
    'FFD6E7', 'FF1493', 'C98E8E', 'FF69B4', 'FF8FB3', 'F08080', 'FFB6C1',
    'AD1457', 'FFE4E2', 'DB7093', 'FFE4F1', 'FF6B9D', 'F8BBD0', 'FFDDE7',
    'EC407A', 'FFD1DC', 'FFC0CB', 'F8E4E6'
);

-- Purples
UPDATE colors SET category = 'purples' WHERE hex_code IN (
    '#9932CC', 'D473D4', 'CC397B', 'AB82FF', 'EE82EE', 'C71585', 'DDA0DD',
    'E0B0FF', '66CDAA', 'B784A7', 'C49BBB', '9F8170', 'B03060', '8B008B',
    '9400D3', '9932CC', 'BA55D3', '8B008B', '9400D3', '4B0082', '66CDAA',
    '48D1CC', '20B2AA', '00CED1', '40E0D0', '00CED1', '48D1CC', '008B8B',
    '2F4F4F', '696969', '708090', '778899', '2F4F4F', '696969', '708090',
    '778899', '2F4F4F', '696969', '708090', '778899', '9966CC', '9B59B6',
    '3D0734', '8E44AD', 'B29DD9', '6A3D64', '6F42C1', 'E9C8FF', 'E6E6FA',
    'C4C3D0', 'E6D7FF', 'BA55D3', 'DA70D6', 'E8E3F5', '5A3A57', 'D8BFD8',
    '9400D3', 'E6E2ED'
);

-- Reds
UPDATE colors SET category = 'reds' WHERE hex_code IN (
    '#C30F23', 'CC0000', 'CE2029', 'B22234', 'C21E56', 'FF0000', 'E34234',
    'ED1C24', 'C41E3A', 'D9381E', '8B3A3A', 'DC2C44', 'FF4444', 'B3001B',
    'FF6B6B', 'DC143C', '8B0000', 'B22222', 'CD5C5C', 'E34153', 'C0392B',
    'A52A2A', 'A93226', 'D9381E', 'E74C3C', '8B3A3A', 'DC2C44', 'FF4444',
    'B3001B', 'FF6B6B', 'DC143C', '8B0000', 'B22222', 'CD5C5C', 'E34153',
    'C0392B', 'A52A2A', 'A93226', 'D9381E', 'E74C3C', '8B3A3A', 'DC2C44',
    'FF4444', 'B3001B', 'FF6B6B', 'DC143C', '8B0000', 'B22222', 'CD5C5C',
    'E34153', 'C0392B', 'A52A2A', 'A93226', 'D9381E', 'E74C3C', 'FF0000',
    '8B0000', 'B22222', 'CD5C5C', 'E34153', 'C0392B', 'A52A2A', 'A93226',
    'D9381E', 'E74C3C', 'FF0000', '8B0000', 'B22222', 'CD5C5C', 'E34153',
    'C0392B', 'A52A2A', 'A93226', 'D9381E', 'E74C3C'
);

-- Trending (special category for top trending colors)
UPDATE colors SET category = 'trending' WHERE hex_code IN (
    '#FFC0CB', 'F8E4E6', '800080', 'FF0000', 'FFFAF0', '32CD32', 'B0E0E6',
    'FF4500', 'B76E79', '#FFFF00'
);

-- Nudes (all remaining colors that should be in nudes)
UPDATE colors SET category = 'nudes' WHERE hex_code IN (
    '#EDD9C7', 'E8D0B3', 'F6EBD8', '9F8170', 'FFE4C4', '8B7D6B', 'EED5B7',
    'FFF6E5', 'E3F2FD', 'F1C6BD', '755C48', '835C3B', 'CDAA7D', 'DEB887',
    '8B7355', 'DDB892', 'A0826D', 'C4A57B', 'A67B5B', 'D4B5A0', 'BC9A6A',
    'C19A6B', 'E5D4B1', 'B07A4A', 'ECDCC7', 'EDCDB5', 'F4E8D0', 'AB917A',
    'FFF0DB', 'FFF8DC', 'FFF4E6', '7B6143', 'FFFDF5', 'F4E4C1', '5C4033',
    '3D2914', 'BDB76B', 'CDB79E', 'E6B8A2', 'C89FA3', 'C8A882', '673147',
    'F0E4CC', 'DCDCDC', 'E5E6D8', 'F5E6D8', 'F3E5D8', 'F0FFF0', 'E8EAF6',
    'E4E1ED', 'C3B091', 'F3E5D8', 'C7A88C', 'FAF0E6', 'A0845C', 'FF7F51',
    'E6D3B3', 'F5FFFA', 'F5F5DC', 'FFE4E1', 'FFE4B5', 'B5987A', 'C54B8C',
    'E6D3C7', 'F5DEB3', 'F3E5D0', 'FDF5E6', 'C08081', '49392D', 'D8C0A8',
    'C9A882', 'AC9A7A', 'EEDFCC', '986960', 'E7D5BB', 'FFE4CD', 'FFCC99',
    'FFB347', 'E5C4A1', 'FFF9F0', 'E5E5F7', 'CD853F', 'CD919E', 'FFDDF4',
    'F1E5CF', 'CC8899', 'D0C4B7', 'F3E8D5', 'F5E9D3', 'E2B9A1', 'BC8F8F',
    '8B4513', 'FA8072', 'C8B88B', 'A68064', 'C9B59A', 'F4A460', '4A3C28',
    'D2B48C', 'B98966', '6B4423', 'F5E6D3', 'F4E4BC', 'FAF0DD', 'F0E2D0',
    'FAF3E7', 'E4D1B9', 'CDAF95', 'EAD9BD', 'E9D9C3', 'D6E4F0', 'FF91AF',
    'F6EBD8', '9F8170', 'FFE4C4', '8B7D6B', 'EED5B7', 'FFF6E5', 'E3F2FD',
    'F1C6BD', '755C48', '835C3B', 'CDAA7D', 'DEB887', '8B7355', 'DDB892',
    'A0826D', 'C4A57B', 'A67B5B', 'D4B5A0', 'BC9A6A', 'C19A6B', 'E5D4B1',
    'B07A4A', 'ECDCC7', 'EDCDB5', 'F4E8D0', 'AB917A', 'FFF0DB', 'FFF8DC',
    'FFF4E6', '7B6143', 'FFFDF5', 'F4E4C1', '5C4033', '3D2914', 'BDB76B',
    'CDB79E', 'E6B8A2', 'C89FA3', 'C8A882', '673147', 'F0E4CC', 'DCDCDC',
    'E5E6D8', 'F5E6D8', 'F3E5D8', 'F0FFF0', 'E8EAF6', 'E4E1ED', 'C3B091',
    'F3E5D8', 'C7A88C', 'FAF0E6', 'A0845C', 'FF7F51', 'E6D3B3', 'F5FFFA',
    'F5F5DC', 'FFE4E1', 'FFE4B5', 'B5987A', 'C54B8C', 'E6D3C7', 'F5DEB3',
    'F3E5D0', 'FDF5E6', 'C08081', '49392D', 'D8C0A8', 'C9A882', 'AC9A7A',
    'EEDFCC', '986960', 'E7D5BB', 'FFE4CD', 'FFCC99', 'FFB347', 'E5C4A1',
    'FFF9F0', 'E5E5F7', 'CD853F', 'CD919E', 'FFDDF4', 'F1E5CF', 'CC8899',
    'D0C4B7', 'F3E8D5', 'F5E9D3', 'E2B9A1', 'BC8F8F', '8B4513', 'FA8072',
    'C8B88B', 'A68064', 'C9B59A', 'F4A460', '4A3C28', 'D2B48C', 'B98966',
    '6B4423', 'F5E6D3', 'F4E4BC', 'FAF0DD', 'F0E2D0', 'FAF3E7', 'E4D1B9',
    'CDAF95'
);

-- Verify the updates
SELECT category, COUNT(*) as color_count 
FROM colors 
GROUP BY category 
ORDER BY color_count DESC;
