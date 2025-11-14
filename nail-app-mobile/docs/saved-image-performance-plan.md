# Saved Image Loading: Performance & UX Plan (Expo SDK 53)

Last updated: November 12, 2025

This document summarizes the recommended approach to make saved‑image loading feel instant on first visit and reliable offline, with minimal risk and an easy rollback.

Scope: Mobile app only (`nail-app-mobile/`). No web changes.

## Recommendation

- Adopt `expo-image` for rendering, but gate behind a feature flag `EXPO_PUBLIC_USE_EXPO_IMAGE`.
- Keep existing FileSystem LRU cache for offline reliability. Use `expo-image` for fast rendering and OS‑level HTTP caching when we don’t yet have a local file.
- Improve background warming: concurrency‑limited, resume‑triggered, and battery‑aware; keep current LRU targets (80 files / 120 MB).

Why `expo-image` over `Image`:
- Smoother transitions and first paint; native decode path and built‑in caching improve perceived speed.
- Works in Expo SDK 53 without native config changes; Dev Client and OTA are fine.
- With a wrapper, we disable caching for `file://` URIs to avoid double storage and use a stable cache key for Supabase signed URLs.

## iOS/Android Implications

- No new entitlements or Info.plist/AndroidManifest changes on SDK 53.
- Works with Hermes/Fabric. No Xcode or Gradle changes beyond adding the dependency with `npx expo install`.

## Minimal Implementation (already staged)

1) Install and flag
- Install: `npx expo install expo-image`
- Optional (low‑power detection): `npx expo install expo-battery`
- Add to `.env` (template updated): `EXPO_PUBLIC_USE_EXPO_IMAGE=1` to enable

2) SmartImage wrapper
- Path: `nail-app-mobile/components/common/SmartImage.tsx`
- Behavior:
  - Uses `expo-image` when flag is on; falls back to RN `Image` otherwise
  - `cachePolicy='memory-disk'` for `https`, `cachePolicy='none'` for `file://`
  - Derives a stable `cacheKey` from Supabase bucket/path so rotated signed URLs reuse cache
  - Accepts `thumbnailUri` and `transitionDurationMs` (default ~180–220 ms)

3) Screen integration (surgical)
- Swapped only tile and preview images to `SmartImage`:
  - `nail-app-mobile/screens/FeedScreen.tsx`
  - `nail-app-mobile/screens/MyLooksScreen.tsx`
- Existing placeholder overlays and error handling are preserved.

4) Background warm improvements
- File: `nail-app-mobile/lib/savedLooksPrefetch.ts`
- Changes:
  - Concurrency limit (4 workers) for top‑N warm
  - Resume trigger: if last warm > 90 minutes, warm again when app becomes active
  - Low‑power bail (if `expo-battery` present): skip warm on Low Power Mode or <15% battery and not charging
  - LRU pruning unchanged: 80 files / 120 MB, oldest‑first by mtime

## Progressive Rendering Strategy

- Grid paints immediately from metadata in AsyncStorage; tiles show glass placeholder overlays.
- SmartImage crossfades to the image over ~180–220 ms when the first bytes land.
- Optional thumbnail‑first: if a `thumbnailUri` (or `saved_looks.thumbnail_url`) is available, pass it to SmartImage to blur/crossfade into full‑res.

## Caching Policy

- HTTP cache: `expo-image`/OS manages memory+disk; we prefetch a few above‑the‑fold URLs to warm it.
- Offline cache: keep FileSystem LRU under 80 files / 120 MB; SmartImage uses `file://` with `cachePolicy='none'` to avoid duplicate storage.
- Signed URLs: stable cacheKey derived from storage path prevents multi‑entry growth as tokens rotate.

## Safety & Edge Cases

- Signed URL rotation: URLs are refreshed from storage references (`getPublicUrlFor` / `getUserLooks`). The stable `cacheKey` keeps disk use bounded.
- 403/stale files: existing delete‑on‑error path is preserved when an image fails to load from `file://`.
- Power constraints: warm defers during Low Power Mode or low battery (if `expo-battery` installed).
- Network contention: concurrency cap (4) to avoid stalls and head‑of‑line blocking.

## Rollout & Rollback

- Rollout: set `EXPO_PUBLIC_USE_EXPO_IMAGE=1` in `.env`, rebuild Dev Client or publish OTA.
- Rollback: set flag to `0` and reload; SmartImage falls back to RN `Image`. No schema changes; prefetch changes are guarded and safe.

## Optional: Thumbnail‑First Path

Good: Add a `thumbnailUri` per row and crossfade to full URL. Two options:
- No schema change: generate on‑the‑fly variants via Supabase image transformers for public buckets and pass as `thumbnailUri`.
- Schema (optional, offline‑safe): add `thumbnail_storage_bucket/path` columns and one‑time backfill to write 240px thumbnails into storage, then resolve via `getPublicUrlFor`.

## Test Plan

- Builds: Dev Client and TestFlight OTA; no native config diffs.
- Measure (dev logs or perf markers):
  - time‑to‑grid‑first‑paint (placeholders on screen)
  - time‑to‑first‑image‑onLoad (SmartImage onLoad of first tile)
  - % tiles visible < 1.5 s on cold start (first app open)
- Scenarios:
  - Cold start → Feed first visit: above‑the‑fold tiles should crossfade < ~1.5 s
  - Subsequent visits: instant (memory or file://)
  - Offline reopen after prior warm: tiles render from `file://`
  - Battery Saver enabled: warm defers; no foreground jank

## Acceptance Checklist

- [ ] First visit grid paints instantly; above‑the‑fold images crossfade within ~1.5 s
- [ ] Subsequent visits are instant; offline revisit shows cached tiles
- [ ] Disk under 80 files / 120 MB; prune enforces limits
- [ ] No iOS/Android provisioning changes; Dev Client + OTA OK
- [ ] Safe areas/glass components unchanged; no UI regressions

## Appendix: Key Snippets

SmartImage usage (tiles):

```tsx
<SmartImage
  uri={imageUri}
  style={styles.lookImage}
  resizeMode='cover'
  transitionDurationMs={200}
  onLoad={...}
  onError={...}
/>
```

Feature flag (.env):

```
EXPO_PUBLIC_USE_EXPO_IMAGE=1
```

Prefetch concurrency and resume guard (`lib/savedLooksPrefetch.ts`):

```ts
const CONCURRENCY = 4
const RESUME_MIN_AGE_MS = 90 * 60 * 1000
```

Install commands:

```
npx expo install expo-image
# optional
npx expo install expo-battery
```
