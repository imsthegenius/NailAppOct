import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { useSelectionStore } from '../lib/selectedData';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type ProcessingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Processing'>;

type Props = {
  navigation: ProcessingScreenNavigationProp;
  route: {
    params: {
      imageUri: string;
      base64?: string;
    };
  };
};

const { width, height } = Dimensions.get('window');

// Processing messages based on progress
const getProcessingMessage = (progress: number, colorName: string, shapeName: string): string => {
  if (progress < 20) return 'Analyzing your nails...';
  if (progress < 40) return `Applying ${colorName}...`;
  if (progress < 60) return `Reshaping to ${shapeName}...`;
  if (progress < 80) return 'Perfecting the finish...';
  if (progress < 98) return 'Almost there...';
  return 'Your look is ready!';
};

export default function ProcessingScreen({ navigation, route }: Props) {
  if (__DEV__) {
    console.log('ProcessingScreen mounted with params:', route.params);
  }
  
  const { imageUri, base64 } = route.params || {};
  
  if (!imageUri) {
    console.error('No imageUri provided to ProcessingScreen');
    navigation.goBack();
    return null;
  }
  
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('Analyzing your nails...');
  
  // Animation values
  const scannerAnim = useRef(new Animated.Value(0)).current;
  const sparkle1Anim = useRef(new Animated.Value(0)).current;
  const sparkle2Anim = useRef(new Animated.Value(0)).current;
  const sparkle3Anim = useRef(new Animated.Value(0)).current;
  const sparkle4Anim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const selectedColor = useSelectionStore((state) => state.selectedColor);
  const selectedShape = useSelectionStore((state) => state.selectedShape);
  const selectedLength = useSelectionStore((state) => state.selectedLength);

  useEffect(() => {
    // Start animations
    startAnimations();
    
    // Perform the actual transformation
    const performTransformation = async () => {
      let resolvedBase64 = base64 ?? '';
      try {
        // Import the Gemini transformation functions
        const { transformNailsWithGemini, mockTransformNails, detectMimeType, isGeminiConfigured } = await import('../lib/geminiService');
        
        // Start progress simulation
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = Math.min(prev + Math.random() * 15 + 5, 95);
            
            // Update message based on progress
            if (selectedColor && selectedShape) {
              setProcessingMessage(getProcessingMessage(newProgress, selectedColor.name, selectedShape.name));
            }
            
            if (newProgress >= 95) {
              clearInterval(progressInterval);
            }
            
            return newProgress;
          });
        }, 200);
        
        if (!resolvedBase64 && imageUri) {
          try {
            resolvedBase64 = await FileSystem.readAsStringAsync(imageUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          } catch (fsError) {
            if (__DEV__) {
              console.error('Failed to read image as base64 for processing:', fsError);
            }
            resolvedBase64 = '';
          }
        }

        if (!resolvedBase64) {
          throw new Error('Missing base64 image data');
        }

        // Detect MIME type from base64
        const mimeType = detectMimeType(resolvedBase64);
        
        // Try to use real Gemini API, fallback to mock if not configured or on error
        let transformedImage: string;
        
        // Log the exact color being sent
        if (__DEV__) {
          console.log('=== COLOR DATA VERIFICATION ===');
          console.log('Selected Color Object:', selectedColor);
          console.log('Color Name:', selectedColor?.name);
          console.log('Color Hex:', selectedColor?.hex);
          console.log('==============================');
        }
        
        try {
          if (isGeminiConfigured()) {
            // Use real Gemini API for image generation
            if (__DEV__) {
              console.log('Using Gemini API for nail transformation...');
            }
            transformedImage = await transformNailsWithGemini(
              resolvedBase64,
              mimeType,
              selectedColor?.hex || '#FF69B4',
              selectedColor?.name || 'Pink',
              selectedShape?.name || 'Round',
              selectedLength?.name || 'Medium',
              {
                finish: selectedColor?.finish || null,
                brand: selectedColor?.brand || null,
                productLine: selectedColor?.productLine || null,
                collection: selectedColor?.collection || null,
                shadeCode: selectedColor?.shadeCode || null,
                shadeName: selectedColor?.name || null,
              }
            );
          } else {
            // Use mock if API key not configured
            if (__DEV__) {
              console.log('Gemini API not configured or proxy missing, using mock transformation');
            }
            transformedImage = await mockTransformNails(
              resolvedBase64,
              mimeType,
              selectedColor?.hex || '#FF69B4',
              selectedColor?.name || 'Pink',
              selectedShape?.name || 'Round',
              selectedLength?.name || 'Medium',
              {
                finish: selectedColor?.finish || null,
                brand: selectedColor?.brand || null,
                productLine: selectedColor?.productLine || null,
                collection: selectedColor?.collection || null,
                shadeCode: selectedColor?.shadeCode || null,
                shadeName: selectedColor?.name || null,
              }
            );
          }
        } catch (apiError) {
          console.error('Gemini API failed, falling back to mock:', apiError);
          // Fallback to mock on error
          transformedImage = await mockTransformNails(
            resolvedBase64,
            mimeType,
            selectedColor?.hex || '#FF69B4',
            selectedColor?.name || 'Pink',
            selectedShape?.name || 'Round',
            selectedLength?.name || 'Medium',
            {
              finish: selectedColor?.finish || null,
              brand: selectedColor?.brand || null,
              productLine: selectedColor?.productLine || null,
              collection: selectedColor?.collection || null,
              shadeCode: selectedColor?.shadeCode || null,
              shadeName: selectedColor?.name || null,
            }
          );
        }
        
        // Complete the progress
        setProgress(100);
        setProcessingMessage('Finalizing your look...');
        
        // Navigate to results
        setTimeout(() => {
          navigation.replace('Results', { 
            imageUri: transformedImage, // Use the transformed image
            originalImageUri: imageUri,
            transformedBase64: transformedImage,
            originalBase64: resolvedBase64 || null,
          });
        }, 500);
        
      } catch (error) {
        console.error('Transformation error:', error);
        // Still navigate but with original image
        navigation.replace('Results', { 
          imageUri: imageUri,
          originalImageUri: imageUri,
          transformedBase64: resolvedBase64 || null,
          originalBase64: resolvedBase64 || null,
        });
      }
    };
    
    performTransformation();
  }, []);

  const startAnimations = () => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scanner line animation (continuous up and down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scannerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle animations (floating and fading)
    const animateSparkle = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animateSparkle(sparkle1Anim, 0);
    animateSparkle(sparkle2Anim, 400);
    animateSparkle(sparkle3Anim, 800);
    animateSparkle(sparkle4Anim, 1200);

    // Pulse animation for progress circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const renderSparkle = (animValue: Animated.Value, position: { top: number, left: number }) => {
    return (
      <Animated.Text
        style={[
          styles.sparkle,
          {
            top: position.top,
            left: position.left,
            opacity: animValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1, 0],
            }),
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1.2, 0.5],
                }),
              },
            ],
          },
        ]}
      >
        •
      </Animated.Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Blurred background image */}
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <Image 
          source={{ uri: imageUri }} 
          style={styles.blurredImage}
          blurRadius={20}
        />
        <View style={styles.imageOverlay} />
      </Animated.View>

      {/* Scanner effect */}
      <Animated.View
        style={[
          styles.scanner,
          {
            transform: [
              {
                translateY: scannerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, height - 200],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', selectedColor?.hex || '#FF69B4', 'transparent']}
          style={styles.scannerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      {/* Main content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Progress circle */}
        <Animated.View style={[styles.progressContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.progressCircle}>
            <View style={[styles.progressCircleBackground, { borderColor: selectedColor?.hex || '#FF69B4' }]} />
            <View style={styles.progressCircleFill}>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          </View>
        </Animated.View>

        {/* Processing message */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.processingMessage}>{processingMessage}</Text>
        </Animated.View>

        {/* Style info */}
        <Animated.View style={[styles.styleInfo, { opacity: fadeAnim }]}>
          <View style={[styles.colorChip, { backgroundColor: selectedColor?.hex || '#FF69B4' }]} />
          <Text style={styles.styleText}>
            {selectedColor?.name || 'Color'} • {selectedShape?.name || 'Shape'}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Floating sparkles */}
      {renderSparkle(sparkle1Anim, { top: height * 0.2, left: width * 0.2 })}
      {renderSparkle(sparkle2Anim, { top: height * 0.3, left: width * 0.7 })}
      {renderSparkle(sparkle3Anim, { top: height * 0.6, left: width * 0.15 })}
      {renderSparkle(sparkle4Anim, { top: height * 0.7, left: width * 0.8 })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    position: 'absolute',
    width: width,
    height: height,
  },
  blurredImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scanner: {
    position: 'absolute',
    width: width,
    height: 4,
    zIndex: 10,
  },
  scannerGradient: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressContainer: {
    marginBottom: 50,
  },
  progressCircle: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    opacity: 0.3,
  },
  progressCircleFill: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  processingMessage: {
    fontSize: 20,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  styleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  colorChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  styleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
});
