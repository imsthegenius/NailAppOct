-- 38_onboarding_helpers.sql
-- Utilities to finalize onboarding state and sync profile details

CREATE OR REPLACE FUNCTION public.mark_onboarding_complete(p_full_name TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'mark_onboarding_complete must be called with an authenticated user';
    END IF;

    INSERT INTO public.user_preferences (user_id, onboarding_completed, updated_at)
    VALUES (v_user_id, TRUE, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET onboarding_completed = TRUE, updated_at = NOW();

    IF p_full_name IS NOT NULL THEN
        UPDATE public.user_profiles
        SET full_name = p_full_name,
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- Ensure user_settings row exists for downstream features
    PERFORM public.get_user_settings();
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_onboarding_complete(TEXT) TO authenticated;

COMMENT ON FUNCTION public.mark_onboarding_complete IS 'Marks onboarding as complete, storing optional full name and initializing defaults.';
