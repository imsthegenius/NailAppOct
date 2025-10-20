import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useSelectionStore } from '../lib/selectedData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { uploadImageToSupabase, saveNailLook } from '../lib/supabaseStorage';
import { GlassToast } from '../components/ui/GlassToast';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;

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

export default function ResultsScreen({ navigation, route }: Props) {
  const { imageUri, originalImageUri, transformedBase64, originalBase64 } = route.params;
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const selectedColor = useSelectionStore((state) => state.selectedColor);
  const selectedShape = useSelectionStore((state) => state.selectedShape);
  const ensureBase64DataUrl = async (uri?: string, inline?: string | null): Promise<string | null> => {
    if (inline) {
      return inline.startsWith('data:') ? inline : `data:image/jpeg;base64,${inline}`;
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
        return `data:image/jpeg;base64,${fileBase64}`;
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
          'Please log in to save your looks.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Log In', 
              onPress: () => navigation.navigate('Login' as any)
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

      const originalUrl = await uploadImageToSupabase(
        preparedOriginal,
        userId,
        'original'
      );
      
      const transformedUrl = await uploadImageToSupabase(
        preparedTransformed,
        userId,
        'transformed'
      );
      
      if (originalUrl && transformedUrl) {
        // Save look metadata to database
        const savedLook = await saveNailLook({
          userId,
          originalImageUrl: originalUrl,
          transformedImageUrl: transformedUrl,
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
        
        if (savedLook) {
          // Persist locally so My Looks reflects the change immediately
          const stored = await AsyncStorage.getItem('savedLooks');
          const existingLooks = stored ? JSON.parse(stored) : [];
          const newLook = {
            id: savedLook.id || `${Date.now()}`,
            originalImage: originalUrl,
            transformedImage: transformedUrl,
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
          };

          await AsyncStorage.setItem(
            'savedLooks',
            JSON.stringify([newLook, ...existingLooks])
          );

          setShowToast(true);
          setIsSaving(false);
          return;
        } else {
          throw new Error('Failed to save look metadata');
        }
      } else {
        throw new Error('Failed to upload images');
      }
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
      base64: null // We'll need to handle base64 separately if needed
    }));
    
    // Navigate to Design screen to make new selections
    setTimeout(() => {
      navigation.navigate('Design' as any, {
        fromResults: true,
        photoData: {
          imageUri: originalImageUri || imageUri,
        }
      });
    }, 120);
  };

  return (
    <View style={styles.container}>
      {/* Full screen result image */}
      <Image 
        source={{ uri: imageUri }} 
        style={styles.resultImage}
        resizeMode="cover"
      />

      {/* Simple top bar with style info */}
      <SafeAreaView style={styles.topSection}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setTimeout(() => navigation.navigate('Camera'), 120);
            }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.styleInfo}>
            <View style={[styles.colorChip, { backgroundColor: selectedColor?.hex || '#FF69B4' }]} />
            <View>
              <Text style={styles.styleText}>
                {selectedColor?.name || 'Color'} • {selectedShape?.name || 'Shape'}
              </Text>
              {selectedColor?.brand ? (
                <Text style={styles.styleMeta}>
                  {selectedColor.brand}
                  {selectedColor.productLine ? ` · ${selectedColor.productLine}` : ''}
                  {selectedColor.finish ? ` · ${selectedColor.finish}` : ''}
                  {selectedColor.shadeCode ? ` · ${selectedColor.shadeCode}` : ''}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom action buttons */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="download-outline" size={24} color="white" />
                <Text style={styles.saveButtonText}>Save</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleMakeDifferentSelection}
            activeOpacity={0.8}
          >
            <Ionicons name="color-palette-outline" size={22} color="white" />
            <Text style={styles.secondaryButtonText}>Different Selection</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Glass Toast Notification */}
      <GlassToast 
        visible={showToast}
        icon="checkmark-circle"
        duration={800}
        onHide={() => {
          setShowToast(false);
          navigation.navigate('Feed' as any);
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
  resultImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  styleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  colorChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  styleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  styleMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
