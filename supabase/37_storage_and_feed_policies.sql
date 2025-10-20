-- ============================================================================
-- Storage + Feed Policies (Run-Now Script)
-- File: 37_storage_and_feed_policies.sql
-- Purpose:
--   1) Ensure upload permissions to Storage for logged-in users
--   2) (Optionally) make user-uploads bucket public for MVP
--   3) Add saved_looks RLS policies for inserts and reads
--   4) Add helpful index for feed ordering
-- Notes:
--   - Idempotent: safe to re-run; policies are created only if missing.
--   - Adjust the SELECT policy at the bottom depending on private vs public feed.
-- ============================================================================

-- 0) (Optional) Make user-uploads public for MVP (reads via getPublicUrl)
--    Comment out if you prefer private + signed download URLs.
UPDATE storage.buckets
SET public = TRUE
WHERE name IN ('user-uploads');

-- 1) Allow authenticated users to insert into transformed-images under their own prefix: <userId>/...
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'auth insert transformed'
  ) THEN
    CREATE POLICY "auth insert transformed"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'transformed-images'
      AND name LIKE auth.uid()::text || '/%'
    );
  END IF;
END $$;

-- 2) Allow authenticated users to insert into user-uploads under their own prefix: <userId>/...
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'auth insert uploads'
  ) THEN
    CREATE POLICY "auth insert uploads"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'user-uploads'
      AND name LIKE auth.uid()::text || '/%'
    );
  END IF;
END $$;

-- 3) (Optional) Public read policies when buckets are private
--    Not required if buckets are marked public. Left here for completeness.
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies
--     WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'public read transformed'
--   ) THEN
--     CREATE POLICY "public read transformed"
--     ON storage.objects FOR SELECT TO anon
--     USING (bucket_id = 'transformed-images');
--   END IF;
-- END $$;
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies
--     WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'public read uploads'
--   ) THEN
--     CREATE POLICY "public read uploads"
--     ON storage.objects FOR SELECT TO anon
--     USING (bucket_id = 'user-uploads');
--   END IF;
-- END $$;

-- 4) saved_looks RLS policies
ALTER TABLE saved_looks ENABLE ROW LEVEL SECURITY;

-- Insert: user can insert their own rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'saved_looks'
      AND policyname = 'insert own looks'
  ) THEN
    CREATE POLICY "insert own looks"
    ON saved_looks FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Select: choose ONE of the two options below.
-- A) Private feed (each user sees only their own looks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'saved_looks'
      AND policyname = 'select own looks'
  ) THEN
    CREATE POLICY "select own looks"
    ON saved_looks FOR SELECT TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- B) Public feed (anyone can read all looks) — DISABLED by default.
-- Uncomment to enable global/public feed:
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies
--     WHERE schemaname = 'public'
--       AND tablename = 'saved_looks'
--       AND policyname = 'public feed read'
--   ) THEN
--     CREATE POLICY "public feed read"
--     ON saved_looks FOR SELECT TO anon
--     USING (true);
--   END IF;
-- END $$;

-- 5) Helpful index for feed ordering
CREATE INDEX IF NOT EXISTS saved_looks_created_at_idx
  ON saved_looks (created_at DESC);

-- Done
SELECT 'Storage + Feed policies applied' AS status;

