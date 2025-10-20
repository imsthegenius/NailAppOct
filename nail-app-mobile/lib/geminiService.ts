/**
 * Gemini AI Service for Nail Transformation
 * Supports two execution modes:
 * 1. Cloudflare proxy (safe for Expo Go)
 * 2. Direct SDK call (for native dev clients / release builds)
 */

import type { GoogleGenAI } from "@google/genai";
import Constants from 'expo-constants';
import type { CanonicalFinish } from '../src/state/useSelectionStore';
import { sanitizeBase64 } from './utils/imageEncoding';
export { detectMimeType } from './utils/imageEncoding';

const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
const GEMINI_PROXY_URL = (process.env.EXPO_PUBLIC_GEMINI_PROXY_URL || '').trim().replace(/\/$/, '');
const isExpoGo = Constants.appOwnership === 'expo';

let ai: GoogleGenAI | null = null;

async function ensureClient(): Promise<GoogleGenAI> {
  if (!ai) {
    const { GoogleGenAI } = await import('@google/genai');
    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      requestOptions: {
        timeout: 30000,
      },
    });
  }
  return ai;
}

// Use shared sanitizer to keep behavior consistent across services
const cleanBase64 = sanitizeBase64;

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

const FINISH_DESCRIPTIONS: Record<CanonicalFinish, string> = {
  glossy: 'glossy — high-shine, reflective top coat',
  cream: 'cream — fully opaque, smooth coverage',
  matte: 'matte — velvety, shine-free surface',
  chrome: 'chrome — mirror-like metallic sheen',
  shimmer: 'shimmer — fine light-catching particles',
  glitter: 'glitter — dense sparkles with noticeable texture',
  metallic: 'metallic — bold foil-like shine',
  sheer: 'sheer — semi-transparent wash of colour',
  pearl: 'pearl — soft iridescent luster',
  magnetic: 'magnetic cat-eye — shifting line effect',
  reflective: 'reflective glitter — sparkles intensify under flash',
};

export type GeminiMetadata = {
  finish?: CanonicalFinish | null;
  brand?: string | null;
  productLine?: string | null;
  collection?: string | null;
  shadeCode?: string | null;
  shadeName?: string | null;
};

async function callGeminiProxy(
  imageBase64: string,
  mimeType: string,
  colorHex: string,
  colorName: string,
  shapeName: string,
  lengthName: string | undefined,
  metadata: GeminiMetadata
): Promise<string> {
  if (!GEMINI_PROXY_URL) {
    throw new Error('Gemini proxy URL is not configured');
  }

  const endpoint = GEMINI_PROXY_URL.endsWith('/transform')
    ? GEMINI_PROXY_URL
    : `${GEMINI_PROXY_URL}/transform`;

  const payload = {
    imageBase64,
    mimeType,
    colorHex,
    colorName,
    shapeName,
    lengthName,
    finish: metadata.finish ?? null,
    brand: metadata.brand ?? null,
    productLine: metadata.productLine ?? null,
    collection: metadata.collection ?? null,
    shadeCode: metadata.shadeCode ?? null,
    shadeName: metadata.shadeName ?? null,
    finishDescription: metadata.finish ? FINISH_DESCRIPTIONS[metadata.finish] : FINISH_DESCRIPTIONS.glossy,
  };

  console.log('[Gemini] Using Cloudflare proxy:', endpoint);

  // Add a 30s client-side timeout to avoid hanging requests
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`[Gemini proxy] ${response.status}: ${text}`);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('[Gemini proxy] Invalid JSON response');
  }

  if (!data?.image) {
    throw new Error('[Gemini proxy] Response missing image field');
  }

  return data.image;
}

/**
 * Transform nails using Gemini 2.5 Flash Image model
 */
