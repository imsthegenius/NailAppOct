/// <reference types="@cloudflare/workers" />

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Cache-Control': 'no-store',
};

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

function buildPrompt(colorHex, rgbString, shapeName, lengthName) {
  const isKeepCurrent = String(shapeName || '').toLowerCase().includes('keep current');
  const normalizedShape = isKeepCurrent ? 'Keep Current (no change)' : shapeName;
  return `Transform this image following these EXACT specifications:\n\nTASK: Apply nail polish to ONLY the fingernails.\n\nCOLOR (USE THIS EXACT COLOR - NO VARIATIONS):\n- HEX: ${colorHex}\n- RGB: ${rgbString}\n- Apply exactly ${colorHex} to the nails\n- Do NOT interpret or adjust the color\n- The output nails MUST be exactly ${rgbString}\n\nSHAPE: ${normalizedShape}\nLENGTH: ${lengthName || 'Medium'}\n\nCOVERAGE RULES (CRITICAL — NO GAPS):\n1) Paint must cover the ENTIRE visible nail plate from cuticle edge to free edge (tip). Do not leave any bare band or "grow‑out" gap near the cuticles. Fill the regrowth area completely as if a fresh infill was done.\n2) Keep edges crisp: align to the natural cuticle and sidewalls without spilling onto skin. No halo/clear crescent, no French tip unless explicitly requested.\n3) Maintain 100% opaque coverage; no faded/transparent bases. Cap the free edge so the very tips aren’t lighter.\n\nOTHER REQUIREMENTS:\n4) Change ONLY the fingernails colour to ${colorHex} (glossy unless otherwise specified).\n5) Keep hand, skin, jewelry and background unchanged.\n6) ${isKeepCurrent ? 'IMPORTANT: Do NOT change the nail shape - maintain the exact shape shown in the original image' : `Transform nail shape to ${shapeName}`}.\n7) Adjust nail length to ${lengthName || 'Medium'}.\n\nOutput a single edited image. Nails must be EXACTLY ${colorHex} (${rgbString}) with full cuticle‑to‑tip coverage.`;
}

function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

async function callGemini(apiKey, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), 30000);
  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status}): ${text}`);
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

function extractImageFromResponse(data, fallbackMime) {
  if (!data?.candidates?.length) {
    throw new Error('Gemini response missing candidates');
  }
  for (const candidate of data.candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part?.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || fallbackMime || 'image/jpeg';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error('Gemini response did not include an edited image');
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    }
    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY binding' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const {
      imageBase64,
      mimeType = 'image/jpeg',
      colorHex,
      colorName,
      shapeName,
      lengthName,
    } = body || {};

    if (!imageBase64 || !colorHex || !shapeName) {
      return new Response(JSON.stringify({ error: 'imageBase64, colorHex, and shapeName are required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const cleanBase64 = String(imageBase64).replace(/^data:image\/\w+;base64,/, '');
    const rgb = hexToRgb(colorHex);
    const rgbString = rgb ? `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})` : colorHex;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: buildPrompt(colorHex, rgbString, shapeName, lengthName) },
            { inlineData: { mimeType, data: cleanBase64 } },
          ],
        },
      ],
    };

    try {
      const data = await callGemini(env.GEMINI_API_KEY, payload);
      const image = extractImageFromResponse(data, mimeType);
      return new Response(
        JSON.stringify({
          image,
          model: 'gemini-2.5-flash-image-preview',
          colorHex,
          colorName,
          shapeName,
          lengthName,
          usage: data?.usageMetadata ?? null,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Gemini transformation failed', message: error instanceof Error ? error.message : String(error) }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }
  },
};

