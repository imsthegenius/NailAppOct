import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';
import { supabaseProxy, testProxyConnection } from '../lib/supabaseProxy';
import { signUpWithXHR } from '../lib/supabaseXHR';
import {
  markOnboardingComplete,
  resolvePostAuthDestination,
  storePendingFullName,
} from '../lib/onboardingFlow';

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
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2A0B20', '#E70A5A']}
        start={{ x: 0.1, y: 0.9 }}
        end={{ x: 0.9, y: 0.1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
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
                style={styles.input}
                placeholder="Alex Rivera"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

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
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Minimum 6 characters"
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
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.92}
            >
              {loading ? (
                <ActivityIndicator color="#2A0B20" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')} activeOpacity={0.8}>
              <Text style={styles.footerLink}>Log in</Text>
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
    paddingBottom: 32,
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
    color: 'rgba(255,255,255,0.88)',
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
});
