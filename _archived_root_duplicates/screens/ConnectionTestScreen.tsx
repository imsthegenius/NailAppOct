import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function ConnectionTestScreen() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
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
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Connection Diagnostics</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Testing connectivity to Supabase through Cloudflare proxy
          </Text>
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
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: '#1976d2',
    fontSize: 14,
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