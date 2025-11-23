import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  DeviceEventEmitter,
  Modal,
  BackHandler,
  Share,
  Alert,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useThemeColors } from '../hooks/useColorScheme';
import { supabase } from '../lib/supabase';
import { getUserLooks, getPublicUrlFor } from '../lib/supabaseStorage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_COLORS } from '../src/theme/colors';
import { tokens } from '../src/theme/tokens';
import SmartImage from '../components/common/SmartImage';
import type { MainTabParamList } from '../navigation/types';
import { CANONICAL_CATEGORY_ORDER, CATEGORY_METADATA } from '../lib/colorCategories';
import { runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 2; // 2 columns with minimal spacing

const CATEGORY_CARDS = [
  { id: 'All', label: 'All', swatchColor: '#D9DBE1' },
  ...CANONICAL_CATEGORY_ORDER.map((categoryId) => {
    const metadata = CATEGORY_METADATA[categoryId];
    return {
      id: categoryId,
      label: metadata.label,
      swatchColor: metadata.swatchColor,
    };
  }),
];

type SavedLook = {
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
  category?: string | null;
  canonicalCategory?: string | null;
};

import { useSavedLooks } from '../src/context/SavedLooksContext';

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const { savedLooks, loading, refresh } = useSavedLooks();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLook, setSelectedLook] = useState<SavedLook | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const [loadedImageIds, setLoadedImageIds] = useState<Record<string, boolean>>({});


  const closePreview = useCallback(() => {
    if (selectedLook) {
      void Haptics.selectionAsync();
      setSelectedLook(null);
    }
  }, [selectedLook]);
  const capsulePrimary = selectedLook?.colorName || 'Colour Title';
  const capsuleBrand =
    selectedLook?.colorBrand ||
    selectedLook?.productLine ||
    selectedLook?.collection ||
    'Brand';
  const capsuleShape = selectedLook?.shapeName || 'Category';
  const capsuleColorHex = selectedLook?.colorHex || '#FFFFFF';

  // Filtering logic
  const filteredLooks = useMemo(() => {
    if (selectedCategory === 'All') {
      return savedLooks;
    }
    return savedLooks.filter((look) => {
      const cat = look.canonicalCategory || look.category;
      if (!cat) return false;

      // Exact match
      if (cat === selectedCategory) return true;

      // Case-insensitive match
      const normalizedCat = cat.toLowerCase();
      const normalizedSelected = selectedCategory.toLowerCase();
      if (normalizedCat === normalizedSelected) return true;

      // Handle singular/plural mismatch (e.g. "Red" vs "reds")
      if (normalizedSelected.endsWith('s') && normalizedSelected.slice(0, -1) === normalizedCat) return true;
      if (normalizedCat.endsWith('s') && normalizedCat.slice(0, -1) === normalizedSelected) return true;

      return false;
    });
  }, [savedLooks, selectedCategory]);

  // Refresh on focus to ensure we have the latest data (e.g. after deleting a look)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refresh();
    });
    return unsubscribe;
  }, [navigation, refresh]);



  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.getParent()?.navigate('Profile');
  };

  const handleLookPress = (look: SavedLook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLook(look);
  };

  const selectLookImageUri = useCallback(
    (look: SavedLook) => {
      // Prefer validated local cache when present to eliminate black flicker
      const preferOriginal = failedImageIds[look.id];
      const localFirst = [
        look.localTransformedImage,
        look.localOriginalImage,
        look.transformedImage,
        look.originalImage,
      ];
      const remoteFirstPreferOriginal = [
        look.originalImage,
        look.transformedImage,
        look.localOriginalImage,
        look.localTransformedImage,
      ];
      const remoteFirst = [
        look.transformedImage,
        look.originalImage,
        look.localTransformedImage,
        look.localOriginalImage,
      ];

      const candidates = look.localTransformedImage || look.localOriginalImage
        ? localFirst
        : (preferOriginal ? remoteFirstPreferOriginal : remoteFirst);

      return candidates.find((value): value is string => Boolean(value && typeof value === 'string')) ?? '';
    },
    [failedImageIds]
  );

  const handleShare = useCallback(
    async (look: SavedLook) => {
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
            message: `Check out this nail look: ${look.colorName} • ${look.shapeName}`,
          });
          return;
        }

        if (imageUri.startsWith('file://')) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(imageUri, {
              mimeType: 'image/jpeg',
              dialogTitle: 'Share your nail look',
            });
          } else {
            Alert.alert('Sharing not available', 'Sharing is not available on this device.');
          }
          return;
        }

        if (imageUri.startsWith('data:')) {
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
          } catch { }
          return;
        }
      } catch (error: any) {
        if (error?.message !== 'User canceled the share') {
          console.error('Share error:', error);
          Alert.alert('Share Failed', 'Unable to share the image. Please try again.');
        }
      }
    },
    [selectLookImageUri]
  );

  const handleNavigateFromPreview = useCallback(
    (route: 'Design' | 'Feed') => {
      setSelectedLook(null);
      requestAnimationFrame(() => {
        if (route === 'Design') {
          navigation.jumpTo('Design');
        } else {
          navigation.jumpTo('Feed');
        }
      });
    },
    [navigation]
  );

  const markImageFailed = useCallback(async (id: string, uri?: string) => {
    try {
      if (uri && uri.startsWith('file://')) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch { }
    setFailedImageIds((current) => (current[id] ? current : { ...current, [id]: true }));
  }, []);



  useEffect(() => {
    if (!selectedLook) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closePreview();
      return true;
    });
    return () => subscription.remove();
  }, [selectedLook, closePreview]);

  const renderLookItem = ({ item, index }: { item: SavedLook; index: number }) => {
    const imageUri = selectLookImageUri(item);
    const loaded = loadedImageIds[item.id] === true;
    if (index < 2) {
      console.log('Feed imageUri', { id: item.id, imageUri: (imageUri || '').slice(0, 120) })
    }

    return (
      <TouchableOpacity
        style={styles.lookItem}
        onPress={() => handleLookPress(item)}
        activeOpacity={0.9}
      >
        {imageUri ? (
          <>
            <SmartImage
              uri={imageUri}
              style={[styles.lookImage, !loaded && { opacity: 0.01 }]}
              resizeMode="cover"
              transitionDurationMs={200}
              onError={() => markImageFailed(item.id, imageUri)}
              onLoad={() => setLoadedImageIds((s) => (s[item.id] ? s : { ...s, [item.id]: true }))}
            />
            {!loaded && (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={20} color="rgba(255,255,255,0.65)" />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.lookImage, styles.lookImageFallback]}>
            <Ionicons name="image-outline" size={24} color="rgba(255,255,255,0.6)" />
          </View>
        )}

        {item.status === 'error' && (
          <View style={styles.errorOverlay}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.errorText}>Upload failed</Text>
          </View>
        )}

        <View style={styles.lookOverlay}>
          <View style={styles.lookInfo}>
            <View style={[styles.colorDot, { backgroundColor: item.colorHex }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lookText} numberOfLines={1}>
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
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="camera-outline" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Looks Yet</Text>
      <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
        Start creating your nail looks
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.jumpTo('Camera')}
      >
        <Text style={styles.createButtonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={{ flex: 1 }}>
          {/* Beautiful gradient background */}
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientMiddle, theme.gradientEnd]}
            style={StyleSheet.absoluteFillObject}
            locations={[0, 0.5, 1]}
          />

          {/* Content */}
          {savedLooks.length > 0 || loading ? (
            <FlatList
              data={filteredLooks}
              renderItem={renderLookItem}
              keyExtractor={item => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.grid}
              initialNumToRender={12}
              windowSize={10}
              maxToRenderPerBatch={12}
              updateCellsBatchingPeriod={32}
              removeClippedSubviews
              ListHeaderComponent={
                <>
                  {/* Header - Text with gradient fill using MaskedView */}
                  <View style={styles.header}>
                    <MaskedView
                      maskElement={
                        <Text style={[styles.headerTitle, styles.headerTitleMask]}>Feed</Text>
                      }
                    >
                      <LinearGradient
                        colors={['rgba(255,161,186,1)', 'rgba(231,10,90,1)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={[styles.headerTitle, styles.headerTitleGhost]}>Feed</Text>
                      </LinearGradient>
                    </MaskedView>
                    <TouchableOpacity
                      style={styles.profileButton}
                      onPress={handleProfilePress}
                    >
                      <Ionicons name="person-circle-outline" size={26} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Category Filters - Reusing Design screen categories */}
                  <View style={styles.categoriesSection}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={CATEGORY_CARDS}
                      renderItem={({ item }) => {
                        const active = item.id === selectedCategory;
                        return (
                          <TouchableOpacity
                            style={[styles.categoryCard, active && styles.categoryCardActive]}
                            activeOpacity={0.85}
                            onPress={() => {
                              Haptics.selectionAsync();
                              setSelectedCategory(item.id);
                            }}
                          >
                            <View style={[styles.categorySwatch, { backgroundColor: item.swatchColor }]} />
                            <Text style={[styles.categoryCardLabel, active && styles.categoryCardLabelActive]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={styles.categoriesList}
                    />
                  </View>
                </>
              }
            />
          ) : (
            <EmptyState />
          )}

          {/* Floating Liquid Glass Tab Bar */}
          <LiquidGlassTabBar
            activeTab="Feed"
            onTabPress={(route) => {
              if (route === 'Design') navigation.jumpTo('Design');
            }}
            onCameraPress={() => navigation.jumpTo('Camera')}
          />

          <Modal
            visible={!!selectedLook}
            animationType="fade"
            transparent
            onRequestClose={closePreview}
          >
            {selectedLook
              ? (() => {
                const previewUri = selectLookImageUri(selectedLook);
                return (
                  <View style={styles.previewContainer}>
                    {previewUri ? (
                      <SmartImage
                        uri={previewUri}
                        style={styles.previewImage}
                        resizeMode="cover"
                        transitionDurationMs={220}
                        onError={() => markImageFailed(selectedLook.id, previewUri)}
                      />
                    ) : (
                      <View style={[styles.previewImage, styles.previewImageFallback]}>
                        <Ionicons name="image-outline" size={42} color="rgba(255,255,255,0.7)" />
                      </View>
                    )}

                    <View
                      style={[styles.previewTopSection, { paddingTop: insets.top + 12 }]}
                      pointerEvents="box-none"
                    >
                      <View style={styles.previewTopBar}>
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={closePreview}
                          activeOpacity={0.85}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                          <View style={styles.closeButtonGlass}>
                            <Ionicons name="close" size={15} color="#FFFFFF" />
                          </View>
                        </TouchableOpacity>

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

                      {(selectedLook.status === 'pending' || selectedLook.status === 'error') && (
                        <View
                          style={[
                            styles.previewStatusBadge,
                            selectedLook.status === 'error' && styles.previewStatusBadgeError,
                          ]}
                        >
                          <Text style={styles.previewStatusText}>
                            {selectedLook.status === 'pending'
                              ? 'Uploading…'
                              : 'Upload failed — tap save again'}
                          </Text>
                        </View>
                      )}
                    </View>

                    <LiquidGlassTabBar
                      activeTab="Design"
                      onTabPress={(route) => handleNavigateFromPreview(route)}
                      rightIcon="share-outline"
                      rightIconColor="#FF1F55"
                      onRightPress={() => handleShare(selectedLook)}
                      style={[styles.previewTabBar, { bottom: insets.bottom + 16 }]}
                    />
                  </View>
                );
              })()
              : null}
          </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.page,
    paddingTop: 5,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 41,
  },
  headerTitleMask: {
    backgroundColor: 'transparent',
  },
  headerTitleGhost: {
    opacity: 0, // Invisible text to provide gradient dimensions
  },
  profileButton: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Categories section - matching Design screen
  categoriesSection: {
    paddingTop: 14,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F1F1F',
    paddingHorizontal: tokens.spacing.page,
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: tokens.spacing.page,
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 64,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  categoryCardActive: {
    backgroundColor: 'rgba(255, 155, 197, 0.15)',
  },
  categorySwatch: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(31,31,31,0.65)',
    textAlign: 'center',
  },
  categoryCardLabelActive: {
    color: '#E70A5A',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    paddingBottom: 100, // Space for floating nav bar
    paddingHorizontal: 2,
  },
  columnWrapper: {
    gap: 4, // Add space between columns
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  lookItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.3,
    backgroundColor: '#111',
  },
  lookItemLeft: {
    // Removed - no longer needed with columnWrapper
  },
  lookImage: {
    width: '100%',
    height: '100%',
  },
  lookImageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  errorOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(231,10,90,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  errorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  lookOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  lookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lookText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
  },
  lookMeta: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
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
    color: '#FFF',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: BRAND_COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  previewImageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  previewTopSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  previewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
    width: '100%',
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
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  previewMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
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
  previewStatusBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignSelf: 'center',
  },
  previewStatusBadgeError: {
    backgroundColor: 'rgba(231,10,90,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(231,10,90,0.65)',
  },
  previewStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  previewTabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});
