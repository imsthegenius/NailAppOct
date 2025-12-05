import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  ImageSourcePropType,
} from 'react-native'
import type { ViewToken } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { StackNavigationProp } from '@react-navigation/stack'
import type { RootStackParamList } from '../navigation/types'
import { spacing } from '../src/theme/tokens'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

const { width, height } = Dimensions.get('window')
const LARGE_DEVICE = height >= 780
const FOOTER_BOTTOM_OFFSET = LARGE_DEVICE ? height * 0.04 : height * 0.03

// Figma colors
const ROSE_600_70 = 'rgba(225, 29, 72, 0.7)'
const GRADIENT_START = '#FFFFFF'
const GRADIENT_MID = '#FFFFFF'
const GRADIENT_END = '#F9A8D4' // Pink (rose-300)

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>

type Props = {
  navigation: OnboardingNavigationProp
}

type GradientStops = readonly [string, string] | readonly [string, string, string]

type Slide = {
  id: string
  title: string
  description: string
  image: ImageSourcePropType
  gradient: GradientStops
}

const SLIDES: Slide[] = [
  {
    id: 'tryon',
    title: 'Try on nail colours before the salon',
    description: "No more wondering if it'll look good.",
    image: require('../assets/images/onboarding/slide1-image.png'),
    gradient: [GRADIENT_START, GRADIENT_MID, GRADIENT_END],
  },
  {
    id: 'choose',
    title: 'Choose from 300+ colours',
    description:
      'Pick a colour, pick a shape, upload a photo and watch colours come to life on your nails.',
    image: require('../assets/images/onboarding/slide2-colours.png'),
    gradient: [GRADIENT_START, GRADIENT_MID, GRADIENT_END],
  },
]

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 55 }).current;
  const prevIndexRef = useRef(0);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== prevIndexRef.current) {
          Haptics.selectionAsync();
          prevIndexRef.current = newIndex;
        }
        setCurrentIndex(newIndex);
      }
    }
  ).current;

  useEffect(() => {
    // no-op: keep hook structure consistent
  }, []);

  const completeOnboarding = useCallback(
    async (destination: 'AuthLanding' | 'Signup' | 'Login' | 'Main' = 'AuthLanding') => {
      try {
        await AsyncStorage.setItem('hasLaunched', 'true');
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to persist onboarding flag', error);
        }
      }
      navigation.replace(destination);
    },
    [navigation]
  );

  const handleSkip = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await completeOnboarding();
  }, [completeOnboarding]);

  // No explicit Continue button in the new design; users swipe or Skip

  // Apple CTA moved out with old CTA slide; keep placeholders if needed later

  // CTA actions removed with simplified design

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 250);
  }, []);

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={styles.slide}>
        {/* Hero image at top */}
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.heroImage} resizeMode="contain" />
        </View>

        {/* Text content at bottom */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    )
  }

  const active = SLIDES[Math.max(0, Math.min(currentIndex, SLIDES.length - 1))]

  return (
    <View style={styles.fullscreen}>
      <LinearGradient
        colors={active.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" backgroundColor="transparent" translucent />

        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            keyExtractor={(item) => item.id}
            renderItem={renderSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            initialNumToRender={SLIDES.length}
            windowSize={SLIDES.length}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.paginationRow}>
            <View style={styles.dots}>
              {SLIDES.map((slide, index) => (
                <View
                  key={slide.id}
                  style={[
                    styles.dot,
                    index === currentIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={handleSkip}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              accessibilityHint="Skip the remaining slides and go straight to account setup choices."
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const DOT_SIZE = 10

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    height: height * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: LARGE_DEVICE ? 20 : 10,
  },
  heroImage: {
    width: width * 0.85,
    height: '100%',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    color: ROSE_600_70,
    fontFamily: 'System',
  },
  description: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: ROSE_600_70,
  },
  footer: {
    paddingHorizontal: width * 0.06,
    paddingBottom: FOOTER_BOTTOM_OFFSET,
    paddingTop: spacing.sm,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: ROSE_600_70,
  },
  dotActive: {
    opacity: 1,
  },
  dotInactive: {
    opacity: 0.2,
  },
  skipButton: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  skipText: {
    color: ROSE_600_70,
    fontSize: 18,
    fontWeight: '600',
  },
})
