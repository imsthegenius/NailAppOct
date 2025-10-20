-- 12_account_deletion.sql
-- Account deletion functionality for Apple App Store compliance
-- Required since June 30, 2022 per App Store Guidelines 5.1.1

-- Function to delete all user data
CREATE OR REPLACE FUNCTION delete_user_account(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_looks INTEGER;
    v_deleted_profile INTEGER;
    v_result JSON;
BEGIN
    -- Check if the user calling this function is the same as the user being deleted
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
    END IF;

    -- Start transaction
    BEGIN
        -- 1. Delete all saved looks for this user
        DELETE FROM saved_looks 
        WHERE user_id = p_user_id;
        GET DIAGNOSTICS v_deleted_looks = ROW_COUNT;

        -- 2. Delete user profile if exists
        DELETE FROM user_profiles 
        WHERE id = p_user_id;
        GET DIAGNOSTICS v_deleted_profile = ROW_COUNT;

        -- 3. Delete storage objects (images)
        -- Note: This requires storage.objects access which may need to be done via Edge Function
        -- For now, we'll mark them for deletion
        DELETE FROM storage.objects
        WHERE bucket_id IN ('user-uploads', 'transformed-images')
        AND owner = p_user_id::text;

        -- 4. Log the deletion for audit purposes (optional)
        INSERT INTO audit_logs (
            user_id,
            action,
            details,
            created_at
        ) VALUES (
            p_user_id,
            'account_deleted',
            jsonb_build_object(
                'deleted_looks', v_deleted_looks,
                'deleted_profile', v_deleted_profile,
                'deletion_time', NOW()
            ),
            NOW()
        );

        -- Build result
        v_result := json_build_object(
            'success', true,
            'deleted_looks', v_deleted_looks,
            'deleted_profile', v_deleted_profile,
            'message', 'Account successfully deleted'
        );

        -- Note: The actual auth.users deletion must be done through Supabase Auth Admin API
        -- This is handled in the client application after this function succeeds

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback on any error
        RAISE EXCEPTION 'Account deletion failed: %', SQLERRM;
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Create audit table for tracking deletions (optional but recommended)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert into audit_logs (no user access)
CREATE POLICY "System only insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (false);

-- Allow admins to view audit logs (you'll need to create an admin role)
-- For now, no one can read audit logs except through database console

-- Function to handle user data export (GDPR compliance)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_data JSON;
    v_saved_looks JSON;
    v_profile JSON;
BEGIN
    -- Check authorization
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only export your own data';
    END IF;

    -- Get user profile
    SELECT row_to_json(up) INTO v_profile
    FROM user_profiles up
    WHERE up.id = p_user_id;

    -- Get saved looks
    SELECT json_agg(
        json_build_object(
            'id', sl.id,
            'original_image_url', sl.original_image_url,
            'transformed_image_url', sl.transformed_image_url,
            'color_name', sl.color_name,
            'color_hex', sl.color_hex,
            'shape_name', sl.shape_name,
            'created_at', sl.created_at
        )
    ) INTO v_saved_looks
    FROM saved_looks sl
    WHERE sl.user_id = p_user_id;

    -- Build complete data export
    v_user_data := json_build_object(
        'export_date', NOW(),
        'user_id', p_user_id,
        'profile', v_profile,
        'saved_looks', COALESCE(v_saved_looks, '[]'::json),
        'export_version', '1.0'
    );

    RETURN v_user_data;
END;
$$;

-- Grant execute permission for data export
GRANT EXECUTE ON FUNCTION export_user_data(UUID) TO authenticated;

-- Comment on functions for documentation
COMMENT ON FUNCTION delete_user_account(UUID) IS 'Deletes all user data for App Store compliance. Must be followed by auth.users deletion via Admin API.';
COMMENT ON FUNCTION export_user_data(UUID) IS 'Exports all user data for GDPR compliance and user data portability.';