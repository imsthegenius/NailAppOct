import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import KeychainStorage from './keychainStorage';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_DIRECT_URL } from './supabaseConfig';

// Only log in development
if (__DEV__) {
  console.log('===========================================');
  console.log('🔧 SUPABASE CONFIGURATION');
  console.log('-------------------------------------------');
  console.log('Platform:', Platform.OS);
  console.log('Is Physical Device:', Constants.isDevice !== false);
  console.log('URL:', SUPABASE_URL);
  console.log('Using Cloudflare Proxy: ✅');
  console.log('===========================================');
}

// Create Supabase client
const AUTH_STORAGE_KEY = 'sb-nailapp-auth';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: KeychainStorage, // Using Keychain for secure token storage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: AUTH_STORAGE_KEY,
  },
});

// Separate client for Storage to avoid proxying binary uploads through Cloudflare
export const supabaseStorage = createClient(SUPABASE_DIRECT_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: KeychainStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: AUTH_STORAGE_KEY,
  },
});

export async function syncStorageAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  // Ensure the direct client uses the same session
  const { data: storageSession } = await supabaseStorage.auth.getSession();
  if (!storageSession?.session || storageSession.session.user.id !== session.user.id) {
    await supabaseStorage.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }
}

// Keep the storage client in sync automatically when auth state changes
// This reduces races where a UI checks session immediately after login.
supabase.auth.onAuthStateChange(async (event, session) => {
  try {
    if (session?.access_token && session?.refresh_token) {
      await supabaseStorage.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } else {
      await supabaseStorage.auth.signOut();
    }
  } catch {}
});
