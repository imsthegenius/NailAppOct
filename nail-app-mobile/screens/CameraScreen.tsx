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
  InteractionManager,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import type { MainStackParamList } from '../navigation/types';
import { useIsFocused } from '@react-navigation/native';
import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';
import { NativeLiquidGlass } from '../components/ui/NativeLiquidGlass';
import { useSelectionStore } from '../lib/selectedData';
import { BRAND_COLORS } from '../src/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type CameraScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Camera'>;

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
  const [canActivateCamera, setCanActivateCamera] = useState(false);
  const [cameraRetry, setCameraRetry] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<1 | 2>(1);
  const cameraRef = useRef<CameraView>(null);
  const hideTabBarTimer = useRef<NodeJS.Timeout | null>(null);
  const hasLaidOutRef = useRef(false);
  const isFocused = useIsFocused();

  const selectedColor = useSelectionStore((state) => state.selectedColor);
  const selectedShape = useSelectionStore((state) => state.selectedShape);
  const selectedLength = useSelectionStore((state) => state.selectedLength);
  const insets = useSafeAreaInsets();

  const shouldRenderCamera = Boolean(permission?.granted && isFocused && hasLaidOut);
  const cornerTopOffset = Math.max(insets.top + 100, 100);
  const cornerBottomOffset = Math.max(insets.bottom + 160, 180);
  const bottomSectionOffset = Math.max(insets.bottom + 40, 70);

  // Debug log on mount
  useEffect(() => {
    if (__DEV__) {
      console.log('CameraScreen mounted');
      console.log('Current selected color:', selectedColor);
      console.log('Current selected shape:', selectedShape);
      console.log('Current selected length:', selectedLength);
    }
    
    return () => {
      if (__DEV__) {
        console.log('CameraScreen unmounting');
      }
    };
  }, []);

  // Auto-request camera permission on first mount if not determined
  useEffect(() => {
    if (!permission) {
      // Fire and forget; the UI will update based on response
      requestPermission().catch(() => {});
    }
  }, [permission, requestPermission]);

  // If permission object exists but is not yet granted and can ask again, prompt once in release
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission().catch(() => {});
    }
  }, [permission?.granted, permission?.canAskAgain, requestPermission]);

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

  // Defer the initial camera activation slightly until interactions settle.
  useEffect(() => {
    if (permission?.granted && isFocused && hasLaidOut) {
      let mounted = true;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const handle: any = InteractionManager.runAfterInteractions(() => {
        timeoutId = setTimeout(() => {
          if (mounted) setCanActivateCamera(true);
        }, 250);
      });
      return () => {
        mounted = false;
        setCanActivateCamera(false);
        if (timeoutId) clearTimeout(timeoutId);
        try { handle?.cancel?.(); } catch {}
      };
    } else {
      setCanActivateCamera(false);
    }
  }, [permission?.granted, isFocused, hasLaidOut]);

  // Fallback: if layout event never fires on some devices, force-enable after a short delay once focused with permission.
  useEffect(() => {
    if (permission?.granted && isFocused && !hasLaidOut) {
      const t = setTimeout(() => setHasLaidOut(true), 600);
      return () => clearTimeout(t);
    }
  }, [permission?.granted, isFocused, hasLaidOut]);

  // If camera fails to become ready shortly after activation, force a remount once.
  useEffect(() => {
    if (shouldRenderCamera && canActivateCamera && !isCameraReady) {
      const timer = setTimeout(() => {
        if (!isCameraReady) {
          setCameraRetry((n) => n + 1);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldRenderCamera, canActivateCamera, isCameraReady]);

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
              navigation.navigate('Processing', { 
                imageUri: photo.uri,
                base64: photo.base64 
              });
            }, 50);
          } else {
            // Store photo for later use and navigate to Design screen
            await AsyncStorage.setItem('pendingPhoto', JSON.stringify({
              imageUri: photo.uri
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
                      navigation.navigate('Design', { 
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

  const toggleCameraFacing = () => {
    if (__DEV__) {
      console.log('Toggle camera facing pressed');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleZoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setZoomLevel(current => (current === 1 ? 2 : 1));
  };

  const handleTabPress = (route: keyof MainStackParamList) => {
    if (route === 'Design') {
      navigation.navigate('Design');
    } else if (route === 'Feed') {
      navigation.navigate('Feed');
    }
    // Camera is current screen
  };

  const renderGlassButton = (icon: keyof typeof Ionicons.glyphMap, onPress: () => void, label?: string) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <NativeLiquidGlass
        style={styles.liquidGlassButton}
        intensity={55}
        tint="default"
        cornerRadius={22}
        borderWidth={0.8}
      >
        <Ionicons name={icon} size={24} color="white" />
        {label && <Text style={styles.buttonLabel}>{label}</Text>}
      </NativeLiquidGlass>
    </TouchableOpacity>
  );

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
        <>
          <CameraView 
            key={`cam-${cameraRetry}`}
            style={StyleSheet.absoluteFillObject} 
            facing={facing}
            zoom={zoomLevel === 2 ? 0.5 : 0}
            ref={cameraRef}
            active={shouldRenderCamera && canActivateCamera}
            onCameraReady={() => {
              if (__DEV__) {
                console.log('Camera is ready');
              }
              setIsCameraReady(true);
            }}
            onMountError={(error: any) => {
              console.error('Camera mount error:', error);
              Alert.alert('Camera Error', 'Failed to initialize camera. Please try again.');
            }}
          />
          
          {/* Corner framing guides (non-interactive) */}
          <View style={styles.cornerGuidesOverlay} pointerEvents="none">
            {/* Top left */}
            <View style={[styles.cornerGuide, styles.cornerGuideTopLeft, { top: cornerTopOffset }]}>
              <View style={styles.cornerGuideShape} />
            </View>
            {/* Top right */}
            <View style={[styles.cornerGuide, styles.cornerGuideTopRight, { top: cornerTopOffset }]}>
              <View style={[styles.cornerGuideShape, styles.cornerGuideRotate90]} />
            </View>
            {/* Bottom left */}
            <View style={[styles.cornerGuide, styles.cornerGuideBottomLeft, { bottom: cornerBottomOffset }]}>
              <View style={[styles.cornerGuideShape, styles.cornerGuideRotate270]} />
            </View>
            {/* Bottom right */}
            <View style={[styles.cornerGuide, styles.cornerGuideBottomRight, { bottom: cornerBottomOffset }]}>
              <View style={[styles.cornerGuideShape, styles.cornerGuideRotate180]} />
            </View>
          </View>
        </>
      ) : (
        <View style={styles.cameraPlaceholder}>
          <ActivityIndicator size="small" color="#e70a5a" />
        </View>
      )}

      {/* Diagnostics overlay for TestFlight (enable with EXPO_PUBLIC_DIAGNOSTICS=1) */}
      {((globalThis as any)?.process?.env?.EXPO_PUBLIC_DIAGNOSTICS === '1') && (
        <View style={{ position: 'absolute', top: 8, left: 8, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontSize: 11 }}>perm: {String(!!permission)} / granted: {String(!!permission?.granted)}</Text>
          <Text style={{ color: '#fff', fontSize: 11 }}>focused: {String(isFocused)} laidOut: {String(hasLaidOut)}</Text>
          <Text style={{ color: '#fff', fontSize: 11 }}>canActivate: {String(canActivateCamera)} ready: {String(isCameraReady)}</Text>
          <Text style={{ color: '#fff', fontSize: 11 }}>retry: {String(cameraRetry)}</Text>
        </View>
      )}
      
      {/* Color/Shape Overlay on Camera Preview */}
      {(selectedColor || (selectedShape && selectedShape.id !== 'keep')) && (
        <View style={styles.selectionOverlay} pointerEvents="none">
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
      <View style={[styles.topControls, { top: insets.top + 16 }]} pointerEvents="box-none">
        <View style={styles.topControlsRow}>
          {renderGlassButton('close', () => navigation.goBack())}
          <View style={styles.topControlsCenter} />
        </View>
      </View>

      {/* Bottom Capture Controls - iOS 26 Style */}
      <View style={[styles.bottomSection, { bottom: bottomSectionOffset }]} pointerEvents="box-none">
        {/* Camera Controls Container */}
        <View style={styles.cameraControlsContainer}>
          {/* Zoom chip above shutter */}
          <TouchableOpacity
            style={styles.zoomChip}
            onPress={toggleZoom}
            activeOpacity={0.8}
          >
            <View style={styles.zoomChipSurface}>
              <Text style={styles.zoomChipText}>{zoomLevel}x</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.captureRow}>
            {/* Main Capture Button - iOS 26 Style (centered) */}
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isCapturing || !isCameraReady}
              activeOpacity={0.9}
            >
              <View style={styles.captureOuterRing}>
                <View style={styles.captureButtonCore} />
              </View>
            </TouchableOpacity>

            {/* Flip camera button aligned with shutter */}
            <TouchableOpacity
              style={styles.flipCameraButton}
              onPress={toggleCameraFacing}
              activeOpacity={0.85}
            >
              <NativeLiquidGlass
                style={StyleSheet.absoluteFillObject}
                intensity={55}
                tint="default"
                cornerRadius={24}
                borderWidth={0.8}
              />
              <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
      </View>

      {/* Floating Glass Tab Bar */}
      <LiquidGlassTabBar
        activeTab={''}
        onTabPress={handleTabPress as any}
        onCameraPress={() => {}}
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
    alignItems: 'stretch',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  permissionButton: {
    backgroundColor: BRAND_COLORS.accent,
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
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topControlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    justifyContent: 'center',
    alignItems: 'center',
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
  cornerGuidesOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  cornerGuide: {
    position: 'absolute',
    width: 26,
    height: 26,
  },
  cornerGuideTopLeft: {
    left: 30,
  },
  cornerGuideTopRight: {
    right: 30,
  },
  cornerGuideBottomLeft: {
    left: 30,
  },
  cornerGuideBottomRight: {
    right: 30,
  },
  cornerGuideShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopColor: '#FF80B5',
    borderLeftColor: '#FF1F55',
    borderTopLeftRadius: 6,
  },
  cornerGuideRotate90: {
    transform: [{ rotate: '90deg' }],
  },
  cornerGuideRotate180: {
    transform: [{ rotate: '180deg' }],
  },
  cornerGuideRotate270: {
    transform: [{ rotate: '270deg' }],
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  cameraControlsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  captureRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 64,
  },
  zoomChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomChipSurface: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6D6C6A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomChipText: {
    color: '#FFD300',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -1,
  },
  captureButton: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureOuterRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(65, 66, 73, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonCore: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'white',
  },
  flipCameraButton: {
    position: 'absolute',
    right: 0,
    top: 19,
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
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
