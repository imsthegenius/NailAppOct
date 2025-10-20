-- ============================================================================
-- Storage Buckets Configuration
-- File: 03_storage.sql
-- Purpose: Configure Supabase Storage buckets for nail app image handling
-- ============================================================================

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Bucket for user-uploaded original hand images (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-uploads',
    'user-uploads',
    FALSE, -- Private bucket
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Bucket for AI-transformed nail images (public via CDN)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'transformed-images',
    'transformed-images',
    TRUE, -- Public bucket for CDN access
    10485760, -- 10MB limit (transformed images might be larger)
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Bucket for user avatars (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    TRUE, -- Public bucket
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Bucket for collection cover images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'collection-covers',
    'collection-covers',
    TRUE, -- Public bucket
    3145728, -- 3MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================================================
-- STORAGE POLICIES FOR USER-UPLOADS BUCKET (Private)
-- ============================================================================

-- Users can upload to their own folder
CREATE POLICY "Users can upload to own folder in user-uploads" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'user-uploads' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can read their own uploads
CREATE POLICY "Users can read own uploads" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'user-uploads' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'user-uploads' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Anonymous users can upload (for guest functionality)
CREATE POLICY "Anonymous users can upload temporarily" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (
        bucket_id = 'user-uploads' AND
        (storage.foldername(name))[1] = 'anonymous'
    );

-- ============================================================================
-- STORAGE POLICIES FOR TRANSFORMED-IMAGES BUCKET (Public)
-- ============================================================================

-- Anyone can read transformed images (public bucket)
CREATE POLICY "Transformed images are publicly readable" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'transformed-images');

-- Authenticated users can upload transformed images to their folder
CREATE POLICY "Users can upload transformed images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'transformed-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Anonymous users can upload transformed images
CREATE POLICY "Anonymous users can upload transformed images" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (
        bucket_id = 'transformed-images' AND
        (storage.foldername(name))[1] = 'anonymous'
    );

-- Users can delete their own transformed images
CREATE POLICY "Users can delete own transformed images" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'transformed-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- STORAGE POLICIES FOR AVATARS BUCKET (Public)
-- ============================================================================

-- Anyone can read avatars (public bucket)
CREATE POLICY "Avatars are publicly readable" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- STORAGE POLICIES FOR COLLECTION-COVERS BUCKET (Public)
-- ============================================================================

-- Anyone can read collection covers (public bucket)
CREATE POLICY "Collection covers are publicly readable" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'collection-covers');

-- Users can upload collection covers
CREATE POLICY "Users can upload collection covers" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'collection-covers' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can update their collection covers
CREATE POLICY "Users can update collection covers" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'collection-covers' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their collection covers
CREATE POLICY "Users can delete collection covers" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'collection-covers' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- STORAGE HELPER FUNCTIONS
-- ============================================================================

-- Function to generate consistent file paths
CREATE OR REPLACE FUNCTION generate_storage_path(
    bucket_name TEXT,
    user_uuid UUID DEFAULT NULL,
    file_extension TEXT DEFAULT 'jpg'
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    folder_name TEXT;
    file_name TEXT;
BEGIN
    -- Determine folder name
    IF user_uuid IS NULL THEN
        folder_name := 'anonymous';
    ELSE
        folder_name := user_uuid::text;
    END IF;
    
    -- Generate unique file name
    file_name := gen_random_uuid()::text || '.' || file_extension;
    
    -- Return full path
    RETURN folder_name || '/' || file_name;
END;
$$;

-- Function to get public URL for storage object
CREATE OR REPLACE FUNCTION get_storage_public_url(
    bucket_name TEXT,
    object_path TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url', true) || 
           '/storage/v1/object/public/' || bucket_name || '/' || object_path;
END;
$$;

-- Function to clean up old anonymous uploads (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_uploads()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete anonymous uploads older than 30 days
    WITH deleted_objects AS (
        DELETE FROM storage.objects
        WHERE 
            (bucket_id IN ('user-uploads', 'transformed-images')) AND
            (storage.foldername(name))[1] = 'anonymous' AND
            created_at < NOW() - INTERVAL '30 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted_objects;
    
    -- Log the cleanup
    INSERT INTO user_analytics (user_id, event_type, event_data)
    VALUES (
        NULL,
        'system_cleanup',
        jsonb_build_object(
            'cleanup_type', 'anonymous_uploads',
            'deleted_count', deleted_count,
            'timestamp', NOW()
        )
    );
    
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- STORAGE USAGE TRACKING
-- ============================================================================

-- Create view for storage usage by user
CREATE OR REPLACE VIEW user_storage_usage AS
SELECT 
    (storage.foldername(name))[1]::uuid as user_id,
    bucket_id,
    COUNT(*) as file_count,
    SUM(metadata->>'size')::bigint as total_bytes,
    MAX(created_at) as last_upload
FROM storage.objects
WHERE (storage.foldername(name))[1] != 'anonymous'
    AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
GROUP BY (storage.foldername(name))[1], bucket_id;

COMMENT ON VIEW user_storage_usage IS 'Track storage usage per user and bucket';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Storage configuration completed successfully!';
    RAISE NOTICE 'Buckets created: user-uploads (private), transformed-images (public), avatars (public), collection-covers (public)';
    RAISE NOTICE 'File size limits: user-uploads (5MB), transformed-images (10MB), avatars (2MB), collection-covers (3MB)';
    RAISE NOTICE 'Anonymous users can upload to anonymous folders with 30-day cleanup';
END $$;