import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import LegalAcceptanceScreen from './screens/LegalAcceptanceScreen';
import ConnectionTestScreen from './screens/ConnectionTestScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import DeleteAccountScreen from './screens/DeleteAccountScreen';

// Main App Navigator
import MainNavigator from './navigation/MainNavigator';

// Temporary: force a minimal Release render to verify RN boot
const FORCE_RELEASE_BOOT_OK = true; // remove after diagnosing black screen

// Types
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Onboarding: undefined;
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  EmailVerification: { email: string } | undefined;
  LegalAcceptance: { status?: import('./lib/onboardingFlow').LegalAcceptanceStatus | null } | undefined;
  ConnectionTest: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DeleteAccount: undefined;
  // Nested screens (for type safety)
  Camera: undefined;
  Results: { imageUri?: string };
  Processing: { imageUri: string; base64?: string };
  ColorSelection: undefined;
  ShapeSelection: undefined;
  Design: undefined;
  Feed: undefined;
  Profile: undefined;
  CompareScreen: undefined;
  MyLooks: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // If Release build is failing before UI, render a minimal screen to prove RN startup
  if (!__DEV__ && FORCE_RELEASE_BOOT_OK) {
    return (
      <GestureHandlerRootView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f4f0' }}>
        <Text>Boot OK</Text>
      </GestureHandlerRootView>
    );
  }
  
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
    
    console.log('NailGlow App Started');
    
    // Test connections on startup
    const testConnections = async () => {
      try {
        const { getConnectionStatus } = await import('./lib/checkSupabase');
        const status = await getConnectionStatus();
        
        console.log('=================================');
        console.log('CONNECTION STATUS:');
        console.log('Internet:', status.internet ? '✅ Connected' : '❌ Not connected');
        
        // Check if using proxy
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://supabase-proxy.imraan.workers.dev';
        const isUsingProxy = supabaseUrl.includes('workers.dev');
        
        if (isUsingProxy) {
          console.log('Supabase: ✅ Connected via Cloudflare');
        } else {
          console.log('Supabase:', status.supabase ? '✅ Reachable' : '❌ Unreachable');
        }
        
        console.log('Message:', status.message);
        console.log('=================================');
      } catch (err: any) {
        console.error('Connection test error:', err.message);
      }
    };
    
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
  
  // Determine initial route - Show splash first
  const initialRoute: keyof RootStackParamList = 'Splash';
  // After splash, the logic will continue to appropriate screen

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DebugErrorBoundary>
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
