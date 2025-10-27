import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PAYWALL_DISABLED } from '../lib/paywall';

export type SubscriptionStatus = 'free' | 'premium_monthly' | 'premium_yearly';

export function useSubscriptionStatus() {
  const [status, setStatus] = useState<SubscriptionStatus>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (PAYWALL_DISABLED) {
      setStatus('premium_monthly');
      setLoading(false);
      return;
    }

    let mounted = true;

    const planFromProductId = (productId?: string): SubscriptionStatus => {
      if (!productId) return 'free';
      const id = productId.toLowerCase();
      if (id.includes('year') || id.includes('annual')) return 'premium_yearly';
      if (id.includes('month')) return 'premium_monthly';
      return 'premium_monthly';
    };

    const fetchFromRevenueCat = async (): Promise<SubscriptionStatus | null> => {
      try {
        // lazy import to avoid crashing in environments without the native module
        const mod: any = await import('react-native-purchases');
        const Purchases = mod?.default ?? mod;
        const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID ?? 'premium';
        const info = await Purchases.getCustomerInfo();
        const activeMap = info?.entitlements?.active || {};
        const entitlement = activeMap?.[ENTITLEMENT_ID] ?? Object.values(activeMap)[0];
        if (entitlement) return planFromProductId(entitlement.productIdentifier);
        return 'free';
      } catch {
        return null;
      }
    };

    const fetchStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) {
            setStatus('free');
            setLoading(false);
          }
          return;
        }

        const [{ data, error }, rcStatus] = await Promise.all([
          supabase
          .from('users')
          .select('subscription_status')
          .eq('id', user.id)
          .single(),
          fetchFromRevenueCat(),
        ]);

        const supaStatus = !error && data?.subscription_status ? (data.subscription_status as SubscriptionStatus) : 'free';
        const effective = (rcStatus && rcStatus !== 'free') ? rcStatus : supaStatus;
        if (mounted) setStatus(effective);
      } catch (err) {
        if (mounted) {
          setStatus('free');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchStatus();
    });

    // Listen to RC customer info updates for immediate UI refresh after purchase
    let removeRcListener: (() => void) | null = null;
    (async () => {
      try {
        const mod: any = await import('react-native-purchases');
        const Purchases = mod?.default ?? mod;
        const listener = Purchases.addCustomerInfoUpdateListener(async () => {
          if (!mounted) return;
          const rc = await fetchFromRevenueCat();
          if (rc && rc !== 'free') setStatus(rc);
        });
        removeRcListener = () => Purchases.removeCustomerInfoUpdateListener(listener);
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      try {
        removeRcListener?.();
      } catch {}
    };
  }, []);

  return { status, loading };
}
