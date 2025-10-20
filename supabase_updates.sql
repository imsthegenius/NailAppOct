-- ============================================================================
-- NailGlow Mobile App - Database Updates
-- Based on DESIGN_SPECIFICATION.md requirements
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- gen_random_uuid() is provided by pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 0. ADD SUBSCRIPTION FIELDS TO USERS TABLE
-- ============================================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT;

-- ============================================================================
-- 1. UPDATE COLORS TABLE - Add category groupings for our 108 colors
-- ============================================================================

-- First, add a category_group column to organize colors
ALTER TABLE colors 
ADD COLUMN IF NOT EXISTS category_group TEXT;

-- Update the category constraint to match our new design
ALTER TABLE colors 
DROP CONSTRAINT IF EXISTS colors_category_check;

ALTER TABLE colors
ADD CONSTRAINT colors_category_check CHECK (category IN (
    'nudes_naturals', 'classic_reds', 'burgundies_wines', 'pinks', 
    'corals_peaches', 'oranges', 'yellows_golds', 'greens', 'blues', 
    'purples_violets', 'browns_taupes', 'blacks_grays', 'whites_creams', 
    'metallics', 'special_effects'
));

-- ============================================================================
-- 2. CREATE/UPDATE SAVED_LOOKS TABLE (renamed from nail_tries for mobile)
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_looks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Image data
    original_image_url TEXT NOT NULL,
    transformed_image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Style information for display
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    shape_name TEXT NOT NULL,
    
    -- Processing metadata
    processing_time_ms INTEGER,
    gemini_prompt TEXT,
    
    -- User organization
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_hex CHECK (color_hex ~* '^#[0-9A-F]{6}$')
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_looks_user_id ON saved_looks(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_looks_created_at ON saved_looks(created_at DESC);

-- ============================================================================
-- 3. CREATE RECENTLY_USED_COLORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recently_used_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure uniqueness per user/color combo
    UNIQUE(user_id, color_hex)
);

-- Index for fast retrieval
CREATE INDEX IF NOT EXISTS idx_recently_used_user ON recently_used_colors(user_id, used_at DESC);

-- ============================================================================
-- 4. CREATE USER_PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_selected_color_name TEXT,
    last_selected_color_hex TEXT,
    last_selected_shape TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. INSERT ALL 108 COLORS WITH CATEGORIES
-- ============================================================================

-- Clear existing colors to avoid duplicates (optional - remove if you want to keep existing)
-- DELETE FROM colors;

