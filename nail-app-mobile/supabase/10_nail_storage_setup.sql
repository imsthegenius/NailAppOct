-- 10_nail_storage_setup.sql
-- Setup for storing nail transformation images and saved looks

-- Create saved_looks table
CREATE TABLE IF NOT EXISTS saved_looks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_image_url TEXT NOT NULL,
    transformed_image_url TEXT NOT NULL,
    color_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    shape_name VARCHAR(100) NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    shared_with_tech BOOLEAN DEFAULT false,
    tech_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_saved_looks_user_id ON saved_looks(user_id);
CREATE INDEX idx_saved_looks_created_at ON saved_looks(created_at DESC);
CREATE INDEX idx_saved_looks_favorite ON saved_looks(user_id, is_favorite) WHERE is_favorite = true;

-- Enable RLS
ALTER TABLE saved_looks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_looks
CREATE POLICY "Users can view their own saved looks"
    ON saved_looks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved looks"
    ON saved_looks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved looks"
    ON saved_looks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved looks"
    ON saved_looks FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_saved_looks_updated_at
    BEFORE UPDATE ON saved_looks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage buckets already exist from 03_storage.sql:
-- 1. user-uploads (private, 5MB) - For original hand photos
-- 2. transformed-images (public, 10MB) - For AI-transformed results
-- 3. avatars (public, 2MB) - For user profile pictures

-- Storage RLS Policies (after bucket creation)
-- These should be added via Supabase Dashboard under Storage policies:

-- 1. Allow authenticated users to upload to their own folder
-- Path pattern: {user_id}/*
-- Operations: INSERT
-- Check: auth.uid()::text = (storage.foldername(name))[1]

-- 2. Allow users to view all images (public bucket)
-- Path pattern: *
-- Operations: SELECT
-- Check: true

-- 3. Allow users to delete their own images
-- Path pattern: {user_id}/*
-- Operations: DELETE
-- Check: auth.uid()::text = (storage.foldername(name))[1]

-- 4. Allow users to update their own images
-- Path pattern: {user_id}/*
-- Operations: UPDATE
-- Check: auth.uid()::text = (storage.foldername(name))[1]

-- Add stats view for user dashboard
CREATE OR REPLACE VIEW user_look_stats AS
SELECT 
    user_id,
    COUNT(*) as total_looks,
    COUNT(DISTINCT color_hex) as unique_colors,
    COUNT(DISTINCT shape_name) as unique_shapes,
    COUNT(*) FILTER (WHERE is_favorite) as favorite_count,
    COUNT(*) FILTER (WHERE shared_with_tech) as shared_count,
    MAX(created_at) as last_created
FROM saved_looks
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON user_look_stats TO authenticated;

-- Optional: Add a cleanup function for orphaned images
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void AS $$
DECLARE
    look_record RECORD;
BEGIN
    -- This would need to be called periodically
    -- Removes storage entries that don't have corresponding database records
    -- Implementation depends on Supabase storage API access
    RAISE NOTICE 'Cleanup function placeholder - implement with storage management API';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE saved_looks IS 'Stores user nail transformation history with colors and shapes';
COMMENT ON COLUMN saved_looks.user_id IS 'References the authenticated user who created this look';
COMMENT ON COLUMN saved_looks.original_image_url IS 'URL to the original uploaded image in Supabase Storage';
COMMENT ON COLUMN saved_looks.transformed_image_url IS 'URL to the AI-transformed image in Supabase Storage';
COMMENT ON COLUMN saved_looks.tech_notes IS 'Notes from nail technician when shared';