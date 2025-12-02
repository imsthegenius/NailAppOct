import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  DeviceEventEmitter,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import type { MainStackParamList } from '../navigation/types';
import { useSelectionStore } from '../lib/selectedData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { uploadImageToSupabase, saveNailLook } from '../lib/supabaseStorage';
import { GlassToast } from '../components/ui/GlassToast';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useColorScheme';
import { NativeLiquidGlass } from '../components/ui/NativeLiquidGlass';
import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';
import * as Sharing from 'expo-sharing';

type ResultsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Results'>;

type Props = {
  navigation: ResultsScreenNavigationProp;
  route: {
    params: {
      imageUri: string;
      originalImageUri?: string;
      transformedBase64?: string | null;
      originalBase64?: string | null;
    };
  };
};

const { width, height } = Dimensions.get('window');

type StoredLook = {
  id: string;
  status?: 'pending' | 'synced' | 'error';
  errorMessage?: string | null;
  transformedImage: string;
  originalImage: string;
  localTransformedImage?: string | null;
  localOriginalImage?: string | null;
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
  sourceCatalog?: string | null;
  originalImageStorageBucket?: string | null;
  originalImageStoragePath?: string | null;
  transformedImageStorageBucket?: string | null;
  transformedImageStoragePath?: string | null;
};

async function mutateSavedLooks(updater: (looks: StoredLook[]) => StoredLook[]): Promise<void> {
  const raw = await AsyncStorage.getItem('savedLooks');
  const current: StoredLook[] = raw ? JSON.parse(raw) : [];
  const next = updater(current);
  await AsyncStorage.setItem('savedLooks', JSON.stringify(next));
}

