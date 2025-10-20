-- ============================================================================
-- FIXED v2: Storage Configuration for Nail App
-- This version removes attempts to modify Supabase's internal storage tables
-- ============================================================================

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('user-uploads', 'user-uploads', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('transformed-images', 'transformed-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Note: We cannot enable RLS on storage.objects as we don't own this table
-- Supabase manages this internally
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; -- REMOVED

-- ============================================================================
-- USER-UPLOADS BUCKET POLICIES
-- Private bucket for original hand photos
-- ============================================================================

-- Users can upload to their own folder
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'user-uploads' 
    AND (auth.uid()::text = (string_to_array(name, '/'))[1] OR (string_to_array(name, '/'))[1] = 'anonymous')
);

-- Users can view their own images
CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT 
USING (
    bucket_id = 'user-uploads' 
    AND (auth.uid()::text = (string_to_array(name, '/'))[1] OR (string_to_array(name, '/'))[1] = 'anonymous')
);

-- Users can update their own images
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE 
USING (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Users can delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE 
USING (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- ============================================================================
-- TRANSFORMED-IMAGES BUCKET POLICIES
-- Public bucket for AI-processed images
-- ============================================================================

-- Anyone can view transformed images (public bucket)
CREATE POLICY "Anyone can view transformed images" ON storage.objects
FOR SELECT 
USING (bucket_id = 'transformed-images');

-- Authenticated users can upload transformed images
CREATE POLICY "Authenticated users can upload transformed images" ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'transformed-images' 
    AND (auth.uid() IS NOT NULL OR (string_to_array(name, '/'))[1] = 'anonymous')
);

-- Users can update their own transformed images
CREATE POLICY "Users can update their own transformed images" ON storage.objects
FOR UPDATE 
USING (
    bucket_id = 'transformed-images' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK (
    bucket_id = 'transformed-images' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Users can delete their own transformed images
CREATE POLICY "Users can delete their own transformed images" ON storage.objects
FOR DELETE 
USING (
    bucket_id = 'transformed-images' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- Public bucket for user profile pictures
-- ============================================================================

-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT 
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE 
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE 
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- ============================================================================
-- STORAGE HELPER FUNCTIONS (Using our own tables, not storage.objects)
-- ============================================================================

-- Function to get storage URL for an object
CREATE OR REPLACE FUNCTION get_storage_url(bucket text, object_path text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    base_url text;
BEGIN
    -- Get the Supabase project URL from settings or use placeholder
    -- You'll need to replace this with your actual Supabase URL
    base_url := 'https://your-project.supabase.co/storage/v1/object/public/';
    
    RETURN base_url || bucket || '/' || object_path;
END;
$$;

-- Function to track storage usage in our own table
CREATE TABLE IF NOT EXISTS storage_tracking (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    bucket_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    mime_type text,
    uploaded_at timestamp with time zone DEFAULT now(),
    UNIQUE(bucket_name, file_path)
);

-- Enable RLS on our tracking table
ALTER TABLE storage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only see their own storage tracking
CREATE POLICY "Users can view own storage tracking" ON storage_tracking
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own storage tracking
CREATE POLICY "Users can insert own storage tracking" ON storage_tracking
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own storage tracking
CREATE POLICY "Users can delete own storage tracking" ON storage_tracking
FOR DELETE USING (auth.uid() = user_id);

-- Function to record storage usage
CREATE OR REPLACE FUNCTION record_storage_usage(
    p_user_id uuid,
    p_bucket text,
    p_path text,
    p_size bigint,
    p_mime text DEFAULT 'image/jpeg'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_tracking_id uuid;
BEGIN
    INSERT INTO storage_tracking (user_id, bucket_name, file_path, file_size, mime_type)
    VALUES (p_user_id, p_bucket, p_path, p_size, p_mime)
    ON CONFLICT (bucket_name, file_path) 
    DO UPDATE SET 
        file_size = EXCLUDED.file_size,
        uploaded_at = now()
    RETURNING id INTO v_tracking_id;
    
    RETURN v_tracking_id;
END;
$$;

-- Function to get user's storage usage from our tracking table
CREATE OR REPLACE FUNCTION get_user_storage_usage(p_user_id uuid)
RETURNS TABLE(
    bucket text,
    file_count bigint,
    total_bytes bigint,
    total_mb numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bucket_name as bucket,
        COUNT(*)::bigint as file_count,
        COALESCE(SUM(file_size), 0)::bigint as total_bytes,
        ROUND(COALESCE(SUM(file_size), 0) / 1048576.0, 2) as total_mb
    FROM storage_tracking
    WHERE user_id = p_user_id
    GROUP BY bucket_name;
END;
$$;

-- Function to cleanup old anonymous uploads from tracking
CREATE OR REPLACE FUNCTION cleanup_anonymous_storage_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete anonymous uploads older than 30 days from our tracking
    DELETE FROM storage_tracking
    WHERE user_id IS NULL
        AND uploaded_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ============================================================================
-- MONITORING VIEWS (Using our tracking table)
-- ============================================================================

-- View for storage statistics by bucket
CREATE OR REPLACE VIEW storage_statistics AS
SELECT 
    bucket_name,
    COUNT(*) as total_files,
    COALESCE(SUM(file_size), 0) as total_bytes,
    ROUND(COALESCE(SUM(file_size), 0) / 1048576.0, 2) as total_mb,
    ROUND(COALESCE(SUM(file_size), 0) / 1073741824.0, 2) as total_gb,
    MAX(uploaded_at) as last_upload,
    MIN(uploaded_at) as first_upload
FROM storage_tracking
GROUP BY bucket_name;

-- View for user storage usage
CREATE OR REPLACE VIEW user_storage_summary AS
SELECT 
    user_id,
    COUNT(*) as total_files,
    COUNT(DISTINCT bucket_name) as buckets_used,
    COALESCE(SUM(file_size), 0) as total_bytes,
    ROUND(COALESCE(SUM(file_size), 0) / 1048576.0, 2) as total_mb,
    MAX(uploaded_at) as last_upload
FROM storage_tracking
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- View for anonymous storage usage
CREATE OR REPLACE VIEW anonymous_storage_summary AS
SELECT 
    bucket_name,
    COUNT(*) as file_count,
    COALESCE(SUM(file_size), 0) as total_bytes,
    MAX(uploaded_at) as last_upload,
    MIN(uploaded_at) as first_upload,
    COUNT(CASE WHEN uploaded_at < NOW() - INTERVAL '30 days' THEN 1 END) as files_to_cleanup
FROM storage_tracking
WHERE user_id IS NULL
GROUP BY bucket_name;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE storage_tracking IS 'Tracks file uploads for storage management and quotas';
COMMENT ON FUNCTION record_storage_usage IS 'Records file upload in tracking table';
COMMENT ON FUNCTION get_user_storage_usage IS 'Returns storage usage statistics for a user';
COMMENT ON FUNCTION cleanup_anonymous_storage_tracking IS 'Removes old anonymous upload records';