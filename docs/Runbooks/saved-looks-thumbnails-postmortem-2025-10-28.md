# Saved Looks Thumbnails — Postmortem (2025‑10‑28)

This document logs the issue where thumbnails in My Looks/Feed rendered as black tiles, what we tried, what actually fixed it, and the preventative guidance for future changes.

## Summary
- Symptom: My Looks/Feed showed black tiles for previously saved entries. Logs showed the grid rendering `file://` URIs (device cache) instead of `https`.
- Root cause: corrupted/zero‑byte cached image files were being reused after a dev rebuild wiped the environment. RN `Image` often doesn’t fire `onError` for present but invalid local files, so the selection kept choosing the same broken `file://` path. In parallel, some saved entries relied on stale signed URLs which needed regeneration.
- Non‑cause: RevenueCat/paywall/entitlement gating. My Looks/Feed do not consult entitlements; they render whatever URL is provided.

## What broke (facts)
- After dev rebuild, AsyncStorage/file cache was reset. The app:
  - Reused stale signed URLs for images stored in `savedLooks`.
  - Preferred local cached file paths first; some of those files were zero/invalid (interrupted prior downloads).
- RN `Image` treats an existing but empty local file as a renderable source (no `onError`). Result: persistent black tiles.

## What didn’t work
- Toggling profile/paywall UI. It has no bearing on image selection in My Looks/Feed.
- Waiting for `onError` to flip sources. For zero‑byte local files, `onError` doesn’t fire reliably.
- Pure URL refresh without changing selection order. We still selected bad cache files first.

## Fixes applied (code)
1) Remote‑first selection in the grid (bypasses broken cache by default)
   - `nail-app-mobile/screens/FeedScreen.tsx`: selection order now prefers `https` transformed → `https` original → local transformed → local original. When a failure is recorded for a look, it flips to `https` original → `https` transformed → local fallbacks.

2) Validate cache entries and auto‑repair
   - `FeedScreen.tsx`: when reusing a cached file, we check file size; if it’s tiny (≤ 256 bytes), we re‑download instead of reusing.
   - `FeedScreen.tsx`, `MyLooksScreen.tsx`: on `Image` error, delete the bad local file (if `file://`) and mark the look as failed so selection flips on next render.

3) Always refresh public/signed URLs from Storage references
   - `nail-app-mobile/lib/supabaseStorage.ts`:
     - Added `getPublicUrlFor(bucket, path, existingUrl?)` that can derive bucket/path from an existing URL and generate a fresh public/signed URL via the direct Storage client.
   - `nail-app-mobile/screens/MyLooksScreen.tsx` and `FeedScreen.tsx`:
     - Regenerate `https` URLs for both remote and local entries before rendering/caching.

4) Avoid noisy cache errors and spinner timing
   - `FeedScreen.tsx`:
     - Skip pruning when the `saved-looks/` cache folder doesn’t exist yet.
     - Don’t clear the spinner just because local data exists; keep it until the Supabase merge completes (so we render with fresh URLs first).

## Why the fixes worked
- Remote‑first guarantees we render real `https` URLs even if the local cache is bad.
- Size checks + delete‑on‑error ensure the cache gets repaired rather than reusing broken files.
- URL refresh guarantees all `storage://` or stale links become fresh, valid `https` URLs per current bucket policy.

## How to verify (on device)
- Run: `npm start -- --dev-client -c` (clear Metro cache) and open My Looks.
- Observe console for first two items:
  - `Feed imageUri` should show `https…` after first pass; if a `file://` appears and is invalid, it will be re‑downloaded or deleted and replaced.
- Open any `https` URL in Safari on the simulator; it should load. If it 403s, it was stale and will be refreshed on next pass.

## Prevention & guidance
- Store **storage references** in DB (not raw signed URLs). We already do this in `saveNailLook()` via `createStorageReference`.
- Keep these bucket policies:
  - `transformed-images`: public – use `getPublicUrl` (fast, no signing).
  - `user-uploads`: private – use signed URLs.
- Always refresh URLs on read. Use `getPublicUrlFor()` with bucket/path or parse from an existing URL.
- Prefer remote‑first selection in UI components that render thumbnails. Keep a feature flag to toggle fallback strategies if needed.
- Validate cached files before reuse. Don’t assume `exists` implies validity — check size > a small threshold.
- Delete failing local files on `Image` error to avoid a dead loop.

## One‑time backfill (only if older rows don’t have storage refs)
If older `saved_looks` rows only contain raw `https` URLs, run a one‑time backfill to extract bucket/path and convert to `storage://bucket/path` for consistent refresh behaviour.

```sql
-- Backfill storage refs from existing URLs (original)
update saved_looks
set original_image_storage_bucket = regexp_replace(original_image_url, '.*/object/(?:public|sign|auth)/([^/]+)/.*', '\\1'),
    original_image_storage_path   = regexp_replace(original_image_url, '.*/object/(?:public|sign|auth)/[^/]+/(.*)$', '\\1')
where original_image_storage_bucket is null;

-- Backfill (transformed)
update saved_looks
set transformed_image_storage_bucket = regexp_replace(transformed_image_url, '.*/object/(?:public|sign|auth)/([^/]+)/.*', '\\1'),
    transformed_image_storage_path   = regexp_replace(transformed_image_url, '.*/object/(?:public|sign|auth)/[^/]+/(.*)$', '\\1')
where transformed_image_storage_bucket is null;

-- Optionally convert URL columns to storage:// references for consistency
update saved_looks
set original_image_url = 'storage://' || original_image_storage_bucket || '/' || original_image_storage_path
where original_image_url not like 'storage://%';

update saved_looks
set transformed_image_url = 'storage://' || transformed_image_storage_bucket || '/' || transformed_image_storage_path
where transformed_image_url not like 'storage://%';
```

## Dev checklist when thumbnails look wrong
- [ ] `npm start -- --dev-client -c`
- [ ] Ensure you’re signed in (Profile shows email).
- [ ] Open My Looks and wait for remote merge.
- [ ] If still black: toggle remote‑first or temporarily bypass cache and delete `saved-looks/` dir on mount in dev (optional helper).
- [ ] If raw https URLs exist in DB, run the backfill above once.

## Files touched in this fix
- `screens/FeedScreen.tsx` – remote‑first selection, cache file validation, delete‑on‑error, spinner timing, URL refresh.
- `screens/MyLooksScreen.tsx` – URL refresh for remote/local, transformed→original fallback, delete‑on‑error.
- `lib/supabaseStorage.ts` – `getPublicUrlFor()` and URL normalization.

## Notes on unrelated changes
- RevenueCat paywall integration and profile UI changes did not gate image rendering. The black tiles originated from image source selection and cache behaviour, not entitlements or profile UI.

---

If this reappears, enable the "remote‑only" mode (ignore cache, delete `saved-looks/` once on mount) for one session to immediately validate sources, then re‑enable cache after it repopulates.

