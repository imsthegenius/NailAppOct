import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  DeviceEventEmitter,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useColorScheme';
import { supabase } from '../lib/supabase';
import { getUserLooks } from '../lib/supabaseStorage';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 2; // 2 columns with minimal spacing

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
};

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const theme = useThemeColors();
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLook, setSelectedLook] = useState<SavedLook | null>(null);

  useEffect(() => {
    loadSavedLooks();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedLooks(false);
    });
    const emitter = DeviceEventEmitter.addListener('savedLooksUpdated', () => {
      loadSavedLooks(false);
    });
    return () => {
      unsubscribe();
      emitter.remove();
    };
  }, [navigation]);

  const mapRemoteLook = useCallback((look: any): SavedLook => ({
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
  }), []);

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

  const cacheDir = `${FileSystem.cacheDirectory ?? ''}saved-looks/`;

  const isRemoteUri = (uri?: string | null) => !!uri && /^https?:/i.test(uri);

  const ensureCachedAssets = useCallback(async (looks: SavedLook[]) => {
    if (!FileSystem.cacheDirectory) return;
    try {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    } catch (error: any) {
      if (error?.code !== 'EEXIST' && __DEV__) {
        console.warn('Unable to prepare cache dir', error);
      }
    }

    const updates = new Map<string, SavedLook>();

    for (const look of looks) {
      let localTransformed = look.localTransformedImage ?? null;
      let localOriginal = look.localOriginalImage ?? null;
      let changed = false;

      if (!localTransformed && isRemoteUri(look.transformedImage)) {
        const ext = look.transformedImage.split('.').pop()?.split('?')[0] || 'jpg';
        const target = `${cacheDir}${look.id}-transformed.${ext}`;
        try {
          const info = await FileSystem.getInfoAsync(target);
          if (info.exists) {
            localTransformed = info.uri || target;
          } else {
            const { uri } = await FileSystem.downloadAsync(look.transformedImage, target);
            localTransformed = uri;
          }
          changed = true;
        } catch (error) {
          if (__DEV__) {
            console.warn('Failed to cache transformed image', look.id, error);
          }
        }
      }

      if (!localOriginal && isRemoteUri(look.originalImage)) {
        const ext = look.originalImage.split('.').pop()?.split('?')[0] || 'jpg';
        const target = `${cacheDir}${look.id}-original.${ext}`;
        try {
          const info = await FileSystem.getInfoAsync(target);
          if (info.exists) {
            localOriginal = info.uri || target;
          } else {
            const { uri } = await FileSystem.downloadAsync(look.originalImage, target);
            localOriginal = uri;
          }
          changed = true;
        } catch (error) {
          if (__DEV__) {
            console.warn('Failed to cache original image', look.id, error);
          }
        }
      }

      if (changed) {
        updates.set(look.id, {
          ...look,
          localTransformedImage: localTransformed ?? look.localTransformedImage ?? null,
          localOriginalImage: localOriginal ?? look.localOriginalImage ?? null,
        });
      }
    }

    if (updates.size) {
      const next = looks.map((look) => updates.get(look.id) ?? look);
      setSavedLooks(next);
      await AsyncStorage.setItem('savedLooks', JSON.stringify(next));
    }
  }, [cacheDir]);

  const loadSavedLooks = async (showSpinner: boolean = true) => {
    if (showSpinner) {
      setLoading(true);
    }
    try {
      const raw = await AsyncStorage.getItem('savedLooks');
      const localLooks: SavedLook[] = raw ? JSON.parse(raw) : [];
      if (localLooks.length) {
        setSavedLooks(localLooks);
        setLoading(false);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const remoteLooks = await getUserLooks(session.user.id);
        const mapped = remoteLooks.map(mapRemoteLook);
        const merged = mergeLooks(mapped, localLooks);
        setSavedLooks(merged);
        await AsyncStorage.setItem('savedLooks', JSON.stringify(merged));
        ensureCachedAssets(merged).catch(() => {});
        return;
      }

      if (!localLooks.length) {
        setSavedLooks([]);
      }
      ensureCachedAssets(localLooks).catch(() => {});
    } catch (error) {
      console.error('Error loading saved looks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Profile');
  };

  const handleLookPress = (look: SavedLook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLook(look);
  };

  const renderLookItem = ({ item, index }: { item: SavedLook; index: number }) => {
    const isLeft = index % 2 === 0;
    
    return (
      <TouchableOpacity
        style={[styles.lookItem, isLeft && styles.lookItemLeft]}
        onPress={() => handleLookPress(item)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: item.localTransformedImage ?? item.transformedImage }}
          style={styles.lookImage}
        />
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
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.createButtonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Beautiful gradient background */}
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientMiddle, theme.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
      />
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Looks</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <Ionicons name="person-circle-outline" size={32} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
          <Text style={[styles.filterTabText, styles.filterTabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Compare</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
        </View>
      ) : savedLooks.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={savedLooks}
          renderItem={renderLookItem}
          keyExtractor={item => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />
      )}
      
      {/* Floating Liquid Glass Tab Bar */}
      <LiquidGlassTabBar
        tabs={[
          { icon: 'color-palette', label: 'Design', route: 'Design' },
          { icon: 'camera', label: 'Camera', route: 'Camera' },
          { icon: 'grid', label: 'Feed', route: 'Feed' },
        ]}
        activeTab="Feed"
        onTabPress={(route) => {
          if (route === 'Camera') {
            setTimeout(() => navigation.navigate('Camera'), 120);
          } else if (route === 'Design') {
            navigation.navigate('Design');
          }
        }}
      />

      <Modal
        visible={!!selectedLook}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedLook(null)}
      >
        {selectedLook ? (
          <View style={styles.modalBackdrop}>
            <Image
              source={{ uri: selectedLook.localTransformedImage ?? selectedLook.transformedImage }}
              style={styles.modalImageFull}
              resizeMode="contain"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
              locations={[0, 1]}
              style={styles.modalGradient}
            >
              <View style={styles.modalMeta}>
                <Text style={styles.modalTitle}>{selectedLook.colorName}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedLook.colorBrand ?? 'Saved look'} • {selectedLook.shapeName}
                </Text>
                {selectedLook.status === 'pending' && (
                  <Text style={styles.modalStatus}>Uploading…</Text>
                )}
                {selectedLook.status === 'error' && (
                  <Text style={styles.modalStatusError}>Upload failed — tap save again</Text>
                )}
              </View>
            </LinearGradient>
            <SafeAreaView style={styles.modalSafeArea} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedLook(null)}
                accessibilityLabel="Close full screen preview"
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        ) : null}
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  filterTab: {
    marginRight: 20,
    paddingBottom: 5,
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF69B4',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    paddingBottom: 100, // Space for floating nav bar
  },
  lookItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.3,
    marginBottom: 2,
    marginRight: 2,
    backgroundColor: '#111',
  },
  lookItemLeft: {
    marginRight: 2,
  },
  lookImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: '#FF69B4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    position: 'relative',
  },
  modalImageFull: {
    ...StyleSheet.absoluteFillObject,
  },
  modalGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 120,
    justifyContent: 'flex-end',
  },
  modalMeta: {
    alignItems: 'flex-start',
    gap: 6,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  modalStatus: {
    marginTop: 6,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalStatusError: {
    marginTop: 6,
    color: '#ff9aa5',
    fontSize: 13,
    fontWeight: '600',
  },
  modalSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});