export default function ResultsScreen({ navigation, route }: Props) {
  const { imageUri, originalImageUri, transformedBase64, originalBase64 } = route.params;
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const insets = useSafeAreaInsets();

  const selectedColor = useSelectionStore((state) => state.selectedColor);
  const selectedShape = useSelectionStore((state) => state.selectedShape);
  const theme = useThemeColors();
  useEffect(() => {
    if (!imageUri) {
      navigation.replace('MainTabs', { screen: 'Camera' });
    }
  }, [imageUri, navigation]);

  const accentColor = selectedColor?.hex || theme.accent;

  if (!imageUri) {
    return (
      <View style={styles.fallbackContainer}>
        <ActivityIndicator size="small" color={theme.accent} />
      </View>
    );
  }
  const ensureBase64DataUrl = async (uri?: string, inline?: string | null): Promise<string | null> => {
    const guessMime = (b64: string): string => {
      if (!b64) return 'image/jpeg';
      if (b64.startsWith('data:')) {
        const m = b64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
        return m?.[1] || 'image/jpeg';
      }
      if (b64.startsWith('/9j/')) return 'image/jpeg';
      if (b64.startsWith('iVBORw')) return 'image/png';
      if (b64.startsWith('R0lGOD')) return 'image/gif';
      if (b64.startsWith('UklGR')) return 'image/webp';
      return 'image/jpeg';
    };

    if (inline) {
      if (inline.startsWith('data:')) return inline;
      const mime = guessMime(inline);
      return `data:${mime};base64,${inline}`;
    }

    if (!uri) {
      return null;
    }

    if (uri.startsWith('data:')) {
      return uri;
    }

    if (uri.startsWith('file://')) {
      try {
        const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const mime = guessMime(fileBase64);
        return `data:${mime};base64,${fileBase64}`;
      } catch (error) {
        console.error('Failed to read file as base64:', error);
        return null;
      }
    }

    return null;
  };


  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // User must be authenticated to save
        Alert.alert(
          'Authentication Required',
          'Please sign in to save your looks.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              // Route to Profile (which contains auth entry points) to avoid navigating
              // to a non-existent Login screen that can blank out navigation.
              onPress: () => navigation.navigate('Profile')
            }
          ]
        );
        setIsSaving(false);
        return;
      }

      const userId = session.user.id;

      // Upload images to user-specific folder in Supabase storage
      const preparedTransformed = await ensureBase64DataUrl(
        imageUri,
        transformedBase64 ?? (imageUri?.startsWith('data:') ? imageUri : null)
      );

      if (!preparedTransformed) {
        throw new Error('Unable to prepare transformed image for upload');
      }

      let preparedOriginal = await ensureBase64DataUrl(
        originalImageUri,
        originalBase64 ?? (originalImageUri?.startsWith('data:') ? originalImageUri : null)
      );

      if (!preparedOriginal) {
        console.warn('Falling back to transformed image for original upload');
        preparedOriginal = preparedTransformed;
      }

      const optimisticId = `pending-${Date.now()}`;
      const optimisticLook: StoredLook = {
        id: optimisticId,
        status: 'pending',
        transformedImage: preparedTransformed,
        originalImage: preparedOriginal,
        localTransformedImage: imageUri,
        localOriginalImage: originalImageUri || imageUri,
        colorName: selectedColor?.name || 'Unknown',
        colorHex: selectedColor?.hex || '#000000',
        shapeName: selectedShape?.name || 'Unknown',
        createdAt: new Date().toISOString(),
        colorBrand: selectedColor?.brand || null,
        productLine: selectedColor?.productLine || null,
        shadeCode: selectedColor?.shadeCode || null,
        collection: selectedColor?.collection || null,
        swatchUrl: selectedColor?.swatchUrl || null,
        colorFinish: selectedColor?.finish || null,
        colorVariantId: selectedColor?.variantId || null,
        sourceCatalog: selectedColor?.sourceCatalog || null,
        originalImageStorageBucket: null,
        originalImageStoragePath: null,
        transformedImageStorageBucket: null,
        transformedImageStoragePath: null,
      };

      await mutateSavedLooks((looks) => [optimisticLook, ...looks.filter((look) => look.id !== optimisticId)]);
      DeviceEventEmitter.emit('savedLooksUpdated');

      setShowToast(true);
      setIsSaving(false);

      const finalizeSave = async () => {
        try {
          const [originalUpload, transformedUpload] = await Promise.all([
            uploadImageToSupabase(preparedOriginal, userId, 'original'),
            uploadImageToSupabase(preparedTransformed, userId, 'transformed'),
          ]);

          if (!originalUpload || !transformedUpload) {
            throw new Error('Upload returned empty response');
          }

          const savedLook = await saveNailLook({
            userId,
            originalImage: originalUpload,
            transformedImage: transformedUpload,
            colorName: selectedColor?.name || 'Unknown',
            colorHex: selectedColor?.hex || '#000000',
            shapeName: selectedShape?.name || 'Unknown',
            colorVariantId: selectedColor?.variantId || null,
            colorBrand: selectedColor?.brand || null,
            productLine: selectedColor?.productLine || null,
            shadeCode: selectedColor?.shadeCode || null,
            collection: selectedColor?.collection || null,
            swatchUrl: selectedColor?.swatchUrl || null,
            colorFinish: selectedColor?.finish || null,
            sourceCatalog: selectedColor?.sourceCatalog || null,
          });

          if (!savedLook) {
            throw new Error('Failed to save look metadata');
          }

          const syncedLook: StoredLook = {
            id: savedLook.id || `look-${Date.now()}`,
            status: 'synced',
            transformedImage: savedLook.transformed_image_url || transformedUpload.publicUrl,
            originalImage: savedLook.original_image_url || originalUpload.publicUrl,
            localTransformedImage: optimisticLook.localTransformedImage,
            localOriginalImage: optimisticLook.localOriginalImage,
            colorName: selectedColor?.name || 'Unknown',
            colorHex: selectedColor?.hex || '#000000',
            shapeName: selectedShape?.name || 'Unknown',
            createdAt: savedLook.created_at || new Date().toISOString(),
            colorBrand: selectedColor?.brand || null,
            productLine: selectedColor?.productLine || null,
            shadeCode: selectedColor?.shadeCode || null,
            collection: selectedColor?.collection || null,
            swatchUrl: selectedColor?.swatchUrl || null,
            colorFinish: selectedColor?.finish || null,
            colorVariantId: selectedColor?.variantId || null,
            sourceCatalog: selectedColor?.sourceCatalog || null,
            originalImageStorageBucket: savedLook.original_image_storage_bucket ?? originalUpload.bucket,
            originalImageStoragePath: savedLook.original_image_storage_path ?? originalUpload.path,
            transformedImageStorageBucket: savedLook.transformed_image_storage_bucket ?? transformedUpload.bucket,
            transformedImageStoragePath: savedLook.transformed_image_storage_path ?? transformedUpload.path,
          };

          await mutateSavedLooks((looks) => {
            const filtered = looks.filter((look) => look.id !== optimisticId && look.id !== syncedLook.id);
            return [syncedLook, ...filtered];
          });
        } catch (error: any) {
          console.error('Background save failed:', error);
          await mutateSavedLooks((looks) =>
            looks.map((look) =>
              look.id === optimisticId
                ? { ...look, status: 'error', errorMessage: error?.message ?? 'Failed to save' }
                : look
            )
          );
        } finally {
          DeviceEventEmitter.emit('savedLooksUpdated');
        }
      };

      finalizeSave();
      return;
    } catch (error) {
      console.error('Error saving:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
      setIsSaving(false); // Only reset on error
    }
  };

  const handleMakeDifferentSelection = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Store the original photo for reuse
    await AsyncStorage.setItem('pendingPhoto', JSON.stringify({
      imageUri: originalImageUri || imageUri,
    }));

    // Navigate to Design screen to make new selections
    setTimeout(() => {
      navigation.navigate('MainTabs', {
        screen: 'Design',
        params: {
          photoData: {
            imageUri: originalImageUri || imageUri,
          }
        }
      });
    }, 50);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        // Try sharing URL directly first
        await Share.share({
          url: imageUri,
          message: `Check out my nail look: ${selectedColor?.name || 'Custom'} • ${selectedShape?.name || 'Shape'}`,
        });
      } else if (imageUri.startsWith('file://')) {
        // For local files, use Sharing
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
        // Convert base64 to temp file
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

        // Clean up temp file
        try {
          await FileSystem.deleteAsync(tempPath, { idempotent: true });
        } catch { }
      }
    } catch (error: any) {
      if (error?.message !== 'User canceled the share') {
        console.error('Share error:', error);
        Alert.alert('Share Failed', 'Unable to share the image. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Full screen result image */}
      <Image
        source={{ uri: imageUri }}
        style={styles.resultImage}
        resizeMode="cover"
      />

      {/* Top glass bar - Figma: back button (44x44) + info capsule (horizontal layout) */}
      <SafeAreaView style={styles.topSection} edges={['top']}>
        <View style={styles.topBar}>
          {/* Back button - Figma spec: 44x44 with glass effect */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setTimeout(() => navigation.navigate('MainTabs', { screen: 'Camera' }), 120);
            }}
            activeOpacity={0.85}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <NativeLiquidGlass
              style={styles.backButtonGlass}
              intensity={70}
              tint="light"
              cornerRadius={22}
              borderWidth={0.8}
            >
              <Ionicons name="arrow-back" size={15} color="#FFFFFF" />
            </NativeLiquidGlass>
          </TouchableOpacity>

        </View>
      </SafeAreaView>

      {/* Save CTA - Figma spec: 350x57px button with glass background */}
      <View style={styles.saveSection}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          <NativeLiquidGlass
            style={styles.saveButtonGlass}
            intensity={50}
            tint="light"
            cornerRadius={20}
            borderWidth={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </NativeLiquidGlass>
        </TouchableOpacity>
      </View>

      <LiquidGlassTabBar
        activeTab="Design"
        onTabPress={(route) => {
          if (route === 'Design' || route === 'Feed') {
            navigation.navigate('MainTabs', { screen: route });
          }
        }}
        rightIcon="share-outline"
        rightIconColor="#FF1F55"
        onRightPress={handleShare}
        style={[styles.resultsTabBar, { bottom: insets.bottom + 16 }]}
      />

      {/* Glass Toast Notification */}
      <GlassToast
        visible={showToast}
        icon="checkmark-circle"
        duration={800}
        onHide={() => {
          setShowToast(false);
          navigation.navigate('MainTabs', { screen: 'Feed' });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  resultImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  // Figma spec: Top bar with back button (44x44) + info capsule
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 0,
    gap: 0,
    height: 44,
  },
  // Figma spec: Back button - 44x44px with glass effect and inset shadows
  backButton: {
    width: 44,
    height: 44,
  },
  backButtonGlass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.13)',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  // Figma spec: Save button - 350x57px centered
  saveSection: {
    position: 'absolute',
    bottom: 120,
    left: (width - 350) / 2, // Center the 350px button
    right: (width - 350) / 2,
    zIndex: 8,
    alignItems: 'center',
  },
  saveButton: {
    width: 350,
    height: 57,
  },
  saveButtonGlass: {
    width: 350,
    height: 57,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
  saveButtonText: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  resultsTabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
});
