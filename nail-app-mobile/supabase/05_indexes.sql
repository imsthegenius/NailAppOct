-- ============================================================================
-- Performance Indexes
-- File: 05_indexes.sql
-- Purpose: Create indexes to optimize query performance for the nail app
-- ============================================================================

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Index for email lookups (authentication)
CREATE INDEX IF NOT EXISTS idx_users_email ON users USING btree (email);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users USING btree (username);

-- Index for skin tone filtering (recommendations)
CREATE INDEX IF NOT EXISTS idx_users_skin_tone ON users USING btree (skin_tone) WHERE skin_tone IS NOT NULL;

-- Partial index for users with preferences (recommendation queries)
CREATE INDEX IF NOT EXISTS idx_users_with_preferences ON users USING gin (style_preference) WHERE style_preference != '{}';

-- ============================================================================
-- NAIL_TRIES TABLE INDEXES
-- ============================================================================

-- Primary user lookup index
CREATE INDEX IF NOT EXISTS idx_nail_tries_user_id ON nail_tries USING btree (user_id);

-- Time-based queries (recent tries, analytics)
CREATE INDEX IF NOT EXISTS idx_nail_tries_created_at ON nail_tries USING btree (created_at DESC);

-- Color-based queries (trend analysis)
CREATE INDEX IF NOT EXISTS idx_nail_tries_color_hex ON nail_tries USING btree (color_hex);

-- Public tries for discovery
CREATE INDEX IF NOT EXISTS idx_nail_tries_public ON nail_tries USING btree (is_public) WHERE is_public = true;

-- Composite index for user's recent tries
CREATE INDEX IF NOT EXISTS idx_nail_tries_user_created ON nail_tries USING btree (user_id, created_at DESC);

-- Index for anonymous tries cleanup
CREATE INDEX IF NOT EXISTS idx_nail_tries_anonymous_cleanup ON nail_tries USING btree (created_at) WHERE user_id IS NULL;

-- Style type filtering
CREATE INDEX IF NOT EXISTS idx_nail_tries_style_type ON nail_tries USING btree (style_type) WHERE style_type IS NOT NULL;

-- Composite index for color trend analysis
CREATE INDEX IF NOT EXISTS idx_nail_tries_color_created ON nail_tries USING btree (color_hex, created_at DESC);

-- ============================================================================
-- COLORS TABLE INDEXES
-- ============================================================================

-- Primary hex code lookup
CREATE INDEX IF NOT EXISTS idx_colors_hex_code ON colors USING btree (hex_code);

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_colors_category ON colors USING btree (category);

-- Brand filtering
CREATE INDEX IF NOT EXISTS idx_colors_brand ON colors USING btree (brand) WHERE brand IS NOT NULL;

-- Trending score for recommendations
CREATE INDEX IF NOT EXISTS idx_colors_trending_score ON colors USING btree (trending_score DESC);

-- Season-based recommendations
CREATE INDEX IF NOT EXISTS idx_colors_season ON colors USING gin (season);

-- Mood tags for personalization
CREATE INDEX IF NOT EXISTS idx_colors_mood_tags ON colors USING gin (mood_tags);

-- Text search on color names
CREATE INDEX IF NOT EXISTS idx_colors_name_trgm ON colors USING gin (name gin_trgm_ops);

-- Composite index for trending colors by category
CREATE INDEX IF NOT EXISTS idx_colors_category_trending ON colors USING btree (category, trending_score DESC);

-- ============================================================================
-- FAVORITES TABLE INDEXES
-- ============================================================================

-- User's favorites lookup (primary key already covers this, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites USING btree (user_id);

-- Reverse lookup for popular nail tries
CREATE INDEX IF NOT EXISTS idx_favorites_nail_try_id ON favorites USING btree (nail_try_id);

-- Time-based favorites
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites USING btree (created_at DESC);

-- Composite index for user's recent favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON favorites USING btree (user_id, created_at DESC);

-- ============================================================================
-- COLLECTIONS TABLE INDEXES
-- ============================================================================

-- User's collections
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections USING btree (user_id);

-- Public collections discovery
CREATE INDEX IF NOT EXISTS idx_collections_public ON collections USING btree (is_public) WHERE is_public = true;

-- Recent collections
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections USING btree (created_at DESC);

-- Collection name search
CREATE INDEX IF NOT EXISTS idx_collections_name_trgm ON collections USING gin (name gin_trgm_ops);

-- Composite index for user's recent collections
CREATE INDEX IF NOT EXISTS idx_collections_user_created ON collections USING btree (user_id, created_at DESC);

-- Updated collections
CREATE INDEX IF NOT EXISTS idx_collections_updated_at ON collections USING btree (updated_at DESC);

-- ============================================================================
-- COLLECTION_ITEMS TABLE INDEXES
-- ============================================================================

