import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

// Check if Supabase is reachable
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const supabaseUrl = SUPABASE_URL;
    const supabaseKey = SUPABASE_ANON_KEY;
    
    const isUsingProxy = supabaseUrl.includes('workers.dev');
    
    if (isUsingProxy) {
      // For proxy, just check if the proxy is reachable
      const response = await fetch(supabaseUrl + '/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      // Proxy returns 401 for unauthorized which is expected
      return response.status === 401 || response.ok;
    } else {
      // Direct connection check
      const response = await fetch(supabaseUrl + '/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    }
  } catch (error) {
    console.log('Connection check failed:', error);
    return false;
  }
}

export async function getConnectionStatus(): Promise<{
  supabase: boolean;
  internet: boolean;
  message: string;
}> {
  try {
    // Check general internet
    const internetCheck = await fetch('https://www.google.com', { method: 'HEAD' })
      .then(() => true)
      .catch(() => false);
    
    // Check Supabase
    const supabaseCheck = await checkSupabaseConnection();
    
    // Check if using proxy
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://supabase-proxy.imraan.workers.dev';
    const isUsingProxy = supabaseUrl.includes('workers.dev');
    
    let message = '';
    if (!internetCheck) {
      message = 'No internet connection';
    } else if (!supabaseCheck && !isUsingProxy) {
      message = 'Cannot reach Supabase (network may be blocking it)';
    } else if (isUsingProxy) {
      message = 'Connected via Cloudflare proxy (Dubai workaround)';
    } else {
      message = 'All systems operational';
    }
    
    return {
      internet: internetCheck,
      supabase: supabaseCheck,
      message,
    };
  } catch (error) {
    return {
      internet: false,
      supabase: false,
      message: 'Connection check failed',
    };
  }
}