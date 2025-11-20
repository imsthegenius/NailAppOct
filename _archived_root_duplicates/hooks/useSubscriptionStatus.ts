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

        const { data, error } = await supabase
          .from('users')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (!error && data?.subscription_status) {
          if (mounted) setStatus(data.subscription_status as SubscriptionStatus);
        } else if (mounted) {
          setStatus('free');
        }
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

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { status, loading };
}
