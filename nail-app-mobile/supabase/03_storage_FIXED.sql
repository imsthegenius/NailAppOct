-- ============================================================================
-- FIXED: Storage Configuration for Nail App
-- This version fixes the SUM function error by properly casting metadata
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

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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
-- STORAGE HELPER FUNCTIONS
-- ============================================================================

-- Function to get storage URL for an object
CREATE OR REPLACE FUNCTION get_storage_url(bucket text, object_path text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    base_url text;
BEGIN
    -- Get the base URL from environment or use default
    SELECT current_setting('app.settings.storage_url', true) INTO base_url;
    
    IF base_url IS NULL THEN
        base_url := 'https://your-project.supabase.co/storage/v1/object/public/';
    END IF;
    
    RETURN base_url || bucket || '/' || object_path;
END;
$$;

-- Function to clean up old anonymous uploads
CREATE OR REPLACE FUNCTION cleanup_anonymous_storage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete anonymous uploads older than 30 days
    DELETE FROM storage.objects
    WHERE bucket_id IN ('user-uploads', 'transformed-images')
        AND (string_to_array(name, '/'))[1] = 'anonymous'
        AND created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Function to get user's storage usage (FIXED version)
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_id uuid)
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
        so.bucket_id::text as bucket,
        COUNT(*)::bigint as file_count,
        COALESCE(SUM((so.metadata->>'size')::bigint), 0)::bigint as total_bytes,
        ROUND(COALESCE(SUM((so.metadata->>'size')::bigint), 0) / 1048576.0, 2) as total_mb
    FROM storage.objects so
    WHERE (string_to_array(so.name, '/'))[1] = user_id::text
    GROUP BY so.bucket_id;
END;
$$;

-- Function to validate image upload
CREATE OR REPLACE FUNCTION validate_image_upload()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    max_size bigint := 5242880; -- 5MB
    allowed_types text[] := ARRAY['image/jpeg', 'image/png', 'image/webp'];
    file_size bigint;
    file_type text;
BEGIN
    -- Extract metadata
    file_size := (NEW.metadata->>'size')::bigint;
    file_type := NEW.metadata->>'mimetype';
    
    -- Check file size
    IF file_size > max_size THEN
        RAISE EXCEPTION 'File size exceeds maximum allowed size of 5MB';
    END IF;
    
    -- Check file type
    IF NOT (file_type = ANY(allowed_types)) THEN
        RAISE EXCEPTION 'File type % is not allowed. Allowed types: JPEG, PNG, WebP', file_type;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for image validation
DROP TRIGGER IF EXISTS validate_image_upload_trigger ON storage.objects;
CREATE TRIGGER validate_image_upload_trigger
BEFORE INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id IN ('user-uploads', 'transformed-images', 'avatars'))
EXECUTE FUNCTION validate_image_upload();

-- ============================================================================
-- STORAGE MONITORING VIEWS
-- ============================================================================

-- View for storage statistics by bucket
CREATE OR REPLACE VIEW storage_statistics AS
SELECT 
    bucket_id,
    COUNT(*) as total_files,
    COALESCE(SUM((metadata->>'size')::bigint), 0) as total_bytes,
    ROUND(COALESCE(SUM((metadata->>'size')::bigint), 0) / 1048576.0, 2) as total_mb,
    ROUND(COALESCE(SUM((metadata->>'size')::bigint), 0) / 1073741824.0, 2) as total_gb,
    MAX(created_at) as last_upload,
    MIN(created_at) as first_upload
FROM storage.objects
GROUP BY bucket_id;

-- View for user storage usage (FIXED version)
CREATE OR REPLACE VIEW user_storage_usage AS
SELECT 
    (string_to_array(name, '/'))[1] as user_identifier,
    bucket_id,
    COUNT(*) as file_count,
    COALESCE(SUM((metadata->>'size')::bigint), 0) as total_bytes,
    MAX(created_at) as last_upload
FROM storage.objects
WHERE (string_to_array(name, '/'))[1] != 'anonymous'
    AND length((string_to_array(name, '/'))[1]) = 36 -- UUID length
GROUP BY (string_to_array(name, '/'))[1], bucket_id;

-- View for anonymous storage usage
CREATE OR REPLACE VIEW anonymous_storage_usage AS
SELECT 
    bucket_id,
    COUNT(*) as file_count,
    COALESCE(SUM((metadata->>'size')::bigint), 0) as total_bytes,
    MAX(created_at) as last_upload,
    MIN(created_at) as first_upload,
    COUNT(CASE WHEN created_at < NOW() - INTERVAL '30 days' THEN 1 END) as files_to_cleanup
FROM storage.objects
WHERE (string_to_array(name, '/'))[1] = 'anonymous'
GROUP BY bucket_id;

-- ============================================================================
-- SCHEDULED CLEANUP (To be run periodically)
-- ============================================================================

-- Schedule this function to run daily using pg_cron or external scheduler
-- SELECT cron.schedule('cleanup-anonymous-storage', '0 2 * * *', 'SELECT cleanup_anonymous_storage();');

COMMENT ON FUNCTION cleanup_anonymous_storage() IS 'Removes anonymous uploads older than 30 days. Schedule to run daily.';
COMMENT ON FUNCTION get_user_storage_usage(uuid) IS 'Returns storage usage statistics for a specific user';
COMMENT ON FUNCTION validate_image_upload() IS 'Validates image uploads for size and type restrictions';