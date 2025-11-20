import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/revenuecat';

export default function UpgradeScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthly, setMonthly] = useState<any>(null);
  const [yearly, setYearly] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const offering = await getOfferings();
        const available = offering?.availablePackages ?? [];
        // Pick the monthly/yearly by identifier naming if present
        const m = available.find((p: any) => /month/i.test(p.identifier)) || available.find((p: any) => /month/i.test(p.product?.identifier)) || null;
        const y = available.find((p: any) => /(year|annual)/i.test(p.identifier)) || available.find((p: any) => /(year|annual)/i.test(p.product?.identifier)) || null;
        setMonthly(m || null);
        setYearly(y || null);
      } catch (e: any) {
        setError('Unable to load plans');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePurchase = async (pkg: any) => {
    try {
      setError(null);
      setLoading(true);
      await purchasePackage(pkg);
      navigation.goBack();
    } catch (e: any) {
      // Purchase cancelled or failed
      if (e?.userCancelled) return;
      setError('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      await restorePurchases();
      navigation.goBack();
    } catch (e) {
      setError('Restore failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Unlock all colors and nail shapes</Text>
        {error && <Text style={{ color: '#c00', marginBottom: 10 }}>{error}</Text>}

        <View style={[styles.plan, (!monthly && !yearly) && { opacity: 0.6 }]}> 
          {loading ? (
            <Text style={{ color: '#666' }}>Loading plans…</Text>
          ) : (
            <>
              {monthly && (
                <TouchableOpacity onPress={() => handlePurchase(monthly)}>
                  <Text style={styles.planTitle}>Monthly</Text>
                  <Text style={styles.planPrice}>{monthly.product?.priceString || '£9.99'} / month</Text>
                </TouchableOpacity>
              )}
              {yearly && (
                <TouchableOpacity style={{ marginTop: 16 }} onPress={() => handlePurchase(yearly)}>
                  <Text style={styles.planTitle}>Yearly</Text>
                  <Text style={styles.planPrice}>{yearly.product?.priceString || '£29.99'} / year</Text>
                </TouchableOpacity>
              )}
              {!monthly && !yearly && (
                <Text style={{ color: '#666' }}>No products available</Text>
              )}
            </>
          )}
        </View>

        <TouchableOpacity style={[styles.closeButton, { backgroundColor: '#999' }]} onPress={handleRestore}>
          <Text style={styles.closeButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.closeButton, { marginTop: 12 }]} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  plan: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  planPrice: {
    fontSize: 16,
    color: '#666',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#333',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});
