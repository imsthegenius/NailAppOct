-- ============================================================================
-- Database Functions and Triggers
-- File: 04_functions.sql
-- Purpose: Create utility functions and triggers for the nail app
-- ============================================================================

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically update the updated_at column when a row is modified
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colors_updated_at
    BEFORE UPDATE ON colors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRENDING SCORE FUNCTIONS
-- Functions to manage and calculate trending scores for colors
-- ============================================================================

-- Function to increment trending score for a color
CREATE OR REPLACE FUNCTION increment_trending_score(
    color_hex_code TEXT,
    increment_by INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_score INTEGER;
    color_uuid UUID;
BEGIN
    -- Get the color UUID and current score
    SELECT id, trending_score INTO color_uuid, current_score
    FROM colors
    WHERE hex_code = color_hex_code;
    
    -- If color doesn't exist, return 0
    IF color_uuid IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Update the trending score (max 100)
    UPDATE colors
    SET trending_score = LEAST(trending_score + increment_by, 100),
        updated_at = NOW()
    WHERE id = color_uuid;
    
    -- Record trending data for analytics
    INSERT INTO trending_colors (color_id, date, score, region)
    VALUES (color_uuid, CURRENT_DATE, LEAST(current_score + increment_by, 100), 'global')
    ON CONFLICT (color_id, date, region)
    DO UPDATE SET score = EXCLUDED.score;
    
    RETURN LEAST(current_score + increment_by, 100);
END;
$$;

-- Function to calculate weekly trending colors
CREATE OR REPLACE FUNCTION calculate_weekly_trending()
RETURNS TABLE(
    color_id UUID,
    hex_code TEXT,
    name TEXT,
    brand TEXT,
    weekly_score INTEGER,
    total_uses BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    WITH weekly_usage AS (
        SELECT 
            c.id,
            c.hex_code,
            c.name,
            c.brand,
            COUNT(nt.id) as usage_count
        FROM colors c
        LEFT JOIN nail_tries nt ON nt.color_hex = c.hex_code
        WHERE nt.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY c.id, c.hex_code, c.name, c.brand
    )
    SELECT 
        wu.id as color_id,
        wu.hex_code,
        wu.name,
        wu.brand,
        (wu.usage_count * 10)::INTEGER as weekly_score,
        wu.usage_count as total_uses
    FROM weekly_usage wu
    ORDER BY wu.usage_count DESC
    LIMIT 20;
$$;

-- ============================================================================
-- USER STATISTICS FUNCTION
-- Get comprehensive user statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_statistics(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_tries', (
            SELECT COUNT(*) FROM nail_tries WHERE user_id = user_uuid
        ),
        'total_favorites', (
            SELECT COUNT(*) FROM favorites WHERE user_id = user_uuid
        ),
        'total_collections', (
            SELECT COUNT(*) FROM collections WHERE user_id = user_uuid
        ),
        'public_tries', (
            SELECT COUNT(*) FROM nail_tries WHERE user_id = user_uuid AND is_public = true
        ),
        'public_collections', (
            SELECT COUNT(*) FROM collections WHERE user_id = user_uuid AND is_public = true
        ),
        'favorite_colors', (
            SELECT json_agg(json_build_object(
                'hex_code', nt.color_hex,
                'name', nt.color_name,
                'usage_count', color_usage.count
            ))
            FROM (
                SELECT color_hex, COUNT(*) as count
                FROM nail_tries
                WHERE user_id = user_uuid
                GROUP BY color_hex
                ORDER BY COUNT(*) DESC
                LIMIT 5
            ) color_usage
            JOIN nail_tries nt ON nt.color_hex = color_usage.color_hex AND nt.user_id = user_uuid
            GROUP BY color_usage.color_hex, color_usage.count
        ),
        'recent_activity', (
            SELECT json_agg(json_build_object(
                'type', 'nail_try',
                'created_at', created_at,
                'color_hex', color_hex,
                'color_name', color_name
            ))
            FROM nail_tries
            WHERE user_id = user_uuid
            ORDER BY created_at DESC
            LIMIT 10
        ),
        'storage_usage', (
            SELECT json_build_object(
                'file_count', COALESCE(SUM(file_count), 0),
                'total_bytes', COALESCE(SUM(total_bytes), 0)
            )
            FROM user_storage_usage
            WHERE user_id = user_uuid
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- Functions to clean up old data and maintain database health
-- ============================================================================

-- Function to cleanup old anonymous nail tries (30+ days old)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_tries()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete old anonymous nail tries and their associated data
    WITH deleted_tries AS (
        DELETE FROM nail_tries
        WHERE user_id IS NULL 
        AND created_at < NOW() - INTERVAL '30 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted_tries;
    
    -- Log the cleanup operation
    INSERT INTO user_analytics (user_id, event_type, event_data)
    VALUES (
        NULL,
        'system_cleanup',
        jsonb_build_object(
            'cleanup_type', 'anonymous_nail_tries',
            'deleted_count', deleted_count,
            'timestamp', NOW()
        )
    );
    
    RETURN deleted_count;
END;
$$;

-- Function to cleanup orphaned collection items
CREATE OR REPLACE FUNCTION cleanup_orphaned_collection_items()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Remove collection items that reference deleted nail tries
    WITH deleted_items AS (
        DELETE FROM collection_items ci
        WHERE NOT EXISTS (
            SELECT 1 FROM nail_tries nt WHERE nt.id = ci.nail_try_id
        )
        RETURNING collection_id, nail_try_id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted_items;
    
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- RECOMMENDATION FUNCTIONS
-- Functions to provide personalized recommendations
-- ============================================================================

-- Function to get personalized color recommendations
CREATE OR REPLACE FUNCTION get_color_recommendations(
    user_uuid UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    color_id UUID,
    hex_code TEXT,
    name TEXT,
    brand TEXT,
    recommendation_score INTEGER,
    reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_skin_tone TEXT;
    user_preferences JSONB;
BEGIN
    -- Get user preferences
    SELECT skin_tone, style_preference 
    INTO user_skin_tone, user_preferences
    FROM users WHERE id = user_uuid;
    
    -- Return recommendations based on user data
    RETURN QUERY
    WITH color_scores AS (
        SELECT 
            c.id,
            c.hex_code,
            c.name,
            c.brand,
            c.trending_score,
            -- Calculate compatibility score based on user preferences
            CASE 
                WHEN user_skin_tone IS NOT NULL AND user_skin_tone = ANY(
                    CASE 
                        WHEN c.hex_code ~ '^#[F-f][A-Fa-f0-9]{5}$' THEN ARRAY['fair', 'light']
                        WHEN c.hex_code ~ '^#[A-Ea-e][0-9A-Fa-f]{5}$' THEN ARRAY['medium', 'tan']
                        ELSE ARRAY['deep', 'dark']
                    END
                ) THEN 20
                ELSE 0
            END +
            -- Boost score for colors in user's mood preferences
            CASE 
                WHEN user_preferences ? 'moods' AND 
                     c.mood_tags && ARRAY(SELECT jsonb_array_elements_text(user_preferences->'moods'))
                THEN 15
                ELSE 0
            END +
            -- Add trending score
            (c.trending_score / 2) as recommendation_score
        FROM colors c
        WHERE c.trending_score > 0 -- Only recommend colors with some popularity
    )
    SELECT 
        cs.id,
        cs.hex_code,
        cs.name,
        cs.brand,
        cs.recommendation_score,
        CASE 
            WHEN cs.recommendation_score >= 30 THEN 'Perfect match for your style and skin tone'
            WHEN cs.recommendation_score >= 20 THEN 'Great choice based on your preferences'
            WHEN cs.recommendation_score >= 10 THEN 'Trending color that might suit you'
            ELSE 'Popular choice'
        END as reason
    FROM color_scores cs
    ORDER BY cs.recommendation_score DESC, cs.trending_score DESC
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- Functions for tracking and analyzing user behavior
-- ============================================================================

-- Function to track user events
CREATE OR REPLACE FUNCTION track_user_event(
    user_uuid UUID,
    event_name TEXT,
    event_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_analytics (user_id, event_type, event_data, created_at)
    VALUES (user_uuid, event_name, event_metadata, NOW());
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RETURN FALSE;
END;
$$;

-- Function to get app-wide analytics
CREATE OR REPLACE FUNCTION get_app_analytics()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'total_tries', (SELECT COUNT(*) FROM nail_tries),
        'anonymous_tries', (SELECT COUNT(*) FROM nail_tries WHERE user_id IS NULL),
        'public_tries', (SELECT COUNT(*) FROM nail_tries WHERE is_public = true),
        'total_collections', (SELECT COUNT(*) FROM collections),
        'public_collections', (SELECT COUNT(*) FROM collections WHERE is_public = true),
        'top_colors_this_week', (
            SELECT json_agg(
                json_build_object(
                    'hex_code', color_hex,
                    'name', color_name,
                    'usage_count', usage_count
                )
            )
            FROM (
                SELECT 
                    color_hex, 
                    color_name, 
                    COUNT(*) as usage_count
                FROM nail_tries
                WHERE created_at >= NOW() - INTERVAL '7 days'
                GROUP BY color_hex, color_name
                ORDER BY COUNT(*) DESC
                LIMIT 10
            ) weekly_colors
        ),
        'daily_signups_this_week', (
            SELECT json_agg(
                json_build_object(
                    'date', signup_date,
                    'count', signup_count
                )
            )
            FROM (
                SELECT 
                    DATE(created_at) as signup_date,
                    COUNT(*) as signup_count
                FROM users
                WHERE created_at >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at)
            ) daily_signups
        )
    );
$$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Functions and triggers created successfully!';
    RAISE NOTICE 'Created: updated_at triggers, trending functions, user statistics, cleanup functions, recommendations, analytics';
    RAISE NOTICE 'Triggers applied to: users, colors, collections, notification_settings';
END $$;