-- 13_legal_compliance.sql
-- Legal compliance tables for App Store requirements

-- Table to track user consent and legal agreements
CREATE TABLE IF NOT EXISTS user_legal_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agreement_type TEXT NOT NULL CHECK (agreement_type IN ('privacy_policy', 'terms_of_service', 'marketing_consent')),
    version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    UNIQUE(user_id, agreement_type, version)
);

-- Enable RLS
ALTER TABLE user_legal_agreements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own agreements"
    ON user_legal_agreements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agreements"
    ON user_legal_agreements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete agreement history (audit trail)
-- No UPDATE or DELETE policies

-- Create indexes for performance
CREATE INDEX idx_user_legal_agreements_user_id ON user_legal_agreements(user_id);
CREATE INDEX idx_user_legal_agreements_type ON user_legal_agreements(agreement_type);
CREATE INDEX idx_user_legal_agreements_accepted_at ON user_legal_agreements(accepted_at);

-- Table for storing legal document versions
CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL CHECK (document_type IN ('privacy_policy', 'terms_of_service')),
    version TEXT NOT NULL,
    content TEXT NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_type, version)
);

-- Enable RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Everyone can read legal documents (public)
CREATE POLICY "Legal documents are public"
    ON legal_documents FOR SELECT
    USING (true);

-- Only admins can modify (no policy = no access for regular users)

-- Insert current versions of legal documents
INSERT INTO legal_documents (document_type, version, effective_date, content)
VALUES 
    ('privacy_policy', '1.0', '2025-01-01', 'See app for full privacy policy content'),
    ('terms_of_service', '1.0', '2025-01-01', 'See app for full terms of service content')
ON CONFLICT (document_type, version) DO NOTHING;

-- Function to record user agreement acceptance
CREATE OR REPLACE FUNCTION accept_legal_agreement(
    p_agreement_type TEXT,
    p_version TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert agreement record
    INSERT INTO user_legal_agreements (
        user_id,
        agreement_type,
        version,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        p_agreement_type,
        p_version,
        p_ip_address,
        p_user_agent
    )
    ON CONFLICT (user_id, agreement_type, version) DO NOTHING;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION accept_legal_agreement(TEXT, TEXT, INET, TEXT) TO authenticated;

-- Function to check if user has accepted current legal documents
CREATE OR REPLACE FUNCTION check_legal_acceptance()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_privacy_accepted BOOLEAN;
    v_terms_accepted BOOLEAN;
    v_current_privacy_version TEXT;
    v_current_terms_version TEXT;
BEGIN
    -- Get current versions
    SELECT version INTO v_current_privacy_version
    FROM legal_documents
    WHERE document_type = 'privacy_policy'
    ORDER BY effective_date DESC
    LIMIT 1;
    
    SELECT version INTO v_current_terms_version
    FROM legal_documents
    WHERE document_type = 'terms_of_service'
    ORDER BY effective_date DESC
    LIMIT 1;
    
    -- Check if user has accepted current versions
    SELECT EXISTS(
        SELECT 1 FROM user_legal_agreements
        WHERE user_id = auth.uid()
        AND agreement_type = 'privacy_policy'
        AND version = v_current_privacy_version
    ) INTO v_privacy_accepted;
    
    SELECT EXISTS(
        SELECT 1 FROM user_legal_agreements
        WHERE user_id = auth.uid()
        AND agreement_type = 'terms_of_service'
        AND version = v_current_terms_version
    ) INTO v_terms_accepted;
    
    RETURN json_build_object(
        'privacy_policy_accepted', v_privacy_accepted,
        'terms_of_service_accepted', v_terms_accepted,
        'current_privacy_version', v_current_privacy_version,
        'current_terms_version', v_current_terms_version,
        'all_accepted', v_privacy_accepted AND v_terms_accepted
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_legal_acceptance() TO authenticated;

-- Table for user settings (including auto-save to camera roll)
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_save_to_camera_roll BOOLEAN DEFAULT false,
    push_notifications_enabled BOOLEAN DEFAULT true,
    email_notifications_enabled BOOLEAN DEFAULT true,
    marketing_emails_enabled BOOLEAN DEFAULT false,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to get or create user settings
CREATE OR REPLACE FUNCTION get_user_settings()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_settings JSON;
BEGIN
    -- Try to get existing settings
    SELECT row_to_json(us) INTO v_settings
    FROM user_settings us
    WHERE us.user_id = auth.uid();
    
    -- If no settings exist, create default settings
    IF v_settings IS NULL THEN
        INSERT INTO user_settings (user_id)
        VALUES (auth.uid())
        ON CONFLICT (user_id) DO NOTHING
        RETURNING row_to_json(user_settings.*) INTO v_settings;
    END IF;
    
    RETURN v_settings;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_settings() TO authenticated;

-- Comment on tables and functions
COMMENT ON TABLE user_legal_agreements IS 'Tracks user acceptance of legal documents for App Store compliance';
COMMENT ON TABLE legal_documents IS 'Stores versions of legal documents';
COMMENT ON TABLE user_settings IS 'User preferences including auto-save to camera roll';
COMMENT ON FUNCTION accept_legal_agreement IS 'Records user acceptance of privacy policy and terms of service';
COMMENT ON FUNCTION check_legal_acceptance IS 'Checks if user has accepted current legal documents';
COMMENT ON FUNCTION get_user_settings IS 'Gets or creates default user settings';