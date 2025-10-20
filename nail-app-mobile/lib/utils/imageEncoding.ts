import { decode } from 'base64-arraybuffer'

export type NormalizedImagePayload = {
  arrayBuffer: ArrayBuffer
  contentType: string
  fileExt: string
}

/**
 * Remove data URL prefix and stray whitespace/newlines from a base64 string.
 */
export function sanitizeBase64(input: string): string {
  if (!input) return ''
  let cleaned = input
    .replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
    .replace(/\s+/g, '')

  // Convert URL-safe Base64 to standard Base64 (Gemini/workers sometimes return this)
  cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')

  // Pad to length % 4 == 0
  const pad = cleaned.length % 4
  if (pad) cleaned += '='.repeat(4 - pad)
  return cleaned
}

/**
 * Best-effort MIME detection from a base64 string. Falls back to JPEG.
 * Note: We first try to read a data URL prefix, then use base64 signatures.
 */
export function detectMimeType(base64OrDataUrl: string): string {
  if (!base64OrDataUrl) return 'image/jpeg'
  const prefixMatch = base64OrDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)
  if (prefixMatch?.[1]) return prefixMatch[1]

  const b64 = sanitizeBase64(base64OrDataUrl)
  // Common signatures (base64-encoded)
  if (b64.startsWith('/9j/')) return 'image/jpeg' // JPEG
  if (b64.startsWith('iVBORw')) return 'image/png' // PNG
  if (b64.startsWith('R0lGOD')) return 'image/gif' // GIF
  if (b64.startsWith('UklGR')) return 'image/webp' // WEBP
  // Rough HEIC/HEIF indicator — not reliably detectable via base64 prefix alone
  if (b64.includes('ftypheic') || b64.includes('ftypheif') || b64.includes('ftypmif1')) return 'image/heic'

  return 'image/jpeg'
}

export function extForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'image/heic':
    case 'image/heif':
      return 'heic'
    default:
      return 'jpg'
  }
}

/**
 * Produce a normalized binary body + metadata for Supabase uploads.
 */
export function normalizeImagePayload(base64OrDataUrl: string): NormalizedImagePayload {
  const contentType = detectMimeType(base64OrDataUrl)
  const fileExt = extForMime(contentType)
  const clean = sanitizeBase64(base64OrDataUrl)
  const arrayBuffer = decode(clean)
  return { arrayBuffer, contentType, fileExt }
}
