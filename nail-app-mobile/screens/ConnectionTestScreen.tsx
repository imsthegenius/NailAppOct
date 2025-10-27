import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConnectionTestScreen() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [summary, setSummary] = useState<{ status: 'ok' | 'warn' | 'error'; message: string; hint?: string } | null>(null);
  const resolvedSummary = summary ?? {
    status: testing ? 'warn' as const : 'ok' as const,
    message: testing ? 'Running diagnostics…' : 'Ready to run diagnostics',
    hint: testing
      ? 'Checking Cloudflare proxy, Supabase, and auth reachability.'
      : 'Tap “Run Tests Again” to capture a fresh connection snapshot.',
  };
  const infoBoxStyle =
    resolvedSummary.status === 'error'
      ? styles.infoBoxError
      : resolvedSummary.status === 'warn'
        ? styles.infoBoxWarn
        : styles.infoBoxOk;
  const infoIconName: keyof typeof Ionicons.glyphMap =
    resolvedSummary.status === 'error'
      ? 'alert-circle'
      : resolvedSummary.status === 'warn'
        ? 'warning'
        : 'checkmark-circle';
  const infoIconColor =
    resolvedSummary.status === 'error'
      ? '#FF453A'
      : resolvedSummary.status === 'warn'
        ? '#FF9F0A'
        : '#34C759';

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    setSummary(null);
    const results: any[] = [];

    // Test 1: Direct fetch to Cloudflare worker
    try {
      const startTime = Date.now();
      const response = await fetch('https://supabase-proxy.imraan.workers.dev/', {
        method: 'GET',
      });
      const duration = Date.now() - startTime;
      
      results.push({
        test: 'Cloudflare Worker Direct',
        success: response.ok,
        status: response.status,
        duration: `${duration}ms`,
        details: response.ok ? '✅ Worker is accessible' : `❌ Status: ${response.status}`,
      });
    } catch (error: any) {
      results.push({
        test: 'Cloudflare Worker Direct',
        success: false,
        error: error.message,
        details: '❌ Cannot reach worker',
      });
    }

    // Test 2: Supabase health check
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('colors').select('id').limit(1);
      const duration = Date.now() - startTime;
      
      results.push({
        test: 'Supabase Query',
        success: !error,
        duration: `${duration}ms`,
        details: error ? `❌ ${error.message}` : '✅ Database connected',
      });
    } catch (error: any) {
      results.push({
        test: 'Supabase Query',
        success: false,
        error: error.message,
        details: '❌ Query failed',
      });
    }

    // Test 3: Auth test
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const duration = Date.now() - startTime;
      
      results.push({
        test: 'Supabase Auth',
        success: !error,
        duration: `${duration}ms`,
        details: data?.session ? '✅ Session active' : '✅ No session (normal)',
      });
    } catch (error: any) {
      results.push({
        test: 'Supabase Auth',
        success: false,
        error: error.message,
        details: '❌ Auth check failed',
      });
    }

    // Test 4: Check alternative worker
    try {
      const startTime = Date.now();
      const response = await fetch('https://nail-proxy.imraan.workers.dev/', {
        method: 'GET',
      });
      const duration = Date.now() - startTime;
      
      results.push({
        test: 'Alternative Worker',
        success: response.ok,
        status: response.status,
        duration: `${duration}ms`,
        details: response.ok ? '✅ Backup worker accessible' : `❌ Status: ${response.status}`,
      });
    } catch (error: any) {
      results.push({
        test: 'Alternative Worker',
        success: false,
        error: error.message,
        details: '❌ Backup not available',
      });
    }

    setTestResults(results);

    const failures = results.filter((result) => !result.success);
    const workerFailure = results.some(
      (result) => result.test.toLowerCase().includes('worker') && !result.success
    );
    const supabaseFailure = results.some(
      (result) => result.test.toLowerCase().includes('supabase') && !result.success
    );
    const authFailure = results.some(
      (result) => result.test.toLowerCase().includes('auth') && !result.success
    );

    if (failures.length === 0) {
      setSummary({
        status: 'ok',
        message: 'All connectivity checks passed.',
        hint: 'Reviewers can reach the Cloudflare proxy and Supabase services.',
      });
    } else if (workerFailure && supabaseFailure) {
      setSummary({
        status: 'error',
        message: 'Both the Cloudflare proxy and Supabase API are unreachable.',
        hint: 'Switch networks or enable Cloudflare WARP, then run these diagnostics again.',
      });
    } else if (workerFailure) {
      setSummary({
        status: 'warn',
        message: 'The Cloudflare proxy is unreachable.',
        hint: 'Ask reviewers to enable a VPN or share the fallback connection instructions.',
      });
    } else if (supabaseFailure) {
      setSummary({
        status: 'warn',
        message: 'Supabase queries failed while the proxy responded.',
        hint: 'Check Supabase status and reopen the app once the service is restored.',
      });
    } else if (authFailure) {
      setSummary({
        status: 'warn',
        message: 'Auth test did not complete successfully.',
        hint: 'Sign out and back in before retrying, or contact support if the issue persists.',
      });
    } else {
      setSummary({
        status: 'warn',
        message: 'Some checks returned warnings.',
        hint: 'Review the detailed results below and share them with support if needed.',
      });
    }

    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Connection Diagnostics</Text>
        
        <View style={[styles.infoBox, infoBoxStyle]}>
          <Ionicons name={infoIconName} size={22} color={infoIconColor} style={styles.infoIcon} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>{resolvedSummary.message}</Text>
            {resolvedSummary.hint ? (
              <Text style={styles.infoText}>{resolvedSummary.hint}</Text>
            ) : null}
          </View>
        </View>

        {testing && <Text style={styles.loading}>Running tests...</Text>}

        {testResults.map((result, index) => (
          <View key={index} style={[styles.testCard, result.success ? styles.success : styles.failure]}>
            <Text style={styles.testName}>{result.test}</Text>
            <Text style={styles.testDetails}>{result.details}</Text>
            {result.duration && (
              <Text style={styles.testDuration}>Time: {result.duration}</Text>
            )}
            {result.error && (
              <Text style={styles.testError}>Error: {result.error}</Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.retryButton}
          onPress={runTests}
          disabled={testing}
        >
          <Text style={styles.retryButtonText}>
            {testing ? 'Testing...' : 'Run Tests Again'}
          </Text>
        </TouchableOpacity>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>If tests fail:</Text>
          <Text style={styles.helpText}>
            1. Check if https://supabase-proxy.imraan.workers.dev/ loads in your phone's browser
          </Text>
          <Text style={styles.helpText}>
            2. Make sure you're connected to WiFi (not cellular)
          </Text>
          <Text style={styles.helpText}>
            3. Try using a VPN (Cloudflare WARP recommended)
          </Text>
          <Text style={styles.helpText}>
            4. Restart the Expo Go app
          </Text>
          <Text style={styles.helpText}>
            5. If the proxy remains offline, email support@nailglow.app and include a screenshot of these diagnostics.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoBoxOk: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderColor: 'rgba(52, 199, 89, 0.35)',
  },
  infoBoxWarn: {
    backgroundColor: 'rgba(255, 159, 10, 0.12)',
    borderColor: 'rgba(255, 159, 10, 0.35)',
  },
  infoBoxError: {
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    borderColor: 'rgba(255, 69, 58, 0.35)',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  infoText: {
    color: '#3a3a3c',
    fontSize: 14,
    lineHeight: 20,
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  testCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  success: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  failure: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  testDetails: {
    fontSize: 14,
    color: '#666',
  },
  testDuration: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  testError: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 5,
  },
  retryButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 10,
  },
});
