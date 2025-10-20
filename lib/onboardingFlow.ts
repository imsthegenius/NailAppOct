import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const PENDING_FULL_NAME_KEY = '@nailglow/pending_full_name';

export type LegalAcceptanceStatus = {
  privacy_policy_accepted: boolean;
  terms_of_service_accepted: boolean;
  current_privacy_version: string | null;
  current_terms_version: string | null;
  all_accepted: boolean;
};

export async function storePendingFullName(name: string) {
  try {
    await AsyncStorage.setItem(PENDING_FULL_NAME_KEY, name);
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to store pending full name', error);
    }
  }
}

export async function consumePendingFullName() {
  try {
    const value = await AsyncStorage.getItem(PENDING_FULL_NAME_KEY);
    if (value) {
      await AsyncStorage.removeItem(PENDING_FULL_NAME_KEY);
      return value;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to consume pending full name', error);
    }
  }
  return null;
}

export async function fetchLegalAcceptance(): Promise<LegalAcceptanceStatus | null> {
  try {
    const { data, error } = await supabase.rpc('check_legal_acceptance');
    if (error) {
      throw error;
    }
    return data as LegalAcceptanceStatus | null;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to fetch legal acceptance status', error);
    }
    return null;
  }
}

export function legalAcceptanceRequired(status: LegalAcceptanceStatus | null) {
  if (!status) {
    return false;
  }
  return status.all_accepted !== true;
}

export async function acceptCurrentLegalDocuments(status?: LegalAcceptanceStatus | null) {
  try {
    const currentStatus = status ?? (await fetchLegalAcceptance());
    if (!currentStatus) {
      return false;
    }

    const tasks: Promise<unknown>[] = [];

    if (!currentStatus.privacy_policy_accepted && currentStatus.current_privacy_version) {
      tasks.push(
        Promise.resolve(
          supabase.rpc('accept_legal_agreement', {
            p_agreement_type: 'privacy_policy',
            p_version: currentStatus.current_privacy_version,
          })
        ).then(({ error }) => {
          if (error) {
            throw error;
          }
        })
      );
    }

    if (!currentStatus.terms_of_service_accepted && currentStatus.current_terms_version) {
      tasks.push(
        Promise.resolve(
          supabase.rpc('accept_legal_agreement', {
            p_agreement_type: 'terms_of_service',
            p_version: currentStatus.current_terms_version,
          })
        ).then(({ error }) => {
          if (error) {
            throw error;
          }
        })
      );
    }

    if (tasks.length === 0) {
      return true;
    }

    const results = await Promise.allSettled(tasks);
    return results.every((result) => result.status === 'fulfilled');
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to accept legal documents', error);
    }
    return false;
  }
}

export async function markOnboardingComplete(fullName?: string | null) {
  try {
    await supabase.rpc('mark_onboarding_complete', {
      p_full_name: fullName ?? null,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to mark onboarding complete', error);
    }
  }
}

export async function resolvePostAuthDestination() {
  const status = await fetchLegalAcceptance();
  const needsLegal = legalAcceptanceRequired(status);
  return {
    status,
    needsLegal,
  };
}
