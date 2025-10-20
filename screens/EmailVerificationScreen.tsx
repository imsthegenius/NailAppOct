import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../App';

const CARD_BACKGROUND = 'rgba(255, 255, 255, 0.18)';

type EmailVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'EmailVerification'>;
type EmailVerificationRouteProp = RouteProp<RootStackParamList, 'EmailVerification'>;

type Props = {
  navigation: EmailVerificationNavigationProp;
  route: EmailVerificationRouteProp;
};

export default function EmailVerificationScreen({ navigation, route }: Props) {
  const email = route.params?.email?.toLowerCase() ?? '';
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenMail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL('message:');
    } catch {
      try {
        await Linking.openURL('mailto:');
      } catch (linkError) {
        if (__DEV__) {
          console.warn('Unable to open mail app', linkError);
        }
      }
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Enter a valid email to resend verification.');
      return;
    }
    setSending(true);
    setError(null);
    setMessage(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        throw resendError;
      }

      setMessage('Verification email sent. Check your inbox.');
    } catch (err: any) {
      const friendly = err?.message ?? 'Unable to resend verification email. Please try again.';
      setError(friendly);
    } finally {
      setSending(false);
    }
  };

  const handleGoToLogin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace('Login');
  };

  const handleChangeEmail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace('Signup');
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

      <View style={styles.contentWrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            {email ? 'We sent a confirmation link to' : 'We sent a confirmation link to your email.'}
          </Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
          <Text style={styles.helper}>
            Open your inbox and tap the link to activate your account. When you’re done, come
            back and log in.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenMail} activeOpacity={0.9}>
            <Text style={styles.primaryButtonText}>Open email app</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, sending && styles.disabledButton]}
            onPress={handleResend}
            disabled={sending}
            activeOpacity={0.9}
          >
            {sending ? (
              <ActivityIndicator color="#E70A5A" />
            ) : (
              <Text style={styles.secondaryButtonText}>Resend verification email</Text>
            )}
          </TouchableOpacity>

          {message && <Text style={styles.feedback}>{message}</Text>}
          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.footerActionButton}
              onPress={handleGoToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.footerLink}>Already verified? Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerActionButton}
              onPress={handleChangeEmail}
              activeOpacity={0.8}
            >
              <Text style={styles.footerLink}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  email: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 18,
  },
  primaryButton: {
    marginTop: 28,
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
  secondaryButton: {
    marginTop: 16,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  feedback: {
    marginTop: 16,
    color: '#C9F4C1',
    fontSize: 14,
  },
  error: {
    marginTop: 16,
    color: '#FFD1D1',
    fontSize: 14,
  },
  footerActions: {
    marginTop: 28,
  },
  footerActionButton: {
    marginBottom: 12,
  },
  footerLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
