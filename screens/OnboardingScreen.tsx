import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import type { ViewToken } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../App';

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
  title: string;
  description: string;
  helper?: string;
  badge?: string;
  gradient: GradientStops;
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  showLogo?: boolean;
  variant?: 'default' | 'cta';
};

const SLIDES: Slide[] = [
  {
    id: 'preview',
    title: 'See colours on your nails',
    description: "No more wondering if it'll look good.",
    gradient: ['rgba(255, 161, 186, 0.95)', 'rgba(231, 10, 90, 0.9)'] as const,
    gradientStart: { x: 0.16, y: 0.93 },
    gradientEnd: { x: 0.93, y: 0.16 },
    showLogo: true,
  },
  {
    id: 'customise',
    title: 'Choose a colour, shape and upload a photo',
    description:
      'Pick a colour, pick a shape, upload a photo and watch colours come to life on your nails.',
    gradient: ['#E70A5A', '#F5B7CA'] as const,
    gradientStart: { x: 0, y: 1 },
    gradientEnd: { x: 1, y: 0 },
  },
  {
    id: 'cta',
    title: 'Ready to see your dream nails?',
    description: 'Create an account to preview every shade on your hands in seconds.',
    helper: 'Already have an account? Log in or continue with Apple or Google.',
    gradient: ['rgba(231, 10, 90, 0.6)', '#F6F4F0'] as const,
    gradientStart: { x: 1, y: 0 },
    gradientEnd: { x: 0, y: 1 },
    showLogo: true,
    variant: 'cta',
  },
];

const DOT_SIZE = 10;

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 55 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const completeOnboarding = useCallback(
    async (destination: 'Signup' | 'Login' = 'Signup') => {
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

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isLastSlide = currentIndex === SLIDES.length - 1;

    if (isLastSlide) {
      void completeOnboarding();
      return;
    }

    const nextIndex = currentIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, [completeOnboarding, currentIndex]);

  const handleSignup = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await completeOnboarding();
  }, [completeOnboarding]);

  const handleLogin = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await completeOnboarding('Login');
  }, [completeOnboarding]);

  const handleSocialPress = useCallback(
    async (provider: 'apple' | 'google') => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (__DEV__) {
        console.log(`Selected social provider: ${provider}`);
      }
      await completeOnboarding();
    },
    [completeOnboarding]
  );

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 250);
  }, []);

  const renderDefaultSlide = (item: Slide) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        start={item.gradientStart ?? { x: 0, y: 1 }}
        end={item.gradientEnd ?? { x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.patternLayer}>
        <View style={styles.patternCircleLarge} />
        <View style={styles.patternCircleSmall} />
      </View>

      {item.showLogo && (
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/Naild Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.textBlock}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        {item.helper && <Text style={styles.helper}>{item.helper}</Text>}
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderCtaSlide = (item: Slide) => (
    <View style={[styles.slide, styles.ctaSlide]}>
      <LinearGradient
        colors={item.gradient}
        start={item.gradientStart ?? { x: 1, y: 0 }}
        end={item.gradientEnd ?? { x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.ctaPatternLayer}>
        <View style={styles.ctaPatternBlush} />
        <View style={styles.ctaPatternGlow} />
      </View>

      <View style={styles.ctaContent}>
        {item.showLogo && (
          <Image
            source={require('../assets/images/Naild Logo.png')}
            style={styles.ctaLogo}
            resizeMode="contain"
          />
        )}
        <Text style={styles.ctaHeadline}>{item.title}</Text>
        <Text style={styles.ctaSubheadline}>{item.description}</Text>
      </View>
    </View>
  );

  const renderSlide = ({ item }: { item: Slide }) =>
    item.variant === 'cta' ? renderCtaSlide(item) : renderDefaultSlide(item);

  const renderCtaFooter = () => (
    <View style={styles.ctaFooter}>
      <TouchableOpacity
        style={styles.ctaPrimaryButton}
        onPress={handleSignup}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={['#FFA1BA', '#E70A5A']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.ctaPrimaryGradient}
        >
          <Text style={styles.ctaPrimaryText}>Sign Up</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ctaSecondaryButton}
        onPress={handleLogin}
        accessibilityRole="button"
      >
        <Text style={styles.ctaSecondaryText}>Log In</Text>
      </TouchableOpacity>

      <View style={styles.ctaDividerRow}>
        <View style={styles.ctaDividerLine} />
        <Text style={styles.ctaDividerText}>Or login with</Text>
        <View style={styles.ctaDividerLine} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialPress('apple')}
          accessibilityRole="button"
        >
          <Ionicons name="logo-apple" size={22} color="#E70A5A" />
          <Text style={styles.socialLabel}>Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialPress('google')}
          accessibilityRole="button"
        >
          <Ionicons name="logo-google" size={22} color="#E70A5A" />
          <Text style={styles.socialLabel}>Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const primaryLabel = isLastSlide ? 'Get started' : 'Continue';
  const showSkip = !isLastSlide;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

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
        {isLastSlide ? (
          renderCtaFooter()
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    height,
    paddingTop: TOP_PADDING,
    paddingBottom: BOTTOM_PADDING,
    paddingHorizontal: width * 0.08,
    justifyContent: 'space-between',
  },
  patternLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  patternCircleLarge: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: '#fff',
    top: -width * 0.55,
    right: -width * 0.3,
  },
  patternCircleSmall: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#fff',
    bottom: -width * 0.5,
    left: -width * 0.2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: TOP_PADDING * 0.4,
  },
  logo: {
    width: width * 0.5,
    height: height * 0.06,
  },
  textBlock: {
    marginTop: TEXT_MARGIN_TOP,
  },
  title: {
    fontSize: 48,
    lineHeight: 60,
    fontWeight: '800',
    color: '#fff',
  },
  description: {
    marginTop: 20,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: '#fff',
  },
  helper: {
    marginTop: 16,
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: FOOTER_BOTTOM_OFFSET,
    paddingHorizontal: width * 0.08,
    zIndex: 2,
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
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    top: -width * 0.4,
    right: -width * 0.35,
  },
  ctaPatternGlow: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: 'rgba(255, 161, 186, 0.2)',
    bottom: -width * 0.3,
    left: -width * 0.2,
  },
  ctaContent: {
    marginTop: TOP_PADDING * 1.2,
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  ctaLogo: {
    width: width * 0.6,
    height: height * 0.08,
    marginBottom: 32,
  },
  ctaHeadline: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  ctaSubheadline: {
    marginTop: 18,
    fontSize: 20,
    lineHeight: 28,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaFooter: {
    paddingTop: 8,
  },
  ctaPrimaryButton: {
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 18,
  },
  ctaPrimaryGradient: {
    paddingVertical: 20,
    borderRadius: 999,
    alignItems: 'center',
  },
  ctaPrimaryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  ctaSecondaryButton: {
    borderRadius: 999,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 26,
  },
  ctaSecondaryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#404040',
  },
  ctaDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ctaDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  ctaDividerText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 8,
  },
  socialLabel: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#E70A5A',
  },
});
