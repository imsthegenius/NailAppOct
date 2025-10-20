-- ============================================================================
-- FIXED: Performance Indexes for Nail App
-- This version fixes the syntax error with storage.foldername function
-- ============================================================================

-- Enable pg_trgm extension for text search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Index on email for faster lookups (already exists as unique constraint)
-- CREATE UNIQUE INDEX idx_users_email ON users(email); -- Already exists

-- Index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- NAIL_TRIES TABLE INDEXES
-- ============================================================================

-- Index on user_id for user's nail tries queries
CREATE INDEX IF NOT EXISTS idx_nail_tries_user_id ON nail_tries(user_id);

-- Index on created_at for sorting and pagination
CREATE INDEX IF NOT EXISTS idx_nail_tries_created_at ON nail_tries(created_at DESC);

-- Index on color_hex for color-based queries
CREATE INDEX IF NOT EXISTS idx_nail_tries_color_hex ON nail_tries(color_hex);

-- Index on style_type for style filtering
CREATE INDEX IF NOT EXISTS idx_nail_tries_style_type ON nail_tries(style_type);

-- Index on is_public for public gallery queries
CREATE INDEX IF NOT EXISTS idx_nail_tries_public ON nail_tries(is_public) WHERE is_public = true;

-- Composite index for user's recent tries
CREATE INDEX IF NOT EXISTS idx_nail_tries_user_recent ON nail_tries(user_id, created_at DESC);

-- Index for anonymous cleanup (null user_id with old dates)
CREATE INDEX IF NOT EXISTS idx_nail_tries_anonymous_cleanup 
ON nail_tries(created_at) 
WHERE user_id IS NULL;

-- ============================================================================
-- COLORS TABLE INDEXES
-- ============================================================================

-- Index on hex_code (already exists as unique constraint)
-- CREATE UNIQUE INDEX idx_colors_hex_code ON colors(hex_code); -- Already exists

-- Index on category for filtering
CREATE INDEX IF NOT EXISTS idx_colors_category ON colors(category);

-- Index on trending_score for trending queries
CREATE INDEX IF NOT EXISTS idx_colors_trending ON colors(trending_score DESC);

-- Index on brand for brand filtering
CREATE INDEX IF NOT EXISTS idx_colors_brand ON colors(brand);

-- Index on finish for finish type filtering
CREATE INDEX IF NOT EXISTS idx_colors_finish ON colors(finish);

-- Index for text search on name
CREATE INDEX IF NOT EXISTS idx_colors_name_search ON colors USING gin(name gin_trgm_ops);

-- GIN index for mood_tags array search
CREATE INDEX IF NOT EXISTS idx_colors_mood_tags ON colors USING gin(mood_tags);

-- GIN index for season array search
CREATE INDEX IF NOT EXISTS idx_colors_season ON colors USING gin(season);

-- Composite index for category and trending
CREATE INDEX IF NOT EXISTS idx_colors_category_trending ON colors(category, trending_score DESC);

-- ============================================================================
-- FAVORITES TABLE INDEXES
-- ============================================================================

-- Composite primary key already provides index on (user_id, nail_try_id)
-- Additional index on created_at for recent favorites
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(user_id, created_at DESC);

-- ============================================================================
-- COLLECTIONS TABLE INDEXES
-- ============================================================================

-- Index on user_id for user's collections
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);

-- Index on is_public for public collections
CREATE INDEX IF NOT EXISTS idx_collections_public ON collections(is_public) WHERE is_public = true;

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);

-- Text search index on name
CREATE INDEX IF NOT EXISTS idx_collections_name_search ON collections USING gin(name gin_trgm_ops);

-- ============================================================================
-- COLLECTION_ITEMS TABLE INDEXES
-- ============================================================================

-- Composite primary key already provides index on (collection_id, nail_try_id)
-- Additional index for ordering items within a collection
CREATE INDEX IF NOT EXISTS idx_collection_items_position ON collection_items(collection_id, position);

-- ============================================================================
-- TRENDING_COLORS TABLE INDEXES
-- ============================================================================

-- Composite primary key already provides index on (color_id, date, region)
-- Additional index for date-based queries
CREATE INDEX IF NOT EXISTS idx_trending_colors_date ON trending_colors(date DESC);

-- Index for region-based queries
CREATE INDEX IF NOT EXISTS idx_trending_colors_region ON trending_colors(region);

-- ============================================================================
-- USER_ANALYTICS TABLE INDEXES
-- ============================================================================

-- Index on user_id for user analytics queries
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);

-- Index on event_type for analytics aggregation
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);

-- Index on created_at for time-based analytics
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at DESC);

-- Composite index for user event history
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_events ON user_analytics(user_id, event_type, created_at DESC);

-- ============================================================================
-- STORAGE INDEXES (Commented out - Supabase handles these internally)
-- ============================================================================

-- Note: Supabase manages storage.objects indexes internally
-- These are commented out to avoid conflicts with Supabase's internal structure

-- Index for user folder lookups (Supabase handles this)
-- CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_folder ON storage.objects 
-- USING btree (bucket_id, name);

-- Index for storage cleanup operations (Supabase handles this)
-- CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_created ON storage.objects 
-- USING btree (bucket_id, created_at);

-- ============================================================================
-- INDEX MAINTENANCE FUNCTION
-- ============================================================================

-- Function to rebuild indexes if needed
CREATE OR REPLACE FUNCTION maintain_indexes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Reindex tables with high bloat
    REINDEX TABLE users;
    REINDEX TABLE nail_tries;
    REINDEX TABLE colors;
    REINDEX TABLE favorites;
    REINDEX TABLE collections;
    
    -- Update statistics
    ANALYZE users;
    ANALYZE nail_tries;
    ANALYZE colors;
    ANALYZE favorites;
    ANALYZE collections;
END;
$$;

-- Comment on function
COMMENT ON FUNCTION maintain_indexes() IS 'Maintains indexes by reindexing and analyzing tables';