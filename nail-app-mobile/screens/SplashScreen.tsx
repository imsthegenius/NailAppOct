import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { resolvePostAuthDestination } from '../lib/onboardingFlow';

const { width, height } = Dimensions.get('window');

type NextRoute = 'Main' | 'Onboarding' | 'LegalAcceptance';

export default function SplashScreen({ navigation }: any) {
  // Screen 2 animations (gradient + logo)
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;
  const gradientOpacity = useRef(new Animated.Value(0)).current;

  // Screen 1 animations (Vector 50 at bottom)
  const vectorTranslateY = useRef(new Animated.Value(40)).current;
  const vectorOpacity = useRef(new Animated.Value(0)).current;
  const nextRouteRef = useRef<NextRoute>('Main');

  const determineNextRoute = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;

      if (!hasSession) {
        nextRouteRef.current = 'Onboarding';
        return;
      }

      const { needsLegal } = await resolvePostAuthDestination();
      nextRouteRef.current = needsLegal ? 'LegalAcceptance' : 'Main';
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to resolve splash destination', error);
      }
      nextRouteRef.current = 'Onboarding';
    }
  };

  useEffect(() => {
    let isMounted = true;
    const destinationPromise = determineNextRoute();

    // Timeline:
    // 1) Bring in Vector 50 from bottom and fade it
    // 2) Cross-fade gradient + pop-in logo
    // 3) Navigate to Design
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(vectorOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(vectorTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(gradientOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(async () => {
      await destinationPromise;
      if (!isMounted) {
        return;
      }

      setTimeout(() => {
        const nextRoute = nextRouteRef.current;
        if (nextRoute === 'Main') {
          navigation.replace('Main');
        } else if (nextRoute === 'LegalAcceptance') {
          navigation.replace('LegalAcceptance');
        } else {
          navigation.replace('Onboarding');
        }
      }, 650);
    });

    return () => {
      isMounted = false;
      animation.stop();
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Screen 1: Vector 50 shape from bottom */}
      <Animated.View
        style={[
          styles.vector50,
          { opacity: vectorOpacity, transform: [{ translateY: vectorTranslateY }] },
        ]}
      />

      {/* Screen 2: Gradient + Logo overlay */}
      <Animated.View style={[styles.gradientWrap, { opacity: gradientOpacity }]}>
        <LinearGradient
          colors={["#FFA1BA", "#F6F4F0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.backgroundGradient}
        />
      </Animated.View>

      <Animated.View
        style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <Image
          source={require('../assets/images/NailGlowLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    backgroundColor: '#f6f4f0',
    position: 'relative',
  },
  // Screen 1 (from your Vector 50 spec)
  vector50: {
    position: 'absolute',
    width: width * 1.28, // ~565/440
    height: height * 0.39, // ~375/956
    bottom: 0,
    left: width * -0.12, // ~-52/440
    backgroundColor: '#ffa1ba',
    borderWidth: 1,
    borderColor: '#e70a5a',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  // Screen 2 background gradient
  gradientWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundGradient: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    top: -height * 0.25,
    left: -width * 0.25,
  },
  logoContainer: {
    position: 'absolute',
    top: height * 0.42,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.12,
  },
});
