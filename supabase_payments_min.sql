-- Minimal Payments Setup (Safe to run)
-- Purpose: Add only the fields and helpers needed for payments without touching colors or other app tables.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid if needed later

-- 1) Add payment-related columns to users (non-destructive)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_renewal_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Optional: constrain status to a known set (comment out if you prefer free-form)
-- ALTER TABLE users
--   ADD CONSTRAINT users_subscription_status_check
--   CHECK (subscription_status IN ('free','trialing','active','past_due','canceled'));

-- 2) Helper function to update a user's subscription in one call
CREATE OR REPLACE FUNCTION update_user_subscription(
  p_user_id UUID,
  p_status TEXT,
  p_plan TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_stripe_subscription_id TEXT DEFAULT NULL,
  p_renewal_at TIMESTAMPTZ DEFAULT NULL,
  p_trial_ends_at TIMESTAMPTZ DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    subscription_status = p_status,
    subscription_plan = p_plan,
    stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
    subscription_renewal_at = COALESCE(p_renewal_at, subscription_renewal_at),
    trial_ends_at = COALESCE(p_trial_ends_at, trial_ends_at),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE 'Minimal payments setup applied.';
END $$;

