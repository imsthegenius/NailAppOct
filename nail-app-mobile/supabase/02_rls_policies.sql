-- ============================================================================
-- Row Level Security Policies
-- File: 02_rls_policies.sql
-- Purpose: Configure RLS policies for secure data access in the nail app
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE nail_tries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- Users can only access their own profile data
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (signup)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- COLORS TABLE POLICIES
-- Colors are publicly readable, only admin can modify
-- ============================================================================

-- Everyone can read colors (for browsing)
CREATE POLICY "Colors are publicly readable" ON colors
    FOR SELECT TO authenticated, anon
    USING (true);

-- Only authenticated users with admin role can modify colors
-- Note: This assumes you'll have a custom claim for admin users
CREATE POLICY "Only admins can modify colors" ON colors
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- ============================================================================
-- NAIL_TRIES TABLE POLICIES
-- Users can manage their own tries, public tries are readable by all
-- ============================================================================

-- Users can read their own nail tries
CREATE POLICY "Users can read own nail tries" ON nail_tries
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Everyone can read public nail tries
CREATE POLICY "Public nail tries are readable" ON nail_tries
    FOR SELECT TO authenticated, anon
    USING (is_public = true);

-- Users can create nail tries (including anonymous)
CREATE POLICY "Users can create nail tries" ON nail_tries
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Authenticated users can only create tries for themselves
        (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
        -- Anonymous users can create tries with null user_id
        (auth.uid() IS NULL AND user_id IS NULL)
    );

-- Users can update their own nail tries
CREATE POLICY "Users can update own nail tries" ON nail_tries
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own nail tries
CREATE POLICY "Users can delete own nail tries" ON nail_tries
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- FAVORITES TABLE POLICIES
-- Users can only manage their own favorites
-- ============================================================================

-- Users can read their own favorites
CREATE POLICY "Users can read own favorites" ON favorites
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Users can add to their favorites
CREATE POLICY "Users can add favorites" ON favorites
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can remove from their favorites
CREATE POLICY "Users can remove favorites" ON favorites
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Users can update their favorite notes
CREATE POLICY "Users can update favorite notes" ON favorites
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COLLECTIONS TABLE POLICIES
-- Users manage their own collections, public collections readable by all
-- ============================================================================

-- Users can read their own collections
CREATE POLICY "Users can read own collections" ON collections
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Everyone can read public collections
CREATE POLICY "Public collections are readable" ON collections
    FOR SELECT TO authenticated, anon
    USING (is_public = true);

-- Users can create their own collections
CREATE POLICY "Users can create collections" ON collections
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own collections
CREATE POLICY "Users can update own collections" ON collections
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own collections
CREATE POLICY "Users can delete own collections" ON collections
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- COLLECTION_ITEMS TABLE POLICIES
-- Users can manage items in their own collections, read public collection items
-- ============================================================================

-- Users can read items in their own collections
CREATE POLICY "Users can read own collection items" ON collection_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM collections 
            WHERE collections.id = collection_items.collection_id 
            AND collections.user_id = auth.uid()
        )
    );

-- Everyone can read items in public collections
CREATE POLICY "Public collection items are readable" ON collection_items
    FOR SELECT TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM collections 
            WHERE collections.id = collection_items.collection_id 
            AND collections.is_public = true
        )
    );

-- Users can manage items in their own collections
CREATE POLICY "Users can manage own collection items" ON collection_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM collections 
            WHERE collections.id = collection_items.collection_id 
            AND collections.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections 
            WHERE collections.id = collection_items.collection_id 
            AND collections.user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRENDING_COLORS TABLE POLICIES
-- Read-only for users, admin-writable
-- ============================================================================

-- Everyone can read trending data
CREATE POLICY "Trending colors are publicly readable" ON trending_colors
    FOR SELECT TO authenticated, anon
    USING (true);

-- Only admins can modify trending data
CREATE POLICY "Only admins can modify trending colors" ON trending_colors
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- ============================================================================
-- USER_ANALYTICS TABLE POLICIES
-- Users can insert their own analytics, read their own data
-- ============================================================================

-- Users can read their own analytics
CREATE POLICY "Users can read own analytics" ON user_analytics
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own analytics
CREATE POLICY "Users can insert own analytics" ON user_analytics
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Admins can read all analytics
CREATE POLICY "Admins can read all analytics" ON user_analytics
    FOR SELECT TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- ============================================================================
-- NOTIFICATION_SETTINGS TABLE POLICIES
-- Users can only manage their own notification settings
-- ============================================================================

-- Users can read their own notification settings
CREATE POLICY "Users can read own notification settings" ON notification_settings
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own notification settings
CREATE POLICY "Users can insert own notification settings" ON notification_settings
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own notification settings
CREATE POLICY "Users can update own notification settings" ON notification_settings
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SECURITY HELPER FUNCTIONS
-- Functions to help with common security checks
-- ============================================================================

-- Function to check if user owns a collection
CREATE OR REPLACE FUNCTION user_owns_collection(collection_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM collections 
        WHERE id = collection_uuid 
        AND user_id = auth.uid()
    );
$$;

-- Function to check if collection is public
CREATE OR REPLACE FUNCTION collection_is_public(collection_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT COALESCE((
        SELECT is_public FROM collections 
        WHERE id = collection_uuid
    ), FALSE);
$$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'RLS policies created successfully!';
    RAISE NOTICE 'All tables now have appropriate security policies configured.';
    RAISE NOTICE 'Anonymous users can create nail_tries and view public content.';
    RAISE NOTICE 'Authenticated users can manage their own data.';
END $$;