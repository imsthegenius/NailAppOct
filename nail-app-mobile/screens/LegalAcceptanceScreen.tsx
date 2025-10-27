import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';
import {
  acceptCurrentLegalDocuments,
  consumePendingFullName,
  fetchLegalAcceptance,
  legalAcceptanceRequired,
  markOnboardingComplete,
  type LegalAcceptanceStatus,
} from '../lib/onboardingFlow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const CARD_BACKGROUND = 'rgba(255, 255, 255, 0.2)';

type LegalAcceptanceNavigationProp = StackNavigationProp<RootStackParamList, 'LegalAcceptance'>;
type LegalAcceptanceRouteProp = RouteProp<RootStackParamList, 'LegalAcceptance'>;

type Props = {
  navigation: LegalAcceptanceNavigationProp;
  route: LegalAcceptanceRouteProp;
};

export default function LegalAcceptanceScreen({ navigation, route }: Props) {
  const initialStatus = route.params?.status ?? null;
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LegalAcceptanceStatus | null>(initialStatus);
  const [privacyChecked, setPrivacyChecked] = useState(initialStatus?.privacy_policy_accepted ?? false);
  const [termsChecked, setTermsChecked] = useState(initialStatus?.terms_of_service_accepted ?? false);
  const [error, setError] = useState<string | null>(null);

  const completeAndContinue = useCallback(async () => {
    const pendingName = await consumePendingFullName();
    await markOnboardingComplete(pendingName ?? undefined);
    navigation.replace('Main');
  }, [navigation]);

  const hydrateStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    const latest = await fetchLegalAcceptance();

    if (!latest || !legalAcceptanceRequired(latest)) {
      await completeAndContinue();
      return;
    }

    setStatus(latest);
    setPrivacyChecked(latest.privacy_policy_accepted);
    setTermsChecked(latest.terms_of_service_accepted);
    setLoading(false);
  }, [completeAndContinue]);

  useEffect(() => {
    if (initialStatus && !legalAcceptanceRequired(initialStatus)) {
      completeAndContinue();
      return;
    }
    hydrateStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenPrivacy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PrivacyPolicy');
  };

  const handleOpenTerms = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('TermsOfService');
  };

  const handleAccept = async () => {
    if (!status) {
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);

    const accepted = await acceptCurrentLegalDocuments(status);
    if (!accepted) {
      setLoading(false);
      setError('Something went wrong while recording your acceptance. Please try again.');
      return;
    }

    await completeAndContinue();
  };

  const readyToContinue = privacyChecked && termsChecked;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#2A0B20', '#E70A5A']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Before you start</Text>
        <Text style={styles.headerSubtitle}>
          We need a quick confirmation that you’re okay with our policies.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {loading && !status ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.loaderText}>Checking your account…</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.agreementRow,
              styles.agreementSpacing,
              privacyChecked && styles.agreementRowActive,
            ]}
            onPress={() => setPrivacyChecked((prev) => !prev)}
            activeOpacity={0.85}
          >
            <View style={[styles.checkbox, privacyChecked && styles.checkboxChecked]}>
              {privacyChecked && <Ionicons name="checkmark" size={18} color="#2A0B20" />}
            </View>
            <View style={styles.agreementContent}>
              <Text style={styles.agreementTitle}>Privacy Policy</Text>
              <Text style={styles.agreementDescription}>
                Learn how we handle your photos and personal data.
              </Text>
              <TouchableOpacity onPress={handleOpenPrivacy} activeOpacity={0.8}>
                <Text style={styles.link}>Read full policy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.agreementRow,
              styles.agreementSpacingLast,
              termsChecked && styles.agreementRowActive,
            ]}
            onPress={() => setTermsChecked((prev) => !prev)}
            activeOpacity={0.85}
          >
            <View style={[styles.checkbox, termsChecked && styles.checkboxChecked]}>
              {termsChecked && <Ionicons name="checkmark" size={18} color="#2A0B20" />}
            </View>
            <View style={styles.agreementContent}>
              <Text style={styles.agreementTitle}>Terms of Service</Text>
              <Text style={styles.agreementDescription}>
                Understand what you can expect from NailGlow and what we expect from you.
              </Text>
              <TouchableOpacity onPress={handleOpenTerms} activeOpacity={0.8}>
                <Text style={styles.link}>Read full terms</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, (!readyToContinue || loading) && styles.disabledButton]}
          disabled={!readyToContinue || loading}
          onPress={handleAccept}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>I agree and continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  loaderText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  agreementRowActive: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderColor: 'rgba(255,255,255,0.38)',
  },
  agreementSpacing: {
    marginBottom: 18,
  },
  agreementSpacingLast: {
    marginBottom: 0,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  agreementContent: {
    flex: 1,
  },
  agreementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  agreementDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 6,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textDecorationLine: 'underline',
  },
  error: {
    color: '#FFD1D1',
    fontSize: 14,
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2A0B20',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
