import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { getUserLooks, getPublicUrlFor } from '../lib/supabaseStorage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import SmartImage from '../components/common/SmartImage';
import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

type MyLooksScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyLooks'>;

type Props = {
  navigation: MyLooksScreenNavigationProp;
};

type SavedLook = {
  id: string;
  originalImage: string;
  transformedImage: string;
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
};

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 40 - 8) / 3; // 3 columns with spacing

export default function MyLooksScreen({ navigation }: Props) {
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLook, setPreviewLook] = useState<SavedLook | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const [loadedImageIds, setLoadedImageIds] = useState<Record<string, boolean>>({});
  const insets = useSafeAreaInsets();
  const capsulePrimary = previewLook?.colorName || 'Colour Title';
  const capsuleBrand =
    previewLook?.colorBrand ||
    previewLook?.productLine ||
    previewLook?.collection ||
    'Brand';
  const capsuleShape = previewLook?.shapeName || 'Category';
  const capsuleColorHex = previewLook?.colorHex || '#FFFFFF';

  useEffect(() => {
    loadSavedLooks();
  }, []);

  useEffect(() => {
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedLooks();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSavedLooks = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('MyLooks session user:', session?.user?.id || null)
      // Helper to refresh signed/public URLs using stored storage references
      const refreshUrls = async (looks: SavedLook[]): Promise<SavedLook[]> => {
        const refreshed = await Promise.all(
          looks.map(async (look) => {
            const freshTransformed = await getPublicUrlFor(
              look.transformedImageStorageBucket,
              look.transformedImageStoragePath,
            );
            const freshOriginal = await getPublicUrlFor(
              look.originalImageStorageBucket,
              look.originalImageStoragePath,
            );
            if (freshTransformed || freshOriginal) {
              return {
                ...look,
                transformedImage: freshTransformed || look.transformedImage,
                originalImage: freshOriginal || look.originalImage,
              };
            }
            return look;
          })
        );
        return refreshed;
      };
      if (session?.user?.id) {
        const remoteLooks = await getUserLooks(session.user.id);
        if (remoteLooks && remoteLooks.length) {
          // Resolve fresh public URLs from storage references to avoid expired links
          const withFreshUrls = await Promise.all(
            remoteLooks.map(async (look: any) => {
              const freshTransformed = await getPublicUrlFor(
                look.transformed_image_storage_bucket,
                look.transformed_image_storage_path,
                look.transformed_image_url,
              );
              const freshOriginal = await getPublicUrlFor(
                look.original_image_storage_bucket,
                look.original_image_storage_path,
                look.original_image_url,
              );
              return {
                ...look,
                transformed_image_url: freshTransformed || look.transformed_image_url,
                original_image_url: freshOriginal || look.original_image_url,
              };
            })
          );

          const mapped: SavedLook[] = withFreshUrls.map((look: any) => ({
            id: look.id,
            originalImage: look.original_image_url,
            transformedImage: look.transformed_image_url,
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
          }));
          const updated = await refreshUrls(mapped)
          console.log('MyLooks loaded counts:', { remote: updated.length, local: 0 })
          console.log('MyLooks sample URLs:', updated.slice(0, 2).map((l) => ({ id: l.id, transformed: (l.transformedImage || '').toString().slice(0, 120), original: (l.originalImage || '').toString().slice(0, 120) })))
          setSavedLooks(updated)
          await AsyncStorage.setItem('savedLooks', JSON.stringify(updated))
          // Warm cache for first few images to reduce initial black-to-image transition
          try {
            const toPrefetch = updated
              .map((l) => l.transformedImage || l.originalImage)
              .filter((u): u is string => !!u && /^https?:/i.test(u))
              .slice(0, 9)
            await Promise.all(toPrefetch.map((u) => Image.prefetch(u)))
          } catch {}
          return;
        }
      }

      const saved = await AsyncStorage.getItem('savedLooks');
      if (saved) {
        const local: SavedLook[] = JSON.parse(saved);
        const updated = await refreshUrls(local);
        console.log('MyLooks loaded counts:', { remote: 0, local: updated.length })
        console.log('MyLooks sample URLs:', updated.slice(0, 2).map((l) => ({ id: l.id, transformed: (l.transformedImage || '').toString().slice(0, 120), original: (l.originalImage || '').toString().slice(0, 120) })))
        setSavedLooks(updated);
        await AsyncStorage.setItem('savedLooks', JSON.stringify(updated));
      } else {
        console.log('MyLooks loaded counts:', { remote: 0, local: 0 })
        setSavedLooks([]);
      }
    } catch (error) {
      console.error('Error loading saved looks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLook = (look: SavedLook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewLook(look);
  };

  const markImageFailed = useCallback(async (id: string, uri?: string) => {
    try {
      if (uri && uri.startsWith('file://')) {
        const fs = await import('expo-file-system');
        await fs.deleteAsync(uri, { idempotent: true });
      }
    } catch {}
    setFailedImageIds((current) => (current[id] ? current : { ...current, [id]: true }));
  }, []);

  const handleDeleteLook = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Look',
      'Are you sure you want to delete this look?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user?.id) {
                await supabase.from('saved_looks').delete().eq('id', id).eq('user_id', session.user.id);
              }
              const updatedLooks = savedLooks.filter(l => l.id !== id);
              await AsyncStorage.setItem('savedLooks', JSON.stringify(updatedLooks));
              setSavedLooks(updatedLooks);
              setPreviewLook((current) => (current?.id === id ? null : current));
            } catch (error) {
              console.error('Error deleting look:', error);
              Alert.alert('Error', 'Failed to delete look. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShare = async (look: SavedLook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const imageUri = selectLookImageUri(look);
    if (!imageUri) {
      Alert.alert('Share Failed', 'No image available to share.');
      return;
    }
    
    try {
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        await Share.share({
          url: imageUri,
          message: `Check out my nail look: ${look.colorName} • ${look.shapeName}`,
        });
      } else if (imageUri.startsWith('file://')) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(imageUri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Share your nail look',
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device.');
        }
      } else if (imageUri.startsWith('data:')) {
        const base64Data = imageUri.split(',')[1];
        const tempPath = `${FileSystem.cacheDirectory}share-temp-${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(tempPath, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(tempPath, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Share your nail look',
          });
        }
        
        try {
          await FileSystem.deleteAsync(tempPath, { idempotent: true });
        } catch {}
      }
    } catch (error: any) {
      if (error?.message !== 'User canceled the share') {
        console.error('Share error:', error);
        Alert.alert('Share Failed', 'Unable to share the image. Please try again.');
      }
    }
  };

  const handleNavigateFromPreview = useCallback(
    (route: 'Design' | 'Feed') => {
      setPreviewLook(null);
      requestAnimationFrame(() => {
        navigation.navigate('Main', { screen: route });
      });
    },
    [navigation]
  );

  const selectLookImageUri = useCallback(
    (look: SavedLook) => {
      const preferOriginal = failedImageIds[look.id]
      const candidates = preferOriginal
        ? [look.originalImage, look.transformedImage]
        : [look.transformedImage, look.originalImage]
      return candidates.find((u) => !!u && typeof u === 'string') || ''
    },
    [failedImageIds]
  )

  const renderLookItem = ({ item }: { item: SavedLook }) => {
    const imageUri = selectLookImageUri(item);
    const loaded = loadedImageIds[item.id] === true;
    return (
      <TouchableOpacity
        style={styles.lookItem}
        onPress={() => handleViewLook(item)}
        onLongPress={() => handleDeleteLook(item.id)}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <>
            <SmartImage
              uri={imageUri}
              style={[styles.lookImage, !loaded && { opacity: 0.01 }]}
              transitionDurationMs={200}
              onError={() => markImageFailed(item.id, imageUri)}
              onLoad={() => setLoadedImageIds((s) => (s[item.id] ? s : { ...s, [item.id]: true }))}
            />
            {!loaded && (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={18} color="#AAA" />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.lookImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }]}>
            <Ionicons name="image-outline" size={20} color="#AAA" />
          </View>
        )}
        {/* Look info */}
        <View style={styles.lookInfo}>
          <View style={[styles.colorIndicator, { backgroundColor: item.colorHex }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.lookLabel} numberOfLines={1}>
              {item.colorName}
            </Text>
            {item.colorBrand ? (
              <Text style={styles.lookMeta} numberOfLines={1}>
                {item.colorBrand}
                {item.productLine ? ` · ${item.productLine}` : ''}
                {item.shadeCode ? ` · ${item.shadeCode}` : ''}
              </Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.shapeLabel} numberOfLines={1}>{item.shapeName}</Text>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={64} color="#CCC" />
      <Text style={styles.emptyStateTitle}>No Saved Looks Yet</Text>
      <Text style={styles.emptyStateText}>
        Your saved nail transformations will appear here
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('Main', { screen: 'Design' })}
      >
        <Text style={styles.emptyStateButtonText}>Create Your First Look</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#2A0B20', '#E70A5A']}
        start={{ x: 0.1, y: 0.9 }}
        end={{ x: 0.9, y: 0.1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Looks</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subheading}>Everything you’ve saved lives here. Tap a look to preview it full screen.</Text>

        {savedLooks.length > 0 ? (
          <FlatList
            data={savedLooks}
            renderItem={renderLookItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.gridSpacer} />}
            initialNumToRender={15}
            windowSize={10}
            maxToRenderPerBatch={15}
            updateCellsBatchingPeriod={32}
            removeClippedSubviews
          />
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <EmptyState />
        )}

        {savedLooks.length > 0 && (
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>{savedLooks.length} saved looks</Text>
          </View>
        )}
      </View>

      <Modal visible={!!previewLook} transparent animationType="fade">
        {previewLook ? (
          <View style={styles.previewContainer}>
            {/* Full-bleed preview image */}
            <SmartImage 
              uri={selectLookImageUri(previewLook)} 
              style={styles.previewImage} 
              resizeMode="cover"
              transitionDurationMs={220} 
            />

            {/* Top glass info bar with close button - Figma spec */}
            <View
              style={[styles.previewTopSection, { paddingTop: insets.top + 12 }]}
              pointerEvents="box-none"
            >
              <View style={styles.previewTopBar}>
                {/* Back button - Figma: 44x44px circular glass */}
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setPreviewLook(null)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <View style={styles.closeButtonGlass}>
                    <Ionicons name="close" size={15} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                
                {/* Info capsule - horizontal layout */}
                <View style={styles.previewCapsuleWrapper}>
                  <View style={styles.previewGlassCapsule}>
                    <View style={styles.previewCapsuleRow}>
                      <View style={styles.previewCapsuleTextRow}>
                        <Text style={[styles.previewTitle, styles.previewCapsulePrimary]} numberOfLines={1}>
                          {capsulePrimary}
                        </Text>
                        <Text style={styles.previewMeta} numberOfLines={1}>
                          {capsuleBrand}
                        </Text>
                        <Text style={styles.previewMeta} numberOfLines={1}>
                          {capsuleShape}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.previewTopBarFiller} />
              </View>
            </View>

            <LiquidGlassTabBar
              activeTab="Design"
              onTabPress={(route) => handleNavigateFromPreview(route)}
              rightIcon="share-outline"
              rightIconColor="#FF1F55"
              onRightPress={previewLook ? () => handleShare(previewLook) : undefined}
              style={[styles.previewTabBar, { bottom: insets.bottom + 16 }]}
            />
          </View>
        ) : null}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  subheading: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    paddingBottom: 24,
  },
  gridSpacer: {
    height: 12,
  },
  lookItem: {
    width: ITEM_SIZE,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  lookImage: {
    width: '100%',
    height: ITEM_SIZE * 1.3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  lookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  lookLabel: {
    fontSize: 12,
    color: '#fff',
    flex: 1,
  },
  lookMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  shapeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  emptyStateButtonText: {
    color: '#2A0B20',
    fontSize: 16,
    fontWeight: '600',
  },
  statsBar: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statsText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    position: 'absolute',
    width: width,
    height: '100%',
    top: 0,
    left: 0,
  },
  // Figma spec: Top bar with back button + info capsule
  previewTopSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  previewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
  },
  closeButton: {
    width: 44,
    height: 44,
  },
  closeButtonGlass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    shadowColor: 'rgba(0,0,0,0.13)',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  previewCapsuleWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 12,
  },
  previewGlassCapsule: {
    width: 321,
    maxWidth: '100%',
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    shadowColor: 'rgba(0,0,0,0.13)',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 1,
    shadowRadius: 9,
  },
  previewCapsuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    columnGap: 12,
  },
  previewCapsuleTextRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 32,
  },
  previewColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  previewTitle: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  previewMeta: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  previewCapsulePrimary: {
    letterSpacing: 0.1,
  },
  previewTopBarFiller: {
    width: 44,
    height: 44,
  },
  previewTabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
});
