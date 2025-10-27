import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import type { ViewToken } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { onboardingGradients } from '../theme/gradients';
import { useThemeColors } from '../hooks/useColorScheme';
import { spacing, radii, typography } from '../src/theme/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
// Apple auth not used on simplified onboarding

const { width, height } = Dimensions.get('window');
const LARGE_DEVICE = height >= 780;
const TOP_PADDING = LARGE_DEVICE ? height * 0.06 : height * 0.05;
const BOTTOM_PADDING = LARGE_DEVICE ? height * 0.08 : height * 0.06;
const TEXT_MARGIN_TOP = LARGE_DEVICE ? height * 0.05 : height * 0.04;
const FOOTER_BOTTOM_OFFSET = LARGE_DEVICE ? height * 0.04 : height * 0.03;

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

type Props = {
  navigation: OnboardingNavigationProp;
};

type GradientStops = readonly [string, string] | readonly [string, string, string];

type Slide = {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  helper?: string;
  bullets?: string[];
  gradient: GradientStops;
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  showLogo?: boolean;
  variant?: 'default' | 'cta';
};

const SLIDES: Slide[] = [
  // 00.png reference
  {
    id: 'tryon',
    title: 'Try on nail colours before the salon',
    description: "No more wondering if it'll look good.",
    gradient: onboardingGradients.preview,
    gradientStart: { x: 0.5, y: 0 },
    gradientEnd: { x: 0.5, y: 1 },
    showLogo: true,
  },
  // 01.png reference
  {
    id: 'choose',
    title: 'Choose from 300+ colours',
    description:
      'Pick a colour, pick a shape, upload a photo and watch colours come to life on your nails.',
    gradient: onboardingGradients.customise,
    gradientStart: { x: 0.5, y: 0 },
    gradientEnd: { x: 0.5, y: 1 },
  },
  // 03.png reference style third card (no CTA components here)
  {
    id: 'previewMore',
    title: 'See colours on your nails',
    description: '',
    gradient: onboardingGradients.preview,
    gradientStart: { x: 0.5, y: 0 },
    gradientEnd: { x: 0.5, y: 1 },
  },
];

const DOT_SIZE = 10;

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const theme = useThemeColors();

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 55 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
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

  const renderDefaultSlide = (item: Slide) => (
    <View style={styles.slide}>
      {item.showLogo ? (
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/images/NailGlowLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      ) : <View style={{ height: 24 }} />}

      <View style={styles.copyWrap}>
        <Text style={styles.title}>{item.title}</Text>
      </View>

      <View style={styles.bottomWrap}>
        <Text style={styles.bottomSubtitle}>{item.description}</Text>
      </View>
    </View>
  );

  const renderSlide = ({ item }: { item: Slide }) => renderDefaultSlide(item);

  // No large CTA footer in the simplified design

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const showSkip = true;

  const active = SLIDES[Math.max(0, Math.min(currentIndex, SLIDES.length - 1))]

  return (
    <View style={styles.fullscreen}>
      <LinearGradient colors={active.gradient} start={active.gradientStart ?? { x: 0.5, y: 0 }} end={active.gradientEnd ?? { x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

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
          {showSkip ? (
            <TouchableOpacity
              onPress={handleSkip}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>
        {/* No bottom primary button in this design */}
      </View>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1, backgroundColor: '#000' },
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
    paddingTop: TOP_PADDING,
    paddingBottom: BOTTOM_PADDING,
    paddingHorizontal: width * 0.08,
    justifyContent: 'space-between',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  copyWrap: {
    marginTop: height * 0.02,
  },
  patternLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  patternCircleLarge: {
    position: 'absolute',
    width: width * 1.25,
    height: width * 1.25,
    borderRadius: (width * 1.25) / 2,
    backgroundColor: 'transparent',
    top: -width * 0.6,
    right: -width * 0.35,
  },
  patternCircleSmall: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'transparent',
    bottom: -width * 0.55,
    left: -width * 0.25,
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: TOP_PADDING * 0.35,
  },
  heroGlass: {
    width: Math.min(width * 0.78, 340),
    height: LARGE_DEVICE ? height * 0.22 : height * 0.2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  heroGlowPrimary: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: '-18%',
    right: '-12%',
  },
  heroGlowAccent: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 161, 186, 0.18)',
    bottom: '-22%',
    left: '-10%',
  },
  heroLogo: {
    alignSelf: 'center',
    width: '52%',
    height: '52%',
  },
  title: {
    fontSize: Math.min(56, Math.round(width * 0.13)),
    lineHeight: Math.min(62, Math.round(width * 0.145)),
    fontWeight: '800',
    color: '#fff',
    textAlign: 'left',
  },
  bottomWrap: { marginBottom: spacing.md },
  bottomSubtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: '#FF86A8',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    marginTop: spacing.sm,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  copyCard: {
    marginTop: TEXT_MARGIN_TOP,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  bulletList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  bulletText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  helper: {
    marginTop: spacing.md,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  footer: {
    paddingHorizontal: width * 0.08,
    paddingBottom: FOOTER_BOTTOM_OFFSET,
    paddingTop: 8,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  dotActive: {
    opacity: 1,
  },
  dotInactive: {
    opacity: 0.24,
  },
  skipText: {
    color: '#FF7FA3',
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: '#FF79AA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  primaryButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.bodyBold,
    fontSize: 18,
  },
  skipButton: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  skipPlaceholder: {
    minWidth: 60,
  },
  ctaSlide: {
    justifyContent: 'flex-start',
  },
  ctaPatternLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaPatternBlush: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: 'transparent',
    top: -width * 0.4,
    right: -width * 0.35,
  },
  ctaPatternGlow: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: 'transparent',
    bottom: -width * 0.4,
    left: -width * 0.2,
  },
  ctaHeroContainer: {
    marginTop: TOP_PADDING * 0.4,
    alignItems: 'center',
  },
  ctaHeroGlass: {
    width: Math.min(width * 0.78, 340),
    height: LARGE_DEVICE ? height * 0.2 : height * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaLogo: {
    width: '56%',
    height: '56%',
  },
  ctaHeadline: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  ctaSubheadline: {
    marginTop: spacing.sm,
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    fontWeight: '600',
  },
  ctaCopyCard: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctaEyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: '600',
  },
  ctaHelper: {
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaFooter: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  ctaButtonWrapper: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  appleButtonWrapper: {
    position: 'relative',
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
  },
  appleButton: {
    width: '100%',
    height: 48,
  },
  appleButtonSpinner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.xl,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  glassButton: {
    borderRadius: radii.xl,
  },
  ctaPrimaryGradient: {
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
  },
  ctaPrimaryText: {
    ...typography.bodyBold,
    fontSize: 18,
    color: '#fff',
  },
  ctaSecondarySurface: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  ctaSecondaryText: {
    ...typography.bodyBold,
    fontSize: 17,
  },
  ctaLegalCopy: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
