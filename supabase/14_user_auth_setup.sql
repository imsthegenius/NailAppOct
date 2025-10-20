-- 14_user_auth_setup.sql
-- Setup for user authentication and account management

-- Ensure email authentication is enabled in Supabase Dashboard
-- Go to Authentication > Providers > Enable Email/Password

-- The saved_looks table already has proper RLS policies from 10_nail_storage_setup.sql
-- These policies ensure users can only see/modify their own saved looks

-- Add user profiles table for additional user data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    preferred_nail_tech UUID REFERENCES user_profiles(id),
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
        NOW(),
        NOW()
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket policies remain the same
-- Users must be authenticated to upload/view their images

-- Add view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    up.id as user_id,
    up.email,
    up.full_name,
    COUNT(DISTINCT sl.id) as total_looks,
    COUNT(DISTINCT sl.color_hex) as unique_colors_tried,
    COUNT(DISTINCT sl.shape_name) as unique_shapes_tried,
    MAX(sl.created_at) as last_transformation,
    COUNT(CASE WHEN sl.is_favorite THEN 1 END) as favorite_count
FROM user_profiles up
LEFT JOIN saved_looks sl ON up.id = sl.user_id
GROUP BY up.id, up.email, up.full_name;

-- Grant access to authenticated users
GRANT SELECT ON user_stats TO authenticated;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond auth.users';
COMMENT ON COLUMN user_profiles.preferred_nail_tech IS 'Reference to nail technician user for sharing looks';

-- IMPORTANT: After running this SQL:
-- 1. Ensure Email/Password auth is enabled in Supabase Dashboard
-- 2. Configure email templates for signup/password reset
-- 3. Set up SMTP settings for email delivery
