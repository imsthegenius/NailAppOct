import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useIsFocused } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';
import { GlassmorphicView } from '../components/ui/GlassmorphicView';
import { NativeLiquidGlass } from '../components/ui/NativeLiquidGlass';
import { useSelectionStore } from '../lib/selectedData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

type Props = {
  navigation: CameraScreenNavigationProp;
};

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [tabBarCollapsed, setTabBarCollapsed] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasLaidOut, setHasLaidOut] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const hideTabBarTimer = useRef<NodeJS.Timeout>();
  const hasLaidOutRef = useRef(false);
  const isFocused = useIsFocused();

  const selectedColor = useSelectionStore((state) => state.selectedColor);
  const selectedShape = useSelectionStore((state) => state.selectedShape);
  const selectedLength = useSelectionStore((state) => state.selectedLength);

  const shouldRenderCamera = Boolean(permission?.granted && isFocused && hasLaidOut);

  // Debug log on mount
  useEffect(() => {
    console.log('CameraScreen mounted');
    console.log('Current selected color:', selectedColor);
    console.log('Current selected shape:', selectedShape);
    console.log('Current selected length:', selectedLength);
    
    return () => {
      console.log('CameraScreen unmounting');
    };
  }, []);

  // Auto-request camera permission on first mount if not determined
  useEffect(() => {
    if (!permission) {
      // Fire and forget; the UI will update based on response
      requestPermission().catch(() => {});
    }
  }, [permission, requestPermission]);

  // Auto-hide tab bar when capturing
  useEffect(() => {
    if (isCapturing) {
      setTabBarCollapsed(true);
      hideTabBarTimer.current = setTimeout(() => {
        setTabBarCollapsed(false);
      }, 3000);
    }
    return () => {
      if (hideTabBarTimer.current) {
        clearTimeout(hideTabBarTimer.current);
      }
    };
  }, [isCapturing]);

  useEffect(() => {
    if (!shouldRenderCamera && isCameraReady) {
      setIsCameraReady(false);
    }
  }, [shouldRenderCamera, isCameraReady]);

  const handleLayout = useCallback(() => {
    if (!hasLaidOutRef.current) {
      hasLaidOutRef.current = true;
      setHasLaidOut(true);
    }
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          // Slightly reduced quality to speed up upload + processing
          quality: 0.65,
          base64: true,
          // iOS optimisation to skip extra post-processing for speed
          skipProcessing: Platform.OS === 'ios',
        });
        
        if (photo) {
          // Check if color and nail customization are already selected
          if (selectedColor && selectedShape) {
            // Add delay to prevent race condition crash
            setTimeout(() => {
              navigation.navigate('Processing' as any, { 
                imageUri: photo.uri,
                base64: photo.base64 
              });
            }, 50);
          } else {
            // Store photo for later use and navigate to Design screen
            await AsyncStorage.setItem('pendingPhoto', JSON.stringify({
              imageUri: photo.uri,
              base64: photo.base64
            }));
            
            Alert.alert(
              'Customize Your Look',
              'Select your nail color and shape',
              [
                {
                  text: 'Choose Design',
                  onPress: () => {
                    // Add delay to prevent crash
                    setTimeout(() => {
                      navigation.navigate('Design' as any, { 
                        fromCamera: true,
                        photoData: { 
                          imageUri: photo.uri,
                          base64: photo.base64 
                        } 
                      });
                    }, 50);
                  }
                }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        // Match camera payload size for faster round trips
        quality: 0.65,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check if color and nail customization are already selected
        if (selectedColor && selectedShape) {
          // Add delay to prevent crash
          setTimeout(() => {
            navigation.navigate('Processing' as any, { 
              imageUri: asset.uri,
              base64: asset.base64 
            });
          }, 50);
        } else {
          // Store photo for later use and navigate to Design screen
          await AsyncStorage.setItem('pendingPhoto', JSON.stringify({
            imageUri: asset.uri,
            base64: asset.base64
          }));
          
          // Add delay to prevent crash
          setTimeout(() => {
            navigation.navigate('Design' as any, { 
              fromCamera: true,
              photoData: { 
                imageUri: asset.uri,
                base64: asset.base64 
              } 
            });
          }, 50);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const toggleCameraFacing = () => {
    console.log('Toggle camera facing pressed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleTabPress = (route: string) => {
    if (route === 'Design') {
      navigation.navigate('Design' as any);
    } else if (route === 'Feed') {
      navigation.navigate('Feed' as any);
    }
    // Camera is current screen
  };

  const renderGlassButton = (icon: keyof typeof Ionicons.glyphMap, onPress: () => void, label?: string) => {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.liquidGlassButton}>
          <Ionicons name={icon} size={24} color="white" />
          {label && <Text style={styles.buttonLabel}>{label}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (!permission) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}> 
        <ActivityIndicator size="large" color="#e70a5a" />
        <Text style={{ color: '#333', marginTop: 12 }}>Preparing camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Full screen camera */}
      {shouldRenderCamera ? (
        <CameraView 
          style={StyleSheet.absoluteFillObject} 
          facing={facing}
          ref={cameraRef}
          active={shouldRenderCamera}
          onCameraReady={() => {
            console.log('Camera is ready');
            setIsCameraReady(true);
          }}
          onMountError={(error: any) => {
            console.error('Camera mount error:', error);
            Alert.alert('Camera Error', 'Failed to initialize camera. Please try again.');
          }}
        />
      ) : (
        <View style={styles.cameraPlaceholder}>
          <ActivityIndicator size="small" color="#e70a5a" />
        </View>
      )}
      
      {/* Color/Shape Overlay on Camera Preview */}
      {(selectedColor || (selectedShape && selectedShape.id !== 'keep')) && (
        <View style={styles.selectionOverlay}>
          <NativeLiquidGlass
            style={styles.selectionBadge}
            intensity={58}
            tint="default"
            cornerRadius={28}
            borderWidth={0.6}
          >
            <View style={styles.selectionBadgeContent}>
              {selectedColor && (
                <View style={styles.selectionColorSection}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: selectedColor.hex }
                    ]}
                  />
                  <View style={styles.selectionLabelStack}>
                    <Text style={styles.selectionPrimary}>{selectedColor.name}</Text>
                    {selectedColor.brand ? (
                      <Text style={styles.selectionSecondary}>
                        {selectedColor.brand}
                        {selectedColor.productLine ? ` · ${selectedColor.productLine}` : ''}
                      </Text>
                    ) : null}
                  </View>
                </View>
              )}
              {selectedShape && selectedShape.id !== 'keep' && (
                <Text style={styles.selectionShapeLabel}>{selectedShape.name}</Text>
              )}
            </View>
          </NativeLiquidGlass>
        </View>
      )}
      
      {/* Top Floating Controls - iOS 26 Style */}
      <View style={styles.topControls}>
        <View style={styles.topControlsRow}>
          {renderGlassButton('close', () => navigation.goBack())}
          <View style={styles.topControlsCenter} />
          {renderGlassButton('camera-reverse-outline', toggleCameraFacing)}
        </View>
      </View>

      {/* Bottom Capture Controls - iOS 26 Style */}
      <View style={styles.bottomSection}>
        {/* Camera Controls Container */}
        <View style={styles.cameraControlsContainer}>
          {/* Main Capture Button - iOS 26 Style (centered) */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isCapturing}
            activeOpacity={0.9}
          >
            <View style={styles.captureButtonCore} />
          </TouchableOpacity>
        </View>
        
        {/* Glass Pill Selector - Upload/Design */}
        <View style={styles.glassPillContainer}>
          {/* Multiple glass layers for depth */}
          <View style={styles.glassPillBackground} />
          <View style={styles.glassPillBlur} />
          
          {/* Upload/Design Options */}
          <View style={styles.pillOptionsRow}>
            {/* Upload Option */}
            <TouchableOpacity 
              style={styles.pillOption}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <View style={styles.pillOptionContent}>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={[styles.pillOptionText, { marginTop: 4 }]}>Upload</Text>
              </View>
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={styles.pillDivider} />
            
            {/* Design Option */}
            <TouchableOpacity 
              style={styles.pillOption}
              onPress={() => navigation.navigate('Design' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.pillOptionContent}>
                <Ionicons name="color-palette-outline" size={20} color="#FFFFFF" />
                <Text style={[styles.pillOptionText, { marginTop: 4 }]}>Design</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Floating Glass Tab Bar */}
      <LiquidGlassTabBar
        tabs={[
          { icon: 'color-palette', label: 'Design', route: 'Design' },
          { icon: 'camera', label: 'Camera', route: 'Camera' },
          { icon: 'grid', label: 'Feed', route: 'Feed' },
        ]}
        activeTab="Camera"
        onTabPress={handleTabPress}
        collapsed={tabBarCollapsed}
      />

      {/* Processing indicator */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  permissionButton: {
    backgroundColor: '#FF69B4',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topControlsCenter: {
    flex: 1,
  },
  liquidGlassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  selectionBadge: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    minHeight: 56,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  selectionBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 20,
    flexWrap: 'wrap',
  },
  selectionColorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 14,
    flexShrink: 1,
  },
  selectionLabelStack: {
    flexShrink: 1,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 4,
    backgroundColor: 'transparent',
  },
  selectionPrimary: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
    backgroundColor: 'transparent',
  },
  selectionSecondary: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11.5,
    marginTop: 2,
    letterSpacing: -0.1,
    backgroundColor: 'transparent',
  },
  selectionShapeLabel: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: -0.05,
    backgroundColor: 'transparent',
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  cameraControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  galleryControl: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassPillContainer: {
    width: 220,
    height: 60,
    alignSelf: 'center',
    marginTop: 16,
    position: 'relative',
  },
  glassPillBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  glassPillBlur: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 30,
  },
  pillOptionsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  pillOption: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillOptionContent: {
    alignItems: 'center',
  },
  pillOptionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pillDivider: {
    width: 0.5,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  captureButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  captureButtonCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});
