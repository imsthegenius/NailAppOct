import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import KeychainStorage from './keychainStorage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

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
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: KeychainStorage, // Using Keychain for secure token storage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});