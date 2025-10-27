import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import DebugErrorBoundary from './components/DebugErrorBoundary';
import { supabase } from './lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initRevenueCat } from './lib/revenuecat';
import { PAYWALL_ENABLED } from './lib/paywall';

// Screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AuthLandingScreen from './screens/AuthLandingScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import LegalAcceptanceScreen from './screens/LegalAcceptanceScreen';
import ConnectionTestScreen from './screens/ConnectionTestScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import DeleteAccountScreen from './screens/DeleteAccountScreen';
import ConnectionStatusBanner, { ConnectionStatus } from './components/ConnectionStatusBanner';

// Main App Navigator
import MainNavigator from './navigation/MainNavigator';
import type { RootStackParamList } from './navigation/types';

const Stack = createStackNavigator<RootStackParamList>();

const areConnectionStatusesEqual = (a: ConnectionStatus | null, b: ConnectionStatus | null) => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return (
    a.internet === b.internet &&
    a.supabase === b.supabase &&
    a.message === b.message &&
    Boolean(a.isUsingProxy) === Boolean(b.isUsingProxy)
  );
};

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [showConnectionBanner, setShowConnectionBanner] = useState(true);

  const testConnections = useCallback(async () => {
    try {
      const { getConnectionStatus } = await import('./lib/checkSupabase');
      const status = await getConnectionStatus();
      setConnectionStatus((current) => (areConnectionStatusesEqual(current, status) ? current : status));
      setShowConnectionBanner((showing) => showing || !status.internet || !status.supabase);

      if (__DEV__) {
        console.log('Connection status snapshot:', status);
      }
    } catch (err: any) {
      if (__DEV__) {
        console.error('Connection test error:', err?.message || err);
      }
      setConnectionStatus((current) =>
        areConnectionStatusesEqual(current, {
          internet: false,
          supabase: false,
          message: 'Unable to verify service status right now.',
          isUsingProxy: false,
        })
          ? current
          : {
              internet: false,
              supabase: false,
              message: 'Unable to verify service status right now.',
              isUsingProxy: false,
            }
      );
      setShowConnectionBanner(true);
    }
  }, []);

  useEffect(() => {
    checkFirstLaunch();
    
    // Set up auth listener and check initial status
    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        if (PAYWALL_ENABLED) {
          try {
            const userId = session?.user?.id;
            await initRevenueCat(userId);
          } catch {}
        }
        
        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          setIsAuthenticated(!!session);
          if (PAYWALL_ENABLED) {
            try {
              await initRevenueCat(session?.user?.id);
            } catch {}
          }
        });
        
        // Store cleanup function
        return () => {
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        if (__DEV__) {
          console.error('Error checking auth status:', error);
        }
        setIsAuthenticated(false);
      }
    };
    
    const authCleanup = setupAuth();

    if (__DEV__) {
      console.log('NailGlow App Started');
    }

    testConnections();
    
    // Cleanup auth listener on unmount
    return () => {
      authCleanup.then(cleanup => cleanup?.());
    };
  }, []);

  // Guard against indefinite waiting in release if any async init hangs.
  useEffect(() => {
    const t = setTimeout(() => {
      setIsFirstLaunch((v) => (v === null ? false : v));
      setIsAuthenticated((v) => (v === null ? false : v));
    }, 7000);
    return () => clearTimeout(t);
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      setIsFirstLaunch(hasLaunched === null);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    }
  };

  if (isFirstLaunch === null || isAuthenticated === null) {
    // Show a visible loader instead of a black screen while booting
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#f6f4f0', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#e70a5a" />
      </GestureHandlerRootView>
    );
  }

  const shouldShowBanner =
    showConnectionBanner &&
    connectionStatus &&
    (!connectionStatus.internet || !connectionStatus.supabase);

  const handleRetryConnections = () => {
    testConnections();
  };

  const handleDismissBanner = () => {
    setShowConnectionBanner(false);
  };

  // Determine initial route - Show splash first
  const initialRoute: keyof RootStackParamList = 'Splash';
  // After splash, the logic will continue to appropriate screen

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DebugErrorBoundary>
        {shouldShowBanner && connectionStatus ? (
          <SafeAreaView pointerEvents="box-none">
            <ConnectionStatusBanner
              status={connectionStatus}
              onRetry={handleRetryConnections}
              onDismiss={handleDismissBanner}
            />
          </SafeAreaView>
        ) : null}
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          >
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="ConnectionTest" component={ConnectionTestScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="LegalAcceptance" component={LegalAcceptanceScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DebugErrorBoundary>
    </GestureHandlerRootView>
  );
}