-- Insert all colors organized by category
INSERT INTO colors (name, hex_code, category, category_group, finish) VALUES
-- Nudes & Naturals (10)
('Bare', '#F5E6D3', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Beige', '#E8D5B7', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Taupe', '#B59B8E', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Nude Pink', '#EDD4CE', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Cream', '#FFFDD0', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Sand', '#C2B280', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Buff', '#F0DC82', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Chai', '#D2B4A6', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Cashmere', '#E4D4C8', 'nudes_naturals', 'Nudes & Naturals', 'cream'),
('Oat', '#DFD0B8', 'nudes_naturals', 'Nudes & Naturals', 'cream'),

-- Classic Reds (7)
('Classic Red', '#DC143C', 'classic_reds', 'Classic Reds', 'glossy'),
('Cherry', '#DE3163', 'classic_reds', 'Classic Reds', 'glossy'),
('Crimson', '#DC143C', 'classic_reds', 'Classic Reds', 'glossy'),
('Ruby', '#E0115F', 'classic_reds', 'Classic Reds', 'glossy'),
('Scarlet', '#FF2400', 'classic_reds', 'Classic Reds', 'glossy'),
('Vermillion', '#E34234', 'classic_reds', 'Classic Reds', 'glossy'),
('Candy Apple', '#FF0800', 'classic_reds', 'Classic Reds', 'glossy'),

-- Burgundies & Wines (7)
('Burgundy', '#800020', 'burgundies_wines', 'Burgundies & Wines', 'glossy'),
('Wine', '#722F37', 'burgundies_wines', 'Burgundies & Wines', 'glossy'),
('Merlot', '#7F1734', 'burgundies_wines', 'Burgundies & Wines', 'glossy'),
('Bordeaux', '#5C0120', 'burgundies_wines', 'Burgundies & Wines', 'glossy'),
('Oxblood', '#4A0404', 'burgundies_wines', 'Burgundies & Wines', 'glossy'),
('Maroon', '#800000', 'burgundies_wines', 'Burgundies & Wines', 'glossy'),
('Sangria', '#92000A', 'burgundies_wines', 'Burgundies & Wines', 'glossy'),

-- Pinks (8)
('Baby Pink', '#FFB6C1', 'pinks', 'Pinks', 'cream'),
('Bubblegum', '#FFC1CC', 'pinks', 'Pinks', 'glossy'),
('Hot Pink', '#FF69B4', 'pinks', 'Pinks', 'glossy'),
('Fuchsia', '#FF00FF', 'pinks', 'Pinks', 'glossy'),
('Magenta', '#FF00FF', 'pinks', 'Pinks', 'glossy'),
('Rose', '#FF007F', 'pinks', 'Pinks', 'glossy'),
('Blush', '#DE5D83', 'pinks', 'Pinks', 'cream'),
('Flamingo', '#FC8EAC', 'pinks', 'Pinks', 'glossy'),

-- Corals & Peaches (6)
('Coral', '#FF7F50', 'corals_peaches', 'Corals & Peaches', 'glossy'),
('Salmon', '#FA8072', 'corals_peaches', 'Corals & Peaches', 'glossy'),
('Peach', '#FFDAB9', 'corals_peaches', 'Corals & Peaches', 'cream'),
('Apricot', '#FBCEB1', 'corals_peaches', 'Corals & Peaches', 'cream'),
('Cantaloupe', '#FFA66B', 'corals_peaches', 'Corals & Peaches', 'glossy'),
('Terracotta', '#CC4E5C', 'corals_peaches', 'Corals & Peaches', 'matte'),

-- Oranges (6)
('Tangerine', '#F28500', 'oranges', 'Oranges', 'glossy'),
('Burnt Orange', '#CC5500', 'oranges', 'Oranges', 'matte'),
('Pumpkin', '#FF7518', 'oranges', 'Oranges', 'glossy'),
('Amber', '#FFBF00', 'oranges', 'Oranges', 'glossy'),
('Rust', '#B7410E', 'oranges', 'Oranges', 'matte'),
('Copper Orange', '#DA8A67', 'oranges', 'Oranges', 'shimmer'),

-- Yellows & Golds (6)
('Lemon', '#FFF700', 'yellows_golds', 'Yellows & Golds', 'glossy'),
('Sunshine', '#FFFD37', 'yellows_golds', 'Yellows & Golds', 'glossy'),
('Mustard', '#FFDB58', 'yellows_golds', 'Yellows & Golds', 'matte'),
('Honey', '#FFC30B', 'yellows_golds', 'Yellows & Golds', 'glossy'),
('Butterscotch', '#E3B55A', 'yellows_golds', 'Yellows & Golds', 'cream'),
('Marigold', '#EAA221', 'yellows_golds', 'Yellows & Golds', 'glossy'),

-- Greens (9)
('Mint', '#98FF98', 'greens', 'Greens', 'cream'),
('Sage', '#87A96B', 'greens', 'Greens', 'matte'),
('Olive', '#808000', 'greens', 'Greens', 'matte'),
('Forest', '#228B22', 'greens', 'Greens', 'glossy'),
('Emerald', '#50C878', 'greens', 'Greens', 'glossy'),
('Lime', '#32CD32', 'greens', 'Greens', 'glossy'),
('Pistachio', '#93C572', 'greens', 'Greens', 'cream'),
('Jade', '#00A86B', 'greens', 'Greens', 'glossy'),
('Seafoam', '#93E9BE', 'greens', 'Greens', 'cream'),

-- Blues (9)
('Sky', '#87CEEB', 'blues', 'Blues', 'cream'),
('Navy', '#000080', 'blues', 'Blues', 'glossy'),
('Royal', '#4169E1', 'blues', 'Blues', 'glossy'),
('Cobalt', '#0047AB', 'blues', 'Blues', 'glossy'),
('Teal', '#008B8B', 'blues', 'Blues', 'glossy'),
('Turquoise', '#40E0D0', 'blues', 'Blues', 'glossy'),
('Powder', '#B0E0E6', 'blues', 'Blues', 'cream'),
('Denim', '#1560BD', 'blues', 'Blues', 'matte'),
('Ocean', '#4F42B5', 'blues', 'Blues', 'glossy'),

-- Purples & Violets (8)
('Lavender', '#E6E6FA', 'purples_violets', 'Purples & Violets', 'cream'),
('Lilac', '#C8A2C8', 'purples_violets', 'Purples & Violets', 'cream'),
('Violet', '#8B00FF', 'purples_violets', 'Purples & Violets', 'glossy'),
('Plum', '#DDA0DD', 'purples_violets', 'Purples & Violets', 'glossy'),
('Eggplant', '#614051', 'purples_violets', 'Purples & Violets', 'glossy'),
('Orchid', '#DA70D6', 'purples_violets', 'Purples & Violets', 'glossy'),
('Amethyst', '#9966CC', 'purples_violets', 'Purples & Violets', 'glossy'),
('Iris', '#5A4FCF', 'purples_violets', 'Purples & Violets', 'glossy'),

-- Browns & Taupes (6)
('Chocolate', '#7B3F00', 'browns_taupes', 'Browns & Taupes', 'glossy'),
('Espresso', '#4E2E28', 'browns_taupes', 'Browns & Taupes', 'glossy'),
('Caramel', '#AF6E4D', 'browns_taupes', 'Browns & Taupes', 'cream'),
('Mocha', '#967969', 'browns_taupes', 'Browns & Taupes', 'cream'),
('Cinnamon', '#D2691E', 'browns_taupes', 'Browns & Taupes', 'matte'),
('Tan', '#D2B48C', 'browns_taupes', 'Browns & Taupes', 'cream'),

-- Blacks & Grays (7)
('Pure Black', '#000000', 'blacks_grays', 'Blacks & Grays', 'glossy'),
('Charcoal', '#36454F', 'blacks_grays', 'Blacks & Grays', 'matte'),
('Slate', '#708090', 'blacks_grays', 'Blacks & Grays', 'matte'),
('Graphite', '#41424C', 'blacks_grays', 'Blacks & Grays', 'matte'),
('Smoke', '#848884', 'blacks_grays', 'Blacks & Grays', 'matte'),
('Ash', '#B2BEB5', 'blacks_grays', 'Blacks & Grays', 'matte'),
('Gunmetal', '#2A3439', 'blacks_grays', 'Blacks & Grays', 'shimmer'),

-- Whites & Creams (7)
('Pure White', '#FFFFFF', 'whites_creams', 'Whites & Creams', 'glossy'),
('Pearl', '#F8F8FF', 'whites_creams', 'Whites & Creams', 'shimmer'),
('Ivory', '#FFFFF0', 'whites_creams', 'Whites & Creams', 'cream'),
('Vanilla', '#F3E5AB', 'whites_creams', 'Whites & Creams', 'cream'),
('Coconut', '#F5F5DC', 'whites_creams', 'Whites & Creams', 'cream'),
('Milk', '#FDFFF5', 'whites_creams', 'Whites & Creams', 'cream'),
('Opal', '#A8C3BC', 'whites_creams', 'Whites & Creams', 'shimmer'),

-- Metallics (7)
('Gold', '#FFD700', 'metallics', 'Metallics', 'chrome'),
('Silver', '#C0C0C0', 'metallics', 'Metallics', 'chrome'),
('Rose Gold', '#B76E79', 'metallics', 'Metallics', 'chrome'),
('Bronze', '#CD7F32', 'metallics', 'Metallics', 'chrome'),
('Copper', '#B87333', 'metallics', 'Metallics', 'chrome'),
('Platinum', '#E5E4E2', 'metallics', 'Metallics', 'chrome'),
('Chrome', '#E5E5E5', 'metallics', 'Metallics', 'chrome'),

-- Special Effects (5)
('Holographic', '#E6E6FA', 'special_effects', 'Special Effects', 'glitter'),
('Iridescent', '#F4C2C2', 'special_effects', 'Special Effects', 'glitter'),
('Color-Shift', '#9966CC', 'special_effects', 'Special Effects', 'glitter'),
('Glitter Gold', '#FFD700', 'special_effects', 'Special Effects', 'glitter'),
('Glitter Silver', '#C0C0C0', 'special_effects', 'Special Effects', 'glitter')
ON CONFLICT (hex_code) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_group = EXCLUDED.category_group,
    finish = EXCLUDED.finish;

-- ============================================================================
-- 6. INSERT NAIL SHAPES
-- ============================================================================

INSERT INTO nail_shapes (shape_name, display_name, description, difficulty_level, maintenance_level) VALUES
('round', 'Round', 'Classic rounded edge, perfect for shorter nails', 1, 1),
('square', 'Square', 'Straight edge with sharp corners', 2, 2),
('oval', 'Oval', 'Egg-shaped with tapered sides', 2, 2),
('almond', 'Almond', 'Tapered sides meeting at a rounded point', 3, 3),
('coffin', 'Coffin', 'Tapered sides with a squared tip', 4, 4),
('stiletto', 'Stiletto', 'Dramatic pointed tip', 5, 5)
ON CONFLICT (shape_name) DO NOTHING;

-- ============================================================================
-- 7. CREATE RLS POLICIES
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE saved_looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_used_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for saved_looks
CREATE POLICY "Users can view own saved looks" ON saved_looks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved looks" ON saved_looks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved looks" ON saved_looks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved looks" ON saved_looks
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for recently_used_colors
CREATE POLICY "Users can view own recent colors" ON recently_used_colors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recent colors" ON recently_used_colors
    FOR ALL USING (auth.uid() = user_id);

-- Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 8. CREATE FUNCTIONS FOR APP FEATURES
-- ============================================================================

-- Function to add/update recently used color (maintains max 5 per user)
CREATE OR REPLACE FUNCTION add_recently_used_color(
    p_user_id UUID,
    p_color_name TEXT,
    p_color_hex TEXT
) RETURNS VOID AS $$
BEGIN
    -- Insert or update the color usage
    INSERT INTO recently_used_colors (user_id, color_name, color_hex, used_at)
    VALUES (p_user_id, p_color_name, p_color_hex, NOW())
    ON CONFLICT (user_id, color_hex) 
    DO UPDATE SET used_at = NOW();
    
    -- Keep only the 5 most recent colors
    DELETE FROM recently_used_colors
    WHERE user_id = p_user_id
    AND color_hex NOT IN (
        SELECT color_hex 
        FROM recently_used_colors
        WHERE user_id = p_user_id
        ORDER BY used_at DESC
        LIMIT 5
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get comparison data for two saved looks
CREATE OR REPLACE FUNCTION get_comparison_looks(
    p_look_id1 UUID,
    p_look_id2 UUID
) RETURNS TABLE (
    look1_id UUID,
    look1_image TEXT,
    look1_color TEXT,
    look1_shape TEXT,
    look2_id UUID,
    look2_image TEXT,
    look2_color TEXT,
    look2_shape TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l1.id,
        l1.transformed_image_url,
        l1.color_name || ' • ' || l1.shape_name,
        l1.shape_name,
        l2.id,
        l2.transformed_image_url,
        l2.color_name || ' • ' || l2.shape_name,
        l2.shape_name
    FROM saved_looks l1, saved_looks l2
    WHERE l1.id = p_look_id1 AND l2.id = p_look_id2;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Database updates completed successfully!';
    RAISE NOTICE 'Added: 108 colors in 15 categories, 6 nail shapes';
    RAISE NOTICE 'Created: saved_looks, recently_used_colors, user_preferences tables';
    RAISE NOTICE 'Applied: RLS policies and helper functions';
END $$;