export async function transformNailsWithGemini(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  colorHex: string,
  colorName: string,
  shapeName: string,
  lengthName?: string,
  metadata: GeminiMetadata = {}
): Promise<string> {
  try {
    console.log('=== GEMINI SERVICE RECEIVED ===');
    console.log('Color Hex:', colorHex);
    const isKeepCurrent = (shapeName || '').toLowerCase().includes('keep current');
    console.log('Shape:', isKeepCurrent ? 'Keep Current (no change)' : shapeName);
    console.log('Length:', lengthName || 'Medium');
    console.log('Brand:', metadata.brand || '—');
    console.log('Product line:', metadata.productLine || '—');
    console.log('Finish:', metadata.finish || '—');
    console.log('================================');

    if (!colorHex.match(/^#[0-9A-F]{6}$/i)) {
      console.warn('Invalid hex color format:', colorHex);
    }

    if (GEMINI_PROXY_URL) {
      return await callGeminiProxy(
        imageBase64,
        mimeType,
        colorHex,
        colorName,
        shapeName,
        lengthName,
        metadata
      );
    }

    if (isExpoGo) {
      throw new Error('Gemini direct SDK is unavailable in Expo Go. Configure EXPO_PUBLIC_GEMINI_PROXY_URL to use the Cloudflare worker.');
    }

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const cleaned = cleanBase64(imageBase64);

    const imageSizeKB = (cleaned.length * 0.75) / 1024;
    console.log(`Image size: ${imageSizeKB.toFixed(2)} KB`);
    if (imageSizeKB > 4096) {
      console.warn('Image is very large, may cause timeout issues');
    }

    const rgb = hexToRgb(colorHex);
    const rgbString = rgb ? `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})` : colorHex;

    const finishDescription = metadata.finish ? FINISH_DESCRIPTIONS[metadata.finish] : FINISH_DESCRIPTIONS.glossy;
    const brandLine = metadata.brand
      ? `Brand: ${metadata.brand}${metadata.productLine ? ` (${metadata.productLine})` : ''}`
      : 'Brand: salon-grade shade selected in-app';
    const collectionLine = metadata.collection ? `Collection: ${metadata.collection}` : '';
    const shadeCodeLine = metadata.shadeCode ? `Shade code: ${metadata.shadeCode}` : '';
    const shadeNameLine = metadata.shadeName ? `Shade name: ${metadata.shadeName}` : '';

    const prompt = [
      {
        text: `Transform this image following these EXACT specifications:

TASK: Apply nail polish to ONLY the fingernails.

COLOR (USE THIS EXACT COLOR - NO VARIATIONS):
- HEX: ${colorHex}
- RGB: ${rgbString}
- Apply exactly ${colorHex} to the nails
- Do NOT interpret or adjust the color
- The output nails MUST be exactly ${rgbString}

SHAPE: ${isKeepCurrent ? 'DO NOT CHANGE THE SHAPE - Keep the current nail shape as shown in the image' : shapeName}
LENGTH: ${lengthName || 'Medium'}
${shadeNameLine ? `\n${shadeNameLine}` : ''}
${shadeCodeLine ? `\n${shadeCodeLine}` : ''}
${brandLine ? `\n${brandLine}` : ''}
${collectionLine ? `\n${collectionLine}` : ''}
FINISH: ${finishDescription}

COVERAGE RULES (CRITICAL — NO GAPS):
1) Paint must cover the ENTIRE visible nail plate from cuticle edge to free edge (tip). Do not leave any bare band or "grow‑out" gap near the cuticles. Fill the regrowth area completely as if a fresh infill was done.
2) Keep edges crisp: align to the natural cuticle and sidewalls without spilling onto skin. No halo/clear crescent, no French tip unless explicitly requested.
3) Maintain 100% opaque coverage; no faded/transparent bases. Cap the free edge so the very tips aren’t lighter.

OTHER REQUIREMENTS:
4) Change ONLY the fingernails colour to ${colorHex} with ${finishDescription}.
5) Keep hand, skin, jewelry and background unchanged.
6) ${isKeepCurrent ? 'IMPORTANT: Do NOT change the nail shape - maintain the exact shape shown in the original image' : `Transform nail shape to ${shapeName}`}.
7) Adjust nail length to ${lengthName}.

Output a single edited image. Nails must be EXACTLY ${colorHex} (${rgbString}) with full cuticle‑to‑tip coverage.`
      },
      {
        inlineData: {
          mimeType,
          data: cleaned,
        },
      },
    ];

    let response;
    let retries = 2;

    while (retries > 0) {
      try {
        console.log(`Calling Gemini API (attempt ${3 - retries}/2)...`);
        const client = await ensureClient();
        response = await client.models.generateContent({
          model: "gemini-2.5-flash-image-preview",
          contents: prompt,
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('Gemini API call failed after retries:', error);
          throw error;
        }
        console.log(`API call failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Response structure:', JSON.stringify(response, null, 2).slice(0, 500));

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            console.log('Text response:', part.text);
          } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            console.log('Successfully generated transformed nail image');
            return `data:${part.inlineData.mimeType || mimeType};base64,${imageData}`;
          }
        }
      }
    }

    throw new Error('No image generated in response - check model and API configuration');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

/**
 * Mock transformation for testing / fallback
 */
export async function mockTransformNails(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  colorHex: string,
  colorName: string,
  shapeName: string,
  lengthName?: string,
  metadata: GeminiMetadata = {}
): Promise<string> {
  console.log('Mock transformation:', {
    colorName,
    shapeName,
    lengthName,
    finish: metadata.finish,
    brand: metadata.brand,
    hasImage: !!imageBase64,
    imageLength: imageBase64.length,
  });

  await new Promise(resolve => setTimeout(resolve, 3000));
  const clean = cleanBase64(imageBase64);
  return `data:${mimeType};base64,${clean}`;
}

/**
 * Helper function to detect MIME type from base64 string
 */
// detectMimeType is re-exported from utils/imageEncoding

/**
 * Check if Gemini is configured for the current environment
 */
export function isGeminiConfigured(): boolean {
  if (GEMINI_PROXY_URL) {
    return true;
  }
  return !!GEMINI_API_KEY && !isExpoGo;
}

// Re-export a getter in case we need it elsewhere
export async function getGeminiClient() {
  return ensureClient();
}
