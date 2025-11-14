import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'
import { InteractionManager, Image, AppState } from 'react-native'
import { getPublicUrlFor, getUserLooks } from './supabaseStorage'
import { supabase } from './supabase'

type SavedLook = {
  id: string
  originalImage: string
  transformedImage: string
  localOriginalImage?: string | null
  localTransformedImage?: string | null
  originalImageStorageBucket?: string | null
  originalImageStoragePath?: string | null
  transformedImageStorageBucket?: string | null
  transformedImageStoragePath?: string | null
  createdAt: string
}

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ''}saved-looks/`
const LAST_WARM_KEY = 'savedLooksCache:lastWarm'

const DEFAULT_MAX_FILES = 80
const DEFAULT_MAX_BYTES = 120 * 1024 * 1024
const MIN_FILE_SIZE = 256
const CONCURRENCY = 4
const RESUME_MIN_AGE_MS = 90 * 60 * 1000 // 90 minutes

async function shouldDeferForPower(): Promise<boolean> {
  // Avoid optional native module lookups unless explicitly enabled.
  // This prevents Metro from attempting to resolve a missing module and throwing
  // "Requiring unknown module <id>" on devices where expo-battery isn't installed.
  try {
    const flag = (globalThis as any)?.process?.env?.EXPO_PUBLIC_ENABLE_BATTERY_DEFER === '1'
    if (!flag) {
      return false
    }
  } catch {}
  try {
    // Optional dependency. If not installed, we don't defer.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Battery = require('expo-battery')
    const state = await Battery.getPowerStateAsync()
    const isLowPower = Boolean((state as any)?.lowPowerMode)
    const level = typeof (state as any)?.batteryLevel === 'number' ? (state as any).batteryLevel : 1
    // Defer when Low Power Mode or critically low and not charging
    const charging = (state as any)?.batteryState === Battery.BatteryState.CHARGING
    return isLowPower || (!charging && level < 0.15)
  } catch {
    return false
  }
}

async function ensureCacheDir() {
  if (!FileSystem.cacheDirectory) return
  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
  } catch (e: any) {
    if (e?.code !== 'EEXIST') {
      if (__DEV__) console.warn('[SavedLooksPrefetch] ensureCacheDir:', e)
    }
  }
}

function getExt(url: string): string {
  try {
    const noQuery = url.split('?')[0]
    const ext = noQuery.split('.').pop()
    return (ext && ext.length <= 5 ? ext : 'jpg') || 'jpg'
  } catch {
    return 'jpg'
  }
}

async function downloadIfNeeded(remoteUrl: string, target: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(target, { size: true } as any)
    const size = typeof (info as any)?.size === 'number' ? (info as any).size : 0
    if (info.exists && size > MIN_FILE_SIZE) {
      return info.uri || target
    }
    const { uri } = await FileSystem.downloadAsync(remoteUrl, target)
    return uri
  } catch (e) {
    if (__DEV__) console.warn('[SavedLooksPrefetch] download failed', target, e)
    return null
  }
}

async function pruneCache(maxFiles = DEFAULT_MAX_FILES, maxBytes = DEFAULT_MAX_BYTES) {
  try {
    const entries = await FileSystem.readDirectoryAsync(CACHE_DIR)
    if (!entries.length) return
    const files: { uri: string; size: number; mtime: number }[] = []
    for (const entry of entries) {
      const uri = `${CACHE_DIR}${entry}`
      try {
        const info = await FileSystem.getInfoAsync(uri, { size: true } as any)
        if (!info.exists) continue
        files.push({
          uri,
          size: typeof (info as any).size === 'number' ? (info as any).size : 0,
          mtime: typeof (info as any).modificationTime === 'number' ? (info as any).modificationTime : 0,
        })
      } catch {}
    }
    let total = files.reduce((s, f) => s + f.size, 0)
    if (total <= maxBytes && files.length <= maxFiles) return
    files.sort((a, b) => a.mtime - b.mtime)
    while ((total > maxBytes || files.length > maxFiles) && files.length) {
      const f = files.shift()
      if (!f) break
      try {
        await FileSystem.deleteAsync(f.uri, { idempotent: true })
        total -= f.size
      } catch {}
    }
  } catch (e) {
    if (__DEV__) console.warn('[SavedLooksPrefetch] prune failed', e)
  }
}

export async function warmSavedLooksCache(options?: { limit?: number; force?: boolean }) {
  const limit = options?.limit ?? 24
  const force = options?.force ?? false

  try {
    const now = Date.now()
    const last = Number(await AsyncStorage.getItem(LAST_WARM_KEY) || '0')
    if (!force && last && now - last < 2 * 60 * 60 * 1000) {
      return // warmed recently (<2h)
    }

    if (!force && (await shouldDeferForPower())) {
      if (__DEV__) console.log('[SavedLooksPrefetch] defer due to low power')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return

    await ensureCacheDir()

    // Load remote looks (already resolves storage:// to public/signed URLs via getUserLooks -> withResolvedUrls)
    const remote = await getUserLooks(userId)
    if (!remote?.length) {
      await AsyncStorage.setItem(LAST_WARM_KEY, String(now))
      return
    }

    // Prepare local and merge
    const rawLocal = await AsyncStorage.getItem('savedLooks')
    const local: SavedLook[] = rawLocal ? JSON.parse(rawLocal) : []
    const localById = new Map(local.map((l) => [l.id, l]))

    // Immediately persist full metadata so Feed/MyLooks can render placeholders without waiting
    const mappedAll = remote.map((look: any) => ({
      id: look.id,
      originalImage: look.original_image_url,
      transformedImage: look.transformed_image_url,
      localOriginalImage: null as string | null,
      localTransformedImage: null as string | null,
      colorName: look.color_name,
      colorHex: look.color_hex,
      shapeName: look.shape_name,
      createdAt: look.created_at,
      colorBrand: look.color_brand ?? look.color_variant?.brand ?? null,
      productLine: look.product_line ?? look.color_variant?.product_line ?? null,
      shadeCode: look.shade_code ?? look.color_variant?.shade_code ?? null,
      collection: look.collection ?? look.color_variant?.collection ?? null,
      swatchUrl: look.swatch_url ?? look.color_variant?.swatch_url ?? null,
      colorFinish: look.color_finish ?? look.color_variant?.finish_override ?? null,
      colorVariantId: look.color_variant_id ?? null,
      originalImageStorageBucket: look.original_image_storage_bucket ?? null,
      originalImageStoragePath: look.original_image_storage_path ?? null,
      transformedImageStorageBucket: look.transformed_image_storage_bucket ?? null,
      transformedImageStoragePath: look.transformed_image_storage_path ?? null,
    }))

    try {
      const sorted = [...mappedAll].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      await AsyncStorage.setItem('savedLooks', JSON.stringify(sorted))
    } catch {}

    const top = remote.slice(0, limit)
    let touched = false

    const processOne = async (look: any) => {
      const id = look.id as string
      const transformed = (look.transformed_image_url as string) || null
      const original = (look.original_image_url as string) || null
      let localTransformed: string | null = localById.get(id)?.localTransformedImage ?? null
      let localOriginal: string | null = localById.get(id)?.localOriginalImage ?? null

      if (transformed && /^https?:/i.test(transformed) && !localTransformed) {
        const tExt = getExt(transformed)
        const tTarget = `${CACHE_DIR}${id}-transformed.${tExt}`
        try { await Image.prefetch(transformed) } catch {}
        const uri = await downloadIfNeeded(transformed, tTarget)
        if (uri) { localTransformed = uri; touched = true }
      }

      if (original && /^https?:/i.test(original) && !localOriginal) {
        const oExt = getExt(original)
        const oTarget = `${CACHE_DIR}${id}-original.${oExt}`
        try { await Image.prefetch(original) } catch {}
        const uri = await downloadIfNeeded(original, oTarget)
        if (uri) { localOriginal = uri; touched = true }
      }

      if (localTransformed || localOriginal) {
        const merged: SavedLook = {
          id,
          originalImage: original || localOriginal || '',
          transformedImage: transformed || localTransformed || '',
          createdAt: (look as any).created_at || new Date().toISOString(),
          localOriginalImage: localOriginal ?? null,
          localTransformedImage: localTransformed ?? null,
        }
        localById.set(id, { ...(localById.get(id) || merged), ...merged })
      }
    }

    let idx = 0
    const workers = Array(Math.max(1, CONCURRENCY)).fill(0).map(async () => {
      while (idx < top.length) {
        const current = top[idx++]
        // eslint-disable-next-line no-await-in-loop
        await processOne(current)
      }
    })
    await Promise.all(workers)

    const merged = Array.from(localById.values())
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    await AsyncStorage.setItem('savedLooks', JSON.stringify(merged))
    if (touched) await pruneCache()

    await AsyncStorage.setItem(LAST_WARM_KEY, String(now))
  } catch (e) {
    if (__DEV__) console.warn('[SavedLooksPrefetch] warm failed', e)
  }
}

export function scheduleWarmOnAppStart() {
  // Start quickly in background; small delay to avoid first-frame contention
  setTimeout(() => {
    warmSavedLooksCache({ limit: 24 }).catch(() => {})
  }, 150)

  // Also schedule a follow-up after interactions in case the first was pre-empted
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      warmSavedLooksCache({ limit: 24 }).catch(() => {})
    }, 400)
  })

  // One-time resume listener: warm if last run is stale (>90m)
  try {
    const key = '__savedLooksResumeListenerInstalled'
    if (!(globalThis as any)[key]) {
      (globalThis as any)[key] = true
      AppState.addEventListener('change', async (state) => {
        if (state === 'active') {
          try {
            const last = Number(await AsyncStorage.getItem(LAST_WARM_KEY) || '0')
            if (!last || Date.now() - last > RESUME_MIN_AGE_MS) {
              setTimeout(() => {
                warmSavedLooksCache({ limit: 24 }).catch(() => {})
              }, 250)
            }
          } catch {}
        }
      })
    }
  } catch {}
}
