-- ============================================================================
-- Schema Additions for Nail App
-- File: 01_schema_additions.sql
-- Purpose: Additional tables for nail shapes and styles
-- ============================================================================

-- ============================================================================
-- NAIL_SHAPES TABLE
-- Catalog of nail shapes with visual guides
-- ============================================================================
CREATE TABLE nail_shapes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shape_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    maintenance_level INTEGER CHECK (maintenance_level BETWEEN 1 AND 5),
    suitable_for TEXT[], -- hand types: 'short_fingers', 'long_fingers', 'wide_nails', etc.
    style_category TEXT[], -- 'classic', 'modern', 'edgy', 'natural'
    popularity_score INTEGER DEFAULT 50 CHECK (popularity_score BETWEEN 0 AND 100),
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE nail_shapes IS 'Catalog of nail shapes with recommendations';
COMMENT ON COLUMN nail_shapes.difficulty_level IS '1=Easy to 5=Professional required';
COMMENT ON COLUMN nail_shapes.maintenance_level IS '1=Low maintenance to 5=High maintenance';

-- ============================================================================
-- NAIL_STYLES TABLE
-- Catalog of nail art styles and techniques
-- ============================================================================
CREATE TABLE nail_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_name TEXT UNIQUE NOT NULL,
    category TEXT CHECK (category IN ('solid', 'french', 'ombre', 'gradient', 'glitter', 'pattern', 'art', 'seasonal')),
    complexity INTEGER CHECK (complexity BETWEEN 1 AND 5),
    time_estimate INTEGER, -- minutes
    tools_required TEXT[],
    trending_score INTEGER DEFAULT 0 CHECK (trending_score BETWEEN 0 AND 100),
    season TEXT[],
    occasions TEXT[], -- 'wedding', 'office', 'party', 'casual', 'formal'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COLOR_COMBINATIONS TABLE
-- Pre-designed color combinations and palettes
-- ============================================================================
CREATE TABLE color_combinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    primary_color_id UUID REFERENCES colors(id),
    secondary_color_id UUID REFERENCES colors(id),
    accent_color_id UUID REFERENCES colors(id),
    combination_type TEXT CHECK (combination_type IN ('monochrome', 'complementary', 'analogous', 'triadic', 'seasonal')),
    style_id UUID REFERENCES nail_styles(id),
    season TEXT[],
    occasions TEXT[],
    skin_tones TEXT[], -- which skin tones this works best with
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SKIN_TONE_COLORS TABLE
-- Maps colors to skin tone compatibility
-- ============================================================================
CREATE TABLE skin_tone_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    color_id UUID REFERENCES colors(id),
    skin_tone TEXT CHECK (skin_tone IN ('fair', 'light', 'medium', 'tan', 'deep', 'dark')),
    compatibility_score INTEGER CHECK (compatibility_score BETWEEN 1 AND 10),
    undertone TEXT CHECK (undertone IN ('cool', 'warm', 'neutral')),
    notes TEXT,
    UNIQUE(color_id, skin_tone, undertone)
);

COMMENT ON TABLE skin_tone_colors IS 'Maps nail colors to skin tone compatibility for better recommendations';

-- Create indexes for the new tables
CREATE INDEX idx_nail_shapes_popularity ON nail_shapes(popularity_score DESC);
CREATE INDEX idx_nail_styles_trending ON nail_styles(trending_score DESC);
CREATE INDEX idx_nail_styles_category ON nail_styles(category);
CREATE INDEX idx_color_combinations_type ON color_combinations(combination_type);
CREATE INDEX idx_skin_tone_colors_lookup ON skin_tone_colors(skin_tone, undertone, compatibility_score DESC);