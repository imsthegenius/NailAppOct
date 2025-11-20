import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import DebugErrorBoundary from './components/DebugErrorBoundary';
import { GlassToast } from './components/ui/GlassToast';
import { supabase } from './lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initRevenueCat } from './lib/revenuecat';
import { PAYWALL_ENABLED } from './lib/paywall';
import { scheduleWarmOnAppStart } from './lib/savedLooksPrefetch'
import { SavedLooksProvider } from './src/context/SavedLooksContext';

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
  const [diagToast, setDiagToast] = useState<{ visible: boolean; message: string }>(() => ({ visible: false, message: '' }));
  const [diagInfo, setDiagInfo] = useState<{ channel?: string; runtime?: string; paywallDisabled?: boolean } | null>(null);

  const getEnv = useCallback((key: string): string | undefined => {
    try {
      const v = (globalThis as any)?.process?.env?.[key];
      return typeof v === 'string' ? v : undefined;
    } catch {
      return undefined;
    }
  }, []);

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
    console.log('[App.tsx] Main useEffect started.');

    checkFirstLaunch();

    // Set up auth listener and check initial status
    const setupAuth = async () => {
      console.log('[App.tsx] setupAuth() called.');
      try {
        console.log('[App.tsx] Checking initial Supabase session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log(`[App.tsx] Initial session found: ${!!session}`);
        setIsAuthenticated(!!session);

        if (PAYWALL_ENABLED) {
          try {
            const userId = session?.user?.id;
            console.log(`[App.tsx] Initializing RevenueCat for user: ${userId || 'anonymous'}`);
            await initRevenueCat(userId);
            console.log('[App.tsx] RevenueCat initialized.');
          } catch (rcError) {
            console.error('[App.tsx] RevenueCat init failed:', rcError);
          }
        }

        // Warm saved looks cache shortly after app start if logged in
        try {
          console.log('[App.tsx] Warming saved looks cache...');
          scheduleWarmOnAppStart();
        } catch (warmError) {
          console.error('[App.tsx] Cache warm-up failed:', warmError);
        }

        // Listen for auth changes
        console.log('[App.tsx] Subscribing to onAuthStateChange.');
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log(`[App.tsx] onAuthStateChange event: ${event}, session: ${!!session}`);
          setIsAuthenticated(!!session);
          if (PAYWALL_ENABLED) {
            try {
              await initRevenueCat(session?.user?.id);
            } catch (rcError) {
              console.error('[App.tsx] RevenueCat re-init failed on auth change:', rcError);
            }
          }
          try {
            if (session?.user?.id) {
              console.log('[App.tsx] Re-warming cache on auth change.');
              scheduleWarmOnAppStart();
            }
          } catch (warmError) {
            console.error('[App.tsx] Cache re-warm failed on auth change:', warmError);
          }
        });

        // Store cleanup function
        return () => {
          console.log('[App.tsx] Unsubscribing from onAuthStateChange.');
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[App.tsx] Critical error in setupAuth:', error);
        setIsAuthenticated(false); // Ensure we always move past the loading state
      }
    };

    console.log('[App.tsx] Calling setupAuth()...');
    const authCleanupPromise = setupAuth();

    if (__DEV__) {
      console.log('NailGlow App Started (DEV mode)');
    }

    console.log('[App.tsx] Testing connections...');
    testConnections();

    // Show a brief diagnostics toast if prior crash/error captured and diagnostics flag enabled
    (async () => {
      try {
        const enabled = getEnv('EXPO_PUBLIC_DIAGNOSTICS') === '1';
        if (!enabled) return;
        try {
          const channel = (Updates as any)?.channel || undefined;
          const runtime = (Updates as any)?.runtimeVersion || (Constants?.expoConfig as any)?.runtimeVersion || undefined;
          const paywallDisabled = (getEnv('EXPO_PUBLIC_DISABLE_PAYWALL') === '1') || (Constants?.appOwnership === 'expo');
          setDiagInfo({ channel, runtime, paywallDisabled });
        } catch { }
        const raw = await AsyncStorage.getItem('diagnostic:lastError');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const msg = String(parsed?.message || 'A recent error was captured');
            setDiagToast({ visible: true, message: msg.slice(0, 140) });
          } catch {
            setDiagToast({ visible: true, message: 'A recent error was captured' });
          }
        }
      } catch { }
    })();

    // Cleanup auth listener on unmount
    return () => {
      console.log('[App.tsx] Main useEffect cleanup running.');
      authCleanupPromise.then(cleanup => {
        if (cleanup) {
          cleanup();
        }
      }).catch(err => {
        console.error('[App.tsx] Error during auth cleanup promise resolution:', err);
      });
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
      <SavedLooksProvider>
        <DebugErrorBoundary>
          {getEnv('EXPO_PUBLIC_DIAGNOSTICS') === '1' && diagInfo ? (
            <SafeAreaView pointerEvents="none" style={{ position: 'absolute', top: 6, left: 8, zIndex: 9999 }}>
              <GlassToast
                visible={true}
                icon="information-circle"
                message={`ch:${diagInfo.channel || 'n/a'} rv:${diagInfo.runtime || 'n/a'} paywallOff:${String(diagInfo.paywallDisabled)}`}
                duration={-1}
                onHide={() => { }}
              />
            </SafeAreaView>
          ) : null}
          <GlassToast
            visible={diagToast.visible}
            icon="alert-circle"
            message={diagToast.message}
            duration={2200}
            onHide={async () => {
              setDiagToast({ visible: false, message: '' });
              try {
                await AsyncStorage.removeItem('diagnostic:lastError');
              } catch { }
            }}
          />
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
              {__DEV__ ? (
                <Stack.Screen name="ConnectionTest" component={ConnectionTestScreen} />
              ) : null}
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
      </SavedLooksProvider>
    </GestureHandlerRootView>
  );
}
