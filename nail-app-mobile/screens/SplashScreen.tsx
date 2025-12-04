import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { resolvePostAuthDestination } from '../lib/onboardingFlow';

const { width, height } = Dimensions.get('window');

type NextRoute = 'Main' | 'Onboarding' | 'LegalAcceptance';

export default function SplashScreen({ navigation }: any) {
  const nextRouteRef = useRef<NextRoute>('Main');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const insets = useSafeAreaInsets();

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
    // Start fade-in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    let isMounted = true;
    (async () => {
      await determineNextRoute();
      if (!isMounted) {
        return;
      }
      // Small delay to show splash animation
      await new Promise(resolve => setTimeout(resolve, 800));
      const nextRoute = nextRouteRef.current;
      if (nextRoute === 'Main') {
        navigation.replace('Main');
      } else if (nextRoute === 'LegalAcceptance') {
        navigation.replace('LegalAcceptance');
      } else {
        navigation.replace('Onboarding');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Premium gradient background */}
      <LinearGradient
        colors={['#F7AFC3', '#FFEFF3', '#FFF5F7']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Centered logo with animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/NailGlowLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Subtle bottom accent */}
      <View style={[styles.bottomAccent, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.accentLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.55,
    height: 80,
  },
  tagline: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '500',
    color: '#E70A5A',
    letterSpacing: 0.5,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  accentLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(231, 10, 90, 0.3)',
  },
});
