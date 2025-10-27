import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { screenGradients } from '../theme/gradients';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { supabaseProxy, testProxyConnection } from '../lib/supabaseProxy';
import {
  consumePendingFullName,
  markOnboardingComplete,
  resolvePostAuthDestination,
} from '../lib/onboardingFlow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as AppleAuthentication from 'expo-apple-authentication';
import { isAppleSignInAvailable, signInWithApple } from '../lib/appleSignIn';
const CARD_BACKGROUND = 'rgba(255, 255, 255, 0.18)';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  useEffect(() => {
    isAppleSignInAvailable()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  const routeAfterLogin = async () => {
    const { status, needsLegal } = await resolvePostAuthDestination();

    if (needsLegal) {
      navigation.replace('LegalAcceptance', { status });
      return;
    }

    const pendingName = await consumePendingFullName();
    await markOnboardingComplete(pendingName ?? undefined);

    navigation.replace('Main');
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      Alert.alert('Missing Information', 'Please enter your email and password');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    setShowPassword(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (__DEV__) {
        console.log('Attempting login');
      }

      let loginResult: any = null;
      let loginError: any = null;
      let proxyWorked = false;

      try {
        const proxyAvailable = await testProxyConnection();
        if (proxyAvailable) {
          if (__DEV__) {
            console.log('Proxy is available, trying proxy login...');
          }
          const proxyResult = await supabaseProxy.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

          if (proxyResult.error) {
            loginError = proxyResult.error;
          } else {
            loginResult = proxyResult.data;
            proxyWorked = true;
            // IMPORTANT: copy proxy session to the main client for app-wide usage
            if (loginResult?.session?.access_token && loginResult?.session?.refresh_token) {
              await supabase.auth.setSession({
                access_token: loginResult.session.access_token,
                refresh_token: loginResult.session.refresh_token,
              });
            }
          }
        }
      } catch (proxyError: any) {
        if (__DEV__) {
          console.log('Proxy attempt failed:', proxyError.message);
        }
      }

      if (!proxyWorked) {
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve({ timeout: true }), 5000);
        });

        const supabasePromise = supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        try {
          const result: any = await Promise.race([supabasePromise, timeoutPromise]);

          if (result?.timeout) {
            loginError = { message: 'Connection timed out. Please check your internet connection.' };
          } else if (result?.error) {
            loginResult = result.data;
            loginError = result.error;
          } else {
            loginResult = result.data;
          }
        } catch (raceError: any) {
          loginError = { message: raceError?.message || 'Network error. Please try again.' };
        }
      }

      if (loginError) {
        const message = loginError.message || loginError;

        if (message?.includes('Invalid login credentials') || message?.includes('Invalid email or password')) {
          Alert.alert('Login Failed', 'Incorrect email or password. Please try again.');
        } else if (message?.includes('Email not confirmed')) {
          Alert.alert('Email Not Verified', 'Please check your email and verify your account first.');
        } else {
          Alert.alert('Login Error', message || 'Unable to log in. Please try again.');
        }
        return;
      }

      if (loginResult?.session || loginResult?.user) {
        if (__DEV__ && !loginResult?.session) {
          Alert.alert(
            'Development Mode 🔧',
            'Logged in offline mode. The app is running without server connection.',
            [{ text: 'Continue', onPress: () => routeAfterLogin() }]
          );
        } else {
          // Ensure our storage client is synced via auth listener
          await routeAfterLogin();
        }
        return;
      }

      Alert.alert('Login Error', 'Unable to log in. Please try again.');
    } catch (error: any) {
      if (__DEV__) {
        console.error('Unexpected error:', error);
      }
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert('Enter Email', 'Please enter your email address first');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: 'https://nailglow.app/reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Check Your Email', 'We sent you a password reset link. Please check your inbox.', [{ text: 'OK' }]);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (appleLoading) {
      return;
    }

    if (!appleAvailable) {
      Alert.alert('Sign in with Apple', 'Sign in with Apple is not available on this device.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAppleLoading(true);
    const result = await signInWithApple();
    setAppleLoading(false);

    if (result.success) {
      await routeAfterLogin();
      return;
    }

    if (result.reason === 'cancelled') {
      return;
    }

    Alert.alert(
      'Sign in with Apple',
      result.message ?? 'We were unable to sign you in with Apple. Please try again shortly.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={screenGradients.auth}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('AuthLanding'))}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to try new colours, revisit saved looks, and keep your favourites synced across devices.
          </Text>

          <View style={styles.card}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formSection}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.8}>
                  <Text style={styles.link}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Your password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.92}
              accessibilityRole="button"
              accessibilityLabel="Log in"
              accessibilityHint="Submits your email and password to sign in to NailGlow."
            >
              {loading ? (
                <ActivityIndicator color="#2A0B20" />
              ) : (
                <Text style={styles.primaryButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Need an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.replace('Signup')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Create account"
              accessibilityHint="Opens the sign-up form so you can create your NailGlow account."
            >
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {appleAvailable && (
            <View style={styles.appleButtonWrapperBottom}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={24}
                style={styles.appleButton}
                onPress={handleAppleLogin}
              />
              {appleLoading && (
                <View style={styles.appleSpinnerOverlay} pointerEvents="none">
                  <ActivityIndicator color="#000" />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSection: { flexShrink: 1 },
  appleButtonWrapper: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  appleButtonWrapperBottom: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
  },
  appleButton: {
    height: 48,
    width: '100%',
  },
  appleSpinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 28,
  },
  card: {
    marginTop: 12,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
  },
  formSection: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  link: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 42,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2A0B20',
  },
  disabledButton: {
    opacity: 0.6,
  },
  footer: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    marginRight: 6,
  },
  footerLink: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signInButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
  },
  signInText: {
    color: '#2A0B20',
    fontSize: 17,
    fontWeight: '600',
  },
});
