import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { supabaseProxy, testProxyConnection } from '../lib/supabaseProxy';
import { signUpWithXHR } from '../lib/supabaseXHR';
import {
  markOnboardingComplete,
  resolvePostAuthDestination,
  storePendingFullName,
} from '../lib/onboardingFlow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { screenGradients } from '../theme/gradients';

// Auth color palette for better contrast on pink gradient backgrounds
const AUTH_COLORS = {
  title: '#E70A5A',           // Magenta - high contrast on pink
  subtitle: '#555555',        // Darker gray for better readability
  label: '#444444',           // Dark gray labels - clear on pink
  inputText: '#333333',       // Dark gray for readability
  inputPlaceholder: '#999999', // Medium gray placeholder - more visible
  footerText: '#555555',      // Darker gray for footer
  link: '#E70A5A',            // Magenta for links
};

const CARD_BACKGROUND = 'rgba(255, 255, 255, 0.18)';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

type Props = {
  navigation: SignupScreenNavigationProp;
};

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Refs for keyboard flow
  const nameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);

  // Haptic feedback on button press-in for snappier feel
  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields to continue');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Weak Password', 'For your security, please use at least 6 characters');
      return;
    }

    setLoading(true);
    setShowPassword(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let signupResult: any = null;
      let signupError: any = null;

      if (__DEV__) {
        console.log('Attempting signup');
      }

      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ timeout: true }), 5000);
      });

      let proxyWorked = false;

      try {
        const proxyAvailable = await testProxyConnection();
        if (proxyAvailable) {
          if (__DEV__) {
            console.log('Proxy is available, trying proxy signup...');
          }

          const proxyResult = await supabaseProxy.auth.signUp({
            email: trimmedEmail,
            password: trimmedPassword,
            options: {
              data: {
                name: trimmedName,
              },
            },
          });

          if (proxyResult.error) {
            signupError = proxyResult.error;
          } else {
            signupResult = proxyResult.data;
            proxyWorked = true;
          }
        }
      } catch (proxyError: any) {
        if (__DEV__) {
          console.log('Proxy attempt failed:', proxyError.message);
        }
      }

      if (!proxyWorked && !signupResult) {
        if (__DEV__) {
          console.log('Trying XMLHttpRequest method...');
        }

        try {
          const xhrResult = await signUpWithXHR(trimmedEmail, trimmedPassword, { name: trimmedName });
          if (xhrResult.error) {
            signupError = { message: xhrResult.error };
          } else {
            signupResult = xhrResult.data;
          }
        } catch (xhrError: any) {
          if (__DEV__) {
            console.log('XHR failed:', xhrError.message);
          }
        }
      }

      if (!signupResult) {
        if (__DEV__) {
          console.log('Falling back to direct Supabase signup');
        }

        try {
          const supabasePromise = supabase.auth.signUp({
            email: trimmedEmail,
            password: trimmedPassword,
            options: {
              data: {
                name: trimmedName,
              },
            },
          });

          const result: any = await Promise.race([supabasePromise, timeoutPromise]);
          if (result?.timeout) {
            signupError = { message: 'Connection timed out. Please try again.' };
          } else if (result?.error) {
            signupError = result.error;
            signupResult = result.data;
          } else {
            signupResult = result.data;
          }
        } catch (supabaseError: any) {
          signupError = supabaseError;
        }
      }

      if (!signupResult && !signupError) {
        signupError = { message: 'Unable to connect to server. Please check your internet connection.' };
      }

      if (signupError) {
        const message = signupError.message || signupError;

        if (message?.includes('already registered') || message?.includes('already exists')) {
          Alert.alert('Account Exists', 'This email is already registered. Please sign in instead.', [
            { text: 'Sign In', onPress: () => navigation.replace('Login') },
            { text: 'Cancel', style: 'cancel' },
          ]);
        } else {
          Alert.alert('Signup Error', message || 'Failed to create account. Please try again.');
        }
        return;
      }

      if (signupResult?.user || signupResult?.id) {
        const isMockSignup = signupResult.user?.id?.startsWith?.('mock_');
        const hasSession = Boolean(signupResult.session || signupResult.access_token);

        if (isMockSignup) {
          navigation.replace('LegalAcceptance');
          return;
        }

        if (!hasSession) {
          await storePendingFullName(trimmedName);
          navigation.replace('EmailVerification', { email: trimmedEmail });
        } else {
          await markOnboardingComplete(trimmedName);
          const { status, needsLegal } = await resolvePostAuthDestination();
          if (needsLegal) {
            navigation.replace('LegalAcceptance', { status });
          } else {
            navigation.replace('Main');
          }
        }
        return;
      }

      Alert.alert('Signup Error', 'Unable to create account. Please try again.');
    } catch (error: any) {
      if (__DEV__) {
        console.error('Unexpected signup error:', error);
      }
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Save your favourite looks, track colours you love, and pick up right where you left off.
          </Text>

          <View style={styles.card}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                ref={nameRef}
                style={[styles.input, focusedField === 'name' && styles.inputFocused]}
                placeholder="Alex Rivera"
                placeholderTextColor={AUTH_COLORS.inputPlaceholder}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="words"
                autoFocus={true}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                ref={emailRef}
                style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                placeholder="you@email.com"
                placeholderTextColor={AUTH_COLORS.inputPlaceholder}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, styles.passwordInput, focusedField === 'password' && styles.inputFocused]}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={AUTH_COLORS.inputPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
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
              onPress={handleSignup}
              onPressIn={handlePressIn}
              disabled={loading}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Create account"
              accessibilityHint="Submits your details to create a NailGlow account."
            >
              {loading ? (
                <ActivityIndicator color="#2A0B20" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              onPressIn={handlePressIn}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Log in"
              accessibilityHint="Switch to the login form to use an existing account."
            >
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 12,
    paddingBottom: 32,
    flexGrow: 1,
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
    color: AUTH_COLORS.title,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: AUTH_COLORS.subtitle,
    marginBottom: 28,
  },
  card: {
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
    color: AUTH_COLORS.label,
    marginBottom: 10,
  },
  input: {
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 16,
    color: AUTH_COLORS.inputText,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  inputFocused: {
    borderColor: 'rgba(142, 142, 147, 0.6)',
    borderWidth: 1.5,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 54,
  },
  eyeButton: {
    position: 'absolute',
    right: 4,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: AUTH_COLORS.footerText,
    fontSize: 15,
    marginRight: 6,
  },
  footerLink: {
    color: AUTH_COLORS.link,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
