import React, { useMemo } from 'react'
import { Image as RNImage, ImageProps as RNImageProps, Platform } from 'react-native'

type SmartImageProps = {
  uri: string
  style?: RNImageProps['style']
  resizeMode?: RNImageProps['resizeMode']
  cacheKey?: string | null
  thumbnailUri?: string | null
  transitionDurationMs?: number
  onLoad?: RNImageProps['onLoad']
  onError?: RNImageProps['onError']
  testID?: string
  accessibilityLabel?: string
}

function getEnv(key: string): string | undefined {
  try {
    const v = (globalThis as any)?.process?.env?.[key]
    return typeof v === 'string' ? v : undefined
  } catch {
    return undefined
  }
}

function deriveCacheKeyFromSupabase(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const anchor = '/storage/v1/object/'
    const idx = u.pathname.indexOf(anchor)
    if (idx === -1) return null
    const rest = u.pathname.slice(idx + anchor.length)
    const parts = rest.split('/').filter(Boolean)
    if (!parts.length) return null
    const first = parts[0]
    const offset = first === 'public' || first === 'sign' || first === 'auth' ? 1 : 0
    if (parts.length - offset < 2) return null
    const bucket = parts[offset]
    const path = parts.slice(offset + 1).join('/')
    if (!bucket || !path) return null
    return `${bucket}/${path}`
  } catch {
    return null
  }
}

export default function SmartImage({
  uri,
  style,
  resizeMode = 'cover',
  cacheKey,
  thumbnailUri,
  transitionDurationMs = 180,
  onLoad,
  onError,
  testID,
  accessibilityLabel,
}: SmartImageProps) {
  const useExpoImage = getEnv('EXPO_PUBLIC_USE_EXPO_IMAGE') === '1'

  // Derive a stable cache key from Supabase path when signed URLs rotate
  const derivedKey = useMemo(() => cacheKey || deriveCacheKeyFromSupabase(/^https?:/i.test(uri) ? uri : null), [cacheKey, uri])

  if (useExpoImage) {
    let ExpoImage: any = null
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ExpoImage = require('expo-image').Image
    } catch {
      // Module not installed; fall back below
    }

    if (ExpoImage) {
      const isFile = uri.startsWith('file://')
      const contentFit = resizeMode === 'contain' ? 'contain' : resizeMode === 'center' ? 'contain' : 'cover'
      const transition = Platform.select({
        ios: { duration: transitionDurationMs },
        android: { duration: transitionDurationMs },
        default: transitionDurationMs,
      })
      return (
        <ExpoImage
          source={{ uri }}
          style={style}
          contentFit={contentFit}
          cachePolicy={isFile ? 'none' : 'memory-disk'}
          cacheKey={derivedKey ?? undefined}
          placeholder={thumbnailUri ? [{ uri: thumbnailUri }] : undefined}
          transition={transition}
          onLoad={onLoad as any}
          onError={onError as any}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
        />
      )
    }
  }

  // Fallback to RN Image
  return (
    <RNImage
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onLoad={onLoad}
      onError={onError}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    />
  )
}

