/**
 * Shared Supabase Configuration
 * 
 * These are PUBLIC client-side keys, designed to be in your app.
 * Security comes from Row Level Security (RLS) policies, not hiding these keys.
 */

export const SUPABASE_URL = 'https://supabase-proxy.imraan.workers.dev';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YmRyaHZtanVwcnNmb2Ntbm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzE2MTgsImV4cCI6MjA3MjA0NzYxOH0.BObPAd45-McBQjcK9683S6wtuCZQYcFdauwpxKlr9o4';

export const SUPABASE_DIRECT_URL =
  process.env.EXPO_PUBLIC_SUPABASE_DIRECT_URL || 'https://zxbdrhvmjuprsfocmnos.supabase.co';

const preferredStorageUrl =
  process.env.EXPO_PUBLIC_SUPABASE_STORAGE_URL ||
  (SUPABASE_URL.includes('workers.dev') ? SUPABASE_DIRECT_URL : SUPABASE_URL);

export const SUPABASE_STORAGE_URL = preferredStorageUrl;
