import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { getUserLooks } from '../../lib/supabaseStorage';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

// Define the shape of a SavedLook
export type SavedLook = {
    id: string;
    originalImage: string;
    transformedImage: string;
    localOriginalImage?: string | null;
    localTransformedImage?: string | null;
    colorName: string;
    colorHex: string;
    shapeName: string;
    createdAt: string;
    colorBrand?: string | null;
    productLine?: string | null;
    shadeCode?: string | null;
    collection?: string | null;
    swatchUrl?: string | null;
    colorFinish?: string | null;
    colorVariantId?: string | null;
    originalImageStorageBucket?: string | null;
    originalImageStoragePath?: string | null;
    transformedImageStorageBucket?: string | null;
    transformedImageStoragePath?: string | null;
    status?: 'pending' | 'synced' | 'error';
    errorMessage?: string | null;
    // New fields for filtering
    category?: string | null;
    canonicalCategory?: string | null;
};

type SavedLooksContextType = {
    savedLooks: SavedLook[];
    loading: boolean;
    refresh: () => Promise<void>;
};

const SavedLooksContext = createContext<SavedLooksContextType | undefined>(undefined);

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ''}saved-looks/`;
const MIN_FILE_SIZE = 256;

export function SavedLooksProvider({ children }: { children: React.ReactNode }) {
    const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Helper to ensure cache directory exists
    const ensureCacheDir = useCallback(async () => {
        if (!FileSystem.cacheDirectory) return;
        try {
            await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        } catch (error: any) {
            if (error?.code !== 'EEXIST' && __DEV__) {
                console.warn('Unable to prepare cache dir', error);
            }
        }
    }, []);

    // Helper to check if a URL is remote
    const isRemoteUri = (uri?: string | null) => !!uri && /^https?:/i.test(uri);

    // Helper to download image if needed
    const downloadIfNeeded = useCallback(async (remoteUrl: string, target: string): Promise<string | null> => {
        try {
            const info = await FileSystem.getInfoAsync(target, { size: true } as any);
            const size = typeof (info as any)?.size === 'number' ? (info as any).size : 0;
            if (info.exists && size > MIN_FILE_SIZE) {
                return info.uri || target;
            }
            const { uri } = await FileSystem.downloadAsync(remoteUrl, target);
            return uri;
        } catch (e) {
            if (__DEV__) console.warn('[SavedLooksContext] download failed', target, e);
            return null;
        }
    }, []);

    // Map remote look to local format
    const mapRemoteLook = useCallback((look: any): SavedLook => {
        // Extract category from nested relation (handle both 'color' alias and 'colors' table name)
        const colorObj = look.color_variant?.color ?? look.color_variant?.colors ?? null;
        const cat = colorObj?.category ?? null;
        const canonicalCat = colorObj?.canonical_category ?? null;

        return {
            id: look.id,
            originalImage: look.original_image_url,
            transformedImage: look.transformed_image_url,
            localOriginalImage: null,
            localTransformedImage: null,
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
            status: 'synced',
            errorMessage: null,
            category: cat,
            canonicalCategory: canonicalCat,
        };
    }, []);

    // Merge remote and local looks
    const mergeLooks = useCallback((remote: SavedLook[], local: SavedLook[]) => {
        const map = new Map<string, SavedLook>();
        const localById = new Map(local.map((look) => [look.id, look] as const));

        remote.forEach((remoteLook) => {
            const existing = localById.get(remoteLook.id);
            map.set(remoteLook.id, {
                ...remoteLook,
                localTransformedImage: existing?.localTransformedImage ?? remoteLook.localTransformedImage ?? null,
                localOriginalImage: existing?.localOriginalImage ?? remoteLook.localOriginalImage ?? null,
                status: existing?.status ?? remoteLook.status ?? 'synced',
                errorMessage: existing?.errorMessage ?? null,
            });
            localById.delete(remoteLook.id);
        });

        localById.forEach((look, id) => {
            if (!map.has(id)) {
                map.set(id, look);
            }
        });

        const merged = Array.from(map.values());
        merged.sort((a, b) => {
            const aPending = a.status === 'pending' || a.status === 'error';
            const bPending = b.status === 'pending' || b.status === 'error';
            if (aPending && !bPending) return -1;
            if (!aPending && bPending) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return merged;
    }, []);

    // Ensure assets are cached locally
    const ensureCachedAssets = useCallback(async (looks: SavedLook[]) => {
        await ensureCacheDir();
        const updates = new Map<string, SavedLook>();
        let touchedCache = false;

        for (const look of looks) {
            let localTransformed = look.localTransformedImage ?? null;
            let localOriginal = look.localOriginalImage ?? null;
            let changed = false;

            if (!localTransformed && isRemoteUri(look.transformedImage)) {
                const ext = look.transformedImage.split('.').pop()?.split('?')[0] || 'jpg';
                const target = `${CACHE_DIR}${look.id}-transformed.${ext}`;
                const uri = await downloadIfNeeded(look.transformedImage, target);
                if (uri) {
                    localTransformed = uri;
                    changed = true;
                    touchedCache = true;
                }
            }

            if (!localOriginal && isRemoteUri(look.originalImage)) {
                const ext = look.originalImage.split('.').pop()?.split('?')[0] || 'jpg';
                const target = `${CACHE_DIR}${look.id}-original.${ext}`;
                const uri = await downloadIfNeeded(look.originalImage, target);
                if (uri) {
                    localOriginal = uri;
                    changed = true;
                    touchedCache = true;
                }
            }

            if (changed) {
                updates.set(look.id, {
                    ...look,
                    localTransformedImage: localTransformed,
                    localOriginalImage: localOriginal,
                });
            }
        }

        if (updates.size > 0) {
            setSavedLooks((current) => {
                const next = current.map((look) => updates.get(look.id) ?? look);
                AsyncStorage.setItem('savedLooks', JSON.stringify(next)).catch(() => { });
                return next;
            });
        }
    }, [ensureCacheDir, downloadIfNeeded]);

    const loadLooks = useCallback(async () => {
        try {
            // 1. Load from AsyncStorage first for speed
            const raw = await AsyncStorage.getItem('savedLooks');
            const localLooks: SavedLook[] = raw ? JSON.parse(raw) : [];

            if (localLooks.length > 0) {
                setSavedLooks(localLooks);
                setLoading(false); // Show content immediately
            }

            // 2. Fetch from Supabase
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) {
                const remoteLooksRaw = await getUserLooks(session.user.id);
                const remoteLooks = remoteLooksRaw.map(mapRemoteLook);
                const merged = mergeLooks(remoteLooks, localLooks);

                setSavedLooks(merged);
                await AsyncStorage.setItem('savedLooks', JSON.stringify(merged));

                // 3. Background cache
                ensureCachedAssets(merged).catch(() => { });
            } else if (localLooks.length === 0) {
                setSavedLooks([]);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading saved looks:', error);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [mapRemoteLook, mergeLooks, ensureCachedAssets]);

    // Initial load
    useEffect(() => {
        loadLooks();
    }, [loadLooks]);

    // Listen for auth changes to reload
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                loadLooks();
            } else if (event === 'SIGNED_OUT') {
                setSavedLooks([]);
                AsyncStorage.removeItem('savedLooks').catch(() => { });
            }
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [loadLooks]);

    return (
        <SavedLooksContext.Provider value={{ savedLooks, loading, refresh: loadLooks }}>
            {children}
        </SavedLooksContext.Provider>
    );
}

export function useSavedLooks() {
    const context = useContext(SavedLooksContext);
    if (context === undefined) {
        throw new Error('useSavedLooks must be used within a SavedLooksProvider');
    }
    return context;
}
