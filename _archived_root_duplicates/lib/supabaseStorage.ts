/**
 * Supabase Storage Service for Nail Images
 */

import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

/**
 * Upload image to Supabase Storage
 */
export async function uploadImageToSupabase(
  base64Image: string,
  userId: string,
  type: 'original' | 'transformed'
): Promise<string | null> {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    // Infer content type (default png)
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const contentType = mimeMatch?.[1] || 'image/png';
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = contentType.split('/')[1] || 'png';
    const filename = `${userId}/${type}_${timestamp}.${extension}`;
    
    // Convert base64 string into raw bytes (see Supabase Expo guide)
    const arrayBuffer = decode(cleanBase64);
    const bytes = new Uint8Array(arrayBuffer);
    
    // Choose bucket based on type
    const bucket = type === 'original' ? 'user-uploads' : 'transformed-images';
    
    // Upload to Supabase Storage with auth token
    let { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, bytes, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      // Fallback: try signed upload URL (helps in some proxy environments)
      try {
        const signed = await supabase.storage.from(bucket).createSignedUploadUrl(filename);
        if (signed.data?.token) {
          const signedRes = await supabase.storage
            .from(bucket)
            .uploadToSignedUrl(filename, signed.data.token, bytes, {
              contentType,
            });
          if (signedRes.error) throw signedRes.error;
        } else {
          throw error;
        }
      } catch (e: any) {
        console.error('Upload error:', error);
        console.error('Upload error details:', { bucket, filename, userId, errorMessage: error.message });
        console.error('Signed URL fallback error:', e?.message || e);
        return null;
      }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    return null;
  }
}

/**
 * Save nail transformation to database
 */
export interface SaveNailLookPayload {
  userId: string;
  originalImageUrl: string;
  transformedImageUrl: string;
  colorName: string;
  colorHex: string;
  shapeName: string;
  colorVariantId?: string | null;
  colorBrand?: string | null;
  productLine?: string | null;
  shadeCode?: string | null;
  collection?: string | null;
  swatchUrl?: string | null;
  colorFinish?: string | null;
  sourceCatalog?: string | null;
}

export async function saveNailLook({
  userId,
  originalImageUrl,
  transformedImageUrl,
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
  sourceCatalog,
}: SaveNailLookPayload) {
  try {
    const { data, error } = await supabase
      .from('saved_looks')
      .insert({
        user_id: userId,
        original_image_url: originalImageUrl,
        transformed_image_url: transformedImageUrl,
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
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving to database:', error);
    return null;
  }
}

/**
 * Get user's saved looks
 */
export async function getUserLooks(userId: string) {
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
      .order('created_at', { ascending: false });
    
    if (error) {
      if (__DEV__) {
        console.error('Error fetching looks:', error);
      }
      return [];
    }
    
    return data || [];
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting user looks:', error);
    }
    return [];
  }
}

/**
 * Delete a saved look
 */
export async function deleteLook(lookId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('saved_looks')
      .delete()
      .eq('id', lookId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting look:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting:', error);
    return false;
  }
}
