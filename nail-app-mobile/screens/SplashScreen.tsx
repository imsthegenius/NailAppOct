import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { resolvePostAuthDestination } from '../lib/onboardingFlow';

const { width, height } = Dimensions.get('window');

type NextRoute = 'Main' | 'Onboarding' | 'LegalAcceptance';

export default function SplashScreen({ navigation }: any) {
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
    (async () => {
      await determineNextRoute();
      if (!isMounted) {
        return;
      }
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
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Screen 1: Vector 50 shape from bottom */}
      {/* Screen 2: Gradient + Logo overlay */}
      <View style={styles.gradientWrap}>
        <LinearGradient
          colors={["rgba(225,29,72,0.40)", "rgba(253,164,175,0.10)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
      </View>

      <View
        style={styles.logoContainer}
      >
        <Image
          source={require('../assets/images/NailGlowLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    backgroundColor: '#f5f5f4',
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
