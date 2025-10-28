/**
 * Supabase Storage Service for Nail Images
 */

import { decode } from 'base64-arraybuffer'
import { supabase, supabaseStorage, syncStorageAuth } from './supabase'
import { SUPABASE_STORAGE_URL } from './supabaseConfig'
import { normalizeImagePayload, sanitizeBase64 } from './utils/imageEncoding'

const STORAGE_REFERENCE_PREFIX = 'storage://'
const PUBLIC_BUCKETS = new Set(['transformed-images', 'avatars', 'collection-covers'])

export interface StorageUploadResult {
  bucket: string
  path: string
  publicUrl: string
}

interface StorageReference {
  bucket: string
  path: string
}

type SavedLookRecord = {
  id: string
  original_image_url: string
  transformed_image_url: string
  [key: string]: any
}

type ResolvedSavedLook<T extends SavedLookRecord = SavedLookRecord> = T & {
  original_image_url: string
  transformed_image_url: string
  original_image_storage_bucket: string | null
  original_image_storage_path: string | null
  transformed_image_storage_bucket: string | null
  transformed_image_storage_path: string | null
}

const preferredStorageHost = safeExtractHost(SUPABASE_STORAGE_URL)
const preferredStorageProtocol = safeExtractProtocol(SUPABASE_STORAGE_URL)

function safeExtractHost(url: string | null | undefined) {
  try {
    if (!url) return null
    return new URL(url).host
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to parse storage URL host', error)
    }
    return null
  }
}

function safeExtractProtocol(url: string | null | undefined) {
  try {
    if (!url) return null
    return new URL(url).protocol
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to parse storage URL protocol', error)
    }
    return null
  }
}

function normalisePublicUrl(url: string | null | undefined) {
  if (!url) return ''

  if (!preferredStorageHost) {
    return url
  }

  try {
    const parsed = new URL(url)
    if (parsed.host !== preferredStorageHost) {
      parsed.host = preferredStorageHost
      if (preferredStorageProtocol) {
        parsed.protocol = preferredStorageProtocol
      }
      return parsed.toString()
    }
    return url
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to normalise storage URL', { url, error })
    }
    return url
  }
}

function createStorageReference(upload: StorageUploadResult): string {
  return `${STORAGE_REFERENCE_PREFIX}${upload.bucket}/${upload.path}`
}

function parseStorageReference(value?: string | null): StorageReference | null {
  if (!value || !value.startsWith(STORAGE_REFERENCE_PREFIX)) {
    return null
  }

  const withoutPrefix = value.slice(STORAGE_REFERENCE_PREFIX.length)
  const segments = withoutPrefix.split('/')
  const bucket = segments.shift()
  const path = segments.join('/')

  if (!bucket || !path) {
    return null
  }

  return { bucket, path }
}

async function generatePublicUrl(bucket: string, path: string): Promise<string> {
  if (!path) {
    return ''
  }

  if (PUBLIC_BUCKETS.has(bucket)) {
    const {
      data: { publicUrl }
    } = supabaseStorage.storage.from(bucket).getPublicUrl(path)
    return normalisePublicUrl(publicUrl)
  }

  await syncStorageAuth()
  const { data, error } = await supabaseStorage.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 30)

  if (error) {
    throw error
  }

  return normalisePublicUrl(data?.signedUrl)
}

function tryParseBucketPathFromUrl(url?: string | null): { bucket: string; path: string } | null {
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
    return { bucket, path }
  } catch {
    return null
  }
}

export async function getPublicUrlFor(
  bucket?: string | null,
  path?: string | null,
  existingUrl?: string | null,
): Promise<string | null> {
  try {
    if (!bucket || !path) {
      const parsed = tryParseBucketPathFromUrl(existingUrl)
      if (!parsed) return null
      bucket = parsed.bucket
      path = parsed.path
    }
    const url = await generatePublicUrl(bucket!, path!)
    return url || null
  } catch (e) {
    if (__DEV__) {
      console.warn('Failed to resolve public URL for storage object', { bucket, path, error: (e as any)?.message || e })
    }
    return null
  }
}

async function resolveStorageUrl(value?: string | null): Promise<string> {
  const reference = parseStorageReference(value)

  if (!reference) {
    return value || ''
  }

  try {
    const publicUrl = await generatePublicUrl(reference.bucket, reference.path)
    return publicUrl || ''
  } catch (error) {
    console.error('Failed to resolve storage reference', {
      reference,
      error
    })
    return value || ''
  }
}

async function withResolvedUrls<T extends SavedLookRecord>(look: T): Promise<ResolvedSavedLook<T>> {
  const referenceA = parseStorageReference(look.original_image_url)
  const referenceB = parseStorageReference(look.transformed_image_url)

  const [originalUrl, transformedUrl] = await Promise.all([
    resolveStorageUrl(look.original_image_url),
    resolveStorageUrl(look.transformed_image_url)
  ])

  return {
    ...look,
    original_image_url: originalUrl,
    transformed_image_url: transformedUrl,
    original_image_storage_bucket: referenceA?.bucket ?? null,
    original_image_storage_path: referenceA?.path ?? null,
    transformed_image_storage_bucket: referenceB?.bucket ?? null,
    transformed_image_storage_path: referenceB?.path ?? null
  }
}