-- Collection items lookup
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items USING btree (collection_id);

-- Reverse lookup for nail try usage
CREATE INDEX IF NOT EXISTS idx_collection_items_nail_try_id ON collection_items USING btree (nail_try_id);

-- Position ordering within collections
CREATE INDEX IF NOT EXISTS idx_collection_items_position ON collection_items USING btree (collection_id, position);

-- Recent additions to collections
CREATE INDEX IF NOT EXISTS idx_collection_items_added_at ON collection_items USING btree (added_at DESC);

-- ============================================================================
-- TRENDING_COLORS TABLE INDEXES
-- ============================================================================

-- Date-based trending lookup
CREATE INDEX IF NOT EXISTS idx_trending_colors_date ON trending_colors USING btree (date DESC);

-- Color trending history
CREATE INDEX IF NOT EXISTS idx_trending_colors_color_date ON trending_colors USING btree (color_id, date DESC);

-- Region-specific trends
CREATE INDEX IF NOT EXISTS idx_trending_colors_region_date ON trending_colors USING btree (region, date DESC);

-- Score-based trending
CREATE INDEX IF NOT EXISTS idx_trending_colors_score ON trending_colors USING btree (score DESC);

-- Recent trending by region and score
CREATE INDEX IF NOT EXISTS idx_trending_colors_region_score ON trending_colors USING btree (region, date DESC, score DESC);

-- ============================================================================
-- USER_ANALYTICS TABLE INDEXES
-- ============================================================================

-- User analytics lookup
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics USING btree (user_id);

-- Event type analysis
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics USING btree (event_type);

-- Time-based analytics
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics USING btree (created_at DESC);

-- Composite index for user event history
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_created ON user_analytics USING btree (user_id, created_at DESC);

-- Event data search (for JSON queries)
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_data ON user_analytics USING gin (event_data);

-- System events (user_id is NULL)
CREATE INDEX IF NOT EXISTS idx_user_analytics_system_events ON user_analytics USING btree (event_type, created_at DESC) WHERE user_id IS NULL;

-- ============================================================================
-- NOTIFICATION_SETTINGS TABLE INDEXES
-- ============================================================================

-- Notification preferences lookup (primary key covers this)
-- Users with email notifications enabled
CREATE INDEX IF NOT EXISTS idx_notification_settings_email ON notification_settings USING btree (email_notifications) WHERE email_notifications = true;

-- Users with push notifications enabled
CREATE INDEX IF NOT EXISTS idx_notification_settings_push ON notification_settings USING btree (push_notifications) WHERE push_notifications = true;

-- Users with trending alerts enabled
CREATE INDEX IF NOT EXISTS idx_notification_settings_trending ON notification_settings USING btree (trending_alerts) WHERE trending_alerts = true;

-- ============================================================================
-- STORAGE OPTIMIZATION INDEXES
-- ============================================================================

-- Index on storage.objects for user folder lookups (if not already present)
-- Note: This may already exist in Supabase, but adding for completeness
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_folder ON storage.objects 
USING btree (bucket_id, (storage.foldername(name))[1]);

-- Index for storage cleanup operations
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_created ON storage.objects 
USING btree (bucket_id, created_at) WHERE (storage.foldername(name))[1] = 'anonymous';

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Popular colors by usage (for trending calculations)
CREATE INDEX IF NOT EXISTS idx_popular_colors_weekly ON nail_tries 
USING btree (color_hex, created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- User activity summary
CREATE INDEX IF NOT EXISTS idx_user_activity_summary ON nail_tries 
USING btree (user_id, is_public, created_at DESC) 
WHERE user_id IS NOT NULL;

-- Public content discovery
CREATE INDEX IF NOT EXISTS idx_public_content_discovery ON nail_tries 
USING btree (is_public, created_at DESC) 
WHERE is_public = true;

-- Collection popularity (for public collections)
CREATE INDEX IF NOT EXISTS idx_collection_popularity ON collections 
USING btree (is_public, created_at DESC) 
WHERE is_public = true;

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View to monitor index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read as index_reads,
    idx_tup_fetch as index_fetches,
    idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- View to identify unused indexes
CREATE OR REPLACE VIEW unused_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0 
AND schemaname = 'public'
AND indexname NOT LIKE '%_pkey'; -- Exclude primary keys

COMMENT ON VIEW index_usage_stats IS 'Monitor index usage for performance optimization';
COMMENT ON VIEW unused_indexes IS 'Identify potentially unused indexes for cleanup';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Performance indexes created successfully!';
    RAISE NOTICE 'Indexes created for: users, nail_tries, colors, favorites, collections, collection_items, trending_colors, user_analytics, notification_settings';
    RAISE NOTICE 'Special indexes: text search (trigram), JSON (gin), partial indexes for optimization';
    RAISE NOTICE 'Monitoring views: index_usage_stats, unused_indexes';
END $$;