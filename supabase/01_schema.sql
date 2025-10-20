-- ============================================================================
-- Nail App Database Schema
-- File: 01_schema.sql
-- Purpose: Create all tables and basic constraints for the nail try-on app
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- USERS TABLE
-- Stores user profiles with preferences for personalized recommendations
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Personalization fields for better recommendations
    skin_tone TEXT CHECK (skin_tone IN ('fair', 'light', 'medium', 'tan', 'deep', 'dark')),
    nail_shape_preference TEXT CHECK (nail_shape_preference IN ('square', 'round', 'oval', 'almond', 'coffin', 'stiletto')),
    style_preference JSONB DEFAULT '{}', -- mood, occasions, favorite colors
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_username CHECK (username IS NULL OR (LENGTH(username) >= 3 AND username ~* '^[a-zA-Z0-9_]+$'))
);

COMMENT ON TABLE users IS 'User profiles with personalization preferences for nail recommendations';
COMMENT ON COLUMN users.skin_tone IS 'Used for personalized color recommendations';
COMMENT ON COLUMN users.nail_shape_preference IS 'Default nail shape for transformations';
COMMENT ON COLUMN users.style_preference IS 'JSON object with mood, occasions, favorite colors';

-- ============================================================================
-- COLORS TABLE
-- Master catalog of nail polish colors with rich metadata
-- ============================================================================
CREATE TABLE colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hex_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    
    -- Categorization
    category TEXT NOT NULL CHECK (category IN ('classic', 'seasonal', 'trending', 'french', 'chrome', 'glitter', 'matte')),
    finish TEXT CHECK (finish IN ('glossy', 'matte', 'chrome', 'shimmer', 'glitter', 'cream')),
    
    -- Trend and recommendation data
    trending_score INTEGER DEFAULT 0,
    season TEXT[] DEFAULT '{}', -- array of seasons: spring, summer, fall, winter
    mood_tags TEXT[] DEFAULT '{}', -- confident, romantic, edgy, professional, fun
    
    -- Color matching
    pantone_code TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_hex_code CHECK (hex_code ~* '^#[0-9A-F]{6}$'),
    CONSTRAINT valid_trending_score CHECK (trending_score >= 0 AND trending_score <= 100)
);

COMMENT ON TABLE colors IS 'Master catalog of nail polish colors with metadata for recommendations';
COMMENT ON COLUMN colors.trending_score IS 'Score from 0-100 indicating current popularity';
COMMENT ON COLUMN colors.mood_tags IS 'Array of mood descriptors for personalized matching';

-- ============================================================================
-- NAIL_TRIES TABLE
-- Stores each nail transformation attempt with AI processing details
-- ============================================================================
CREATE TABLE nail_tries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- nullable for anonymous users
    
    -- Image URLs
    original_image_url TEXT NOT NULL,
    transformed_image_url TEXT NOT NULL,
    thumbnail_url TEXT, -- for gallery performance
    
    -- Style details
    color_hex TEXT NOT NULL,
    color_name TEXT,
    color_brand TEXT,
    style_type TEXT CHECK (style_type IN ('solid', 'french', 'ombre', 'gradient', 'chrome', 'glitter')),
    style_data JSONB DEFAULT '{}', -- additional style parameters
    nail_shape TEXT CHECK (nail_shape IN ('square', 'round', 'oval', 'almond', 'coffin', 'stiletto')),
    
    -- AI processing metadata
    processing_time_ms INTEGER,
    gemini_prompt_used TEXT,
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_hex_color CHECK (color_hex ~* '^#[0-9A-F]{6}$'),
    CONSTRAINT valid_processing_time CHECK (processing_time_ms > 0)
);

COMMENT ON TABLE nail_tries IS 'Individual nail transformation attempts with AI processing details';
COMMENT ON COLUMN nail_tries.user_id IS 'NULL for anonymous users, allows guest usage';
COMMENT ON COLUMN nail_tries.style_data IS 'JSON object with additional style parameters';

-- ============================================================================
-- FAVORITES TABLE
-- User's saved favorite nail transformations
-- ============================================================================
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nail_try_id UUID REFERENCES nail_tries(id) ON DELETE CASCADE,
    notes TEXT, -- user's personal notes about why they liked it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, nail_try_id)
);

COMMENT ON TABLE favorites IS 'User favorites with personal notes';

-- ============================================================================
-- COLLECTIONS TABLE
-- User-created collections of nail tries (mood boards, occasions, etc.)
-- ============================================================================
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT, -- thumbnail from one of the nail tries
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_collection_name CHECK (LENGTH(TRIM(name)) >= 1)
);

COMMENT ON TABLE collections IS 'User-created collections of nail transformations';

-- ============================================================================
-- COLLECTION_ITEMS TABLE
-- Items within collections with ordering
-- ============================================================================
CREATE TABLE collection_items (
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    nail_try_id UUID REFERENCES nail_tries(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (collection_id, nail_try_id)
);

COMMENT ON TABLE collection_items IS 'Items within collections with custom ordering';

-- ============================================================================
-- TRENDING_COLORS TABLE
-- Track color popularity over time and by region
-- ============================================================================
CREATE TABLE trending_colors (
    color_id UUID REFERENCES colors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    region TEXT DEFAULT 'global',
    
    PRIMARY KEY (color_id, date, region),
    
    CONSTRAINT valid_trend_score CHECK (score >= 0)
);

COMMENT ON TABLE trending_colors IS 'Historical trending data for colors by date and region';

-- ============================================================================
-- ANALYTICS TABLES
-- Track user behavior for insights and recommendations
-- ============================================================================
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_event_type CHECK (event_type IN (
        'nail_try_created', 'color_viewed', 'collection_created', 
        'favorite_added', 'share_initiated', 'profile_updated'
    ))
);

COMMENT ON TABLE user_analytics IS 'User behavior tracking for insights and personalization';

-- ============================================================================
-- NOTIFICATION SETTINGS TABLE
-- User preferences for notifications
-- ============================================================================
CREATE TABLE notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    trending_alerts BOOLEAN DEFAULT FALSE,
    collection_updates BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notification_settings IS 'User preferences for various notification types';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Schema creation completed successfully!';
    RAISE NOTICE 'Tables created: users, colors, nail_tries, favorites, collections, collection_items, trending_colors, user_analytics, notification_settings';
END $$;