async function removeStorageObjects(references: (StorageReference | null)[]) {
  const filtered = references.filter((ref): ref is StorageReference => Boolean(ref))

  await Promise.all(
    filtered.map(async (ref) => {
      await syncStorageAuth()
      const { error } = await supabaseStorage.storage.from(ref.bucket).remove([ref.path])
      if (error && __DEV__) {
        console.error('Failed to remove storage object', {
          bucket: ref.bucket,
          path: ref.path,
          error
        })
      }
    })
  )
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImageToSupabase(
  base64Image: string,
  userId: string,
  type: 'original' | 'transformed'
): Promise<StorageUploadResult | null> {
  try {
    await syncStorageAuth()
    // Normalize payload and ensure contentType/extension alignment
    const { arrayBuffer, contentType, fileExt } = normalizeImagePayload(base64Image)
    const preview = sanitizeBase64(base64Image).slice(0, 8)
    console.log('[Storage] Upload payload:', { contentType, fileExt, magic: preview })

    const timestamp = Date.now()
    const filename = `${userId}/${type}_${timestamp}.${fileExt}`

    // Per Supabase RN docs, pass ArrayBuffer directly (not Uint8Array)
    // https://supabase.com/docs/reference/javascript/storage-from-upload

    const bucket = type === 'original' ? 'user-uploads' : 'transformed-images'

    const { error } = await supabaseStorage.storage
      .from(bucket)
      .upload(filename, arrayBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      try {
        const signed = await supabaseStorage.storage.from(bucket).createSignedUploadUrl(filename)
        if (signed.data?.token) {
          const uploadResponse = await supabaseStorage.storage
            .from(bucket)
            .uploadToSignedUrl(signed.data.path ?? filename, signed.data.token, arrayBuffer, {
              contentType
            })

          if (uploadResponse.error) {
            throw uploadResponse.error
          }
        } else {
          throw error
        }
      } catch (uploadError: any) {
        console.error('Upload error:', error)
        console.error('Upload error details:', {
          bucket,
          filename,
          userId,
          errorMessage: error.message
        })
        console.error('Signed URL fallback error:', uploadError?.message || uploadError)
        return null
      }
    }

    const publicUrl = await generatePublicUrl(bucket, filename)

    return {
      bucket,
      path: filename,
      publicUrl
    }
  } catch (error) {
    console.error('Error uploading to Supabase:', error)
    return null
  }
}

/**
 * Save nail transformation to database
 */
export interface SaveNailLookPayload {
  userId: string
  originalImage: StorageUploadResult
  transformedImage: StorageUploadResult
  colorName: string
  colorHex: string
  shapeName: string
  colorVariantId?: string | null
  colorBrand?: string | null
  productLine?: string | null
  shadeCode?: string | null
  collection?: string | null
  swatchUrl?: string | null
  colorFinish?: string | null
  sourceCatalog?: string | null
}

export async function saveNailLook({
  userId,
  originalImage,
  transformedImage,
  colorName,
  colorHex,
  shapeName,
  colorVariantId,
  colorBrand,
  productLine,
  shadeCode,
  collection,
  swatchUrl,
  colorFinish,
  sourceCatalog
}: SaveNailLookPayload): Promise<ResolvedSavedLook | null> {
  try {
    const { data, error } = await supabase
      .from('saved_looks')
      .insert({
        user_id: userId,
        original_image_url: createStorageReference(originalImage),
        transformed_image_url: createStorageReference(transformedImage),
        color_name: colorName,
        color_hex: colorHex,
        shape_name: shapeName,
        color_variant_id: colorVariantId ?? null,
        color_brand: colorBrand ?? null,
        product_line: productLine ?? null,
        shade_code: shadeCode ?? null,
        collection: collection ?? null,
        swatch_url: swatchUrl ?? null,
        color_finish: colorFinish ?? null,
        source_catalog: sourceCatalog ?? null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return null
    }

    return await withResolvedUrls(data as SavedLookRecord)
  } catch (error) {
    console.error('Error saving to database:', error)
    return null
  }
}

/**
 * Get user's saved looks
 */
export async function getUserLooks(userId: string): Promise<ResolvedSavedLook[]> {
  try {
    const { data, error } = await supabase
      .from('saved_looks')
      .select(`
        *,
        color_variant:color_variants(
          brand,
          product_line,
          shade_name,
          shade_code,
          collection,
          finish_override,
          swatch_url,
          source_catalog
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      if (__DEV__) {
        console.error('Error fetching looks:', error)
      }
      return []
    }

    const looks = data as SavedLookRecord[] | null
    if (!looks || looks.length === 0) {
      return []
    }

    return Promise.all(looks.map((look) => withResolvedUrls(look)))
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting user looks:', error)
    }
    return []
  }
}

/**
 * Delete a saved look
 */
export async function deleteLook(lookId: string, userId: string) {
  try {
    const { data: existing } = await supabase
      .from('saved_looks')
      .select('original_image_url, transformed_image_url')
      .eq('id', lookId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      await removeStorageObjects([
        parseStorageReference(existing.original_image_url),
        parseStorageReference(existing.transformed_image_url)
      ])
    }

    const { error } = await supabase
      .from('saved_looks')
      .delete()
      .eq('id', lookId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting look:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting:', error)
    return false
  }
}
