import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

// Use Cloudflare Worker proxy for regions with DNS blocking
const PROXY_URL = SUPABASE_URL; // We're already using the proxy URL

// Proxy configuration logged only in development
if (__DEV__ && PROXY_URL) {
  console.log('[Proxy] Using proxy URL');
}

// Create a custom fetch that routes through our proxy
class ProxyFetch {
  async fetch(url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> {
    const urlString = url.toString();
    
    // Check if this is a Supabase URL
    if (urlString.includes('supabase.co')) {
      // Replace the Supabase URL with our proxy URL
      const supabaseHost = new URL(SUPABASE_URL!).host;
      const proxyUrl = urlString.replace(
        supabaseHost,
        new URL(PROXY_URL).host
      );
      
      if (__DEV__) {
        console.log(`[ProxyFetch] Using proxy`);
      }
      
      // Add necessary headers
      const headers: any = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      try {
        const response = await global.fetch(proxyUrl, {
          ...options,
          headers,
        });
        
        if (__DEV__) {
          console.log(`[ProxyFetch] Response status: ${response.status}`);
        }
        return response;
      } catch (error: any) {
        if (__DEV__) {
          console.error(`[ProxyFetch] Error:`, error.message);
        }
        throw error;
      }
    }
    
    // For non-Supabase URLs, use regular fetch
    return global.fetch(urlString, options);
  }
}

const proxyFetch = new ProxyFetch();

// Create Supabase client that uses the Cloudflare proxy
export const supabaseProxy = createClient(
  PROXY_URL, // Use Cloudflare proxy URL
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  }
);

// Test function to verify proxy connection
export async function testProxyConnection(): Promise<boolean> {
  try {
    // Cloudflare worker might not have /health endpoint, just check if it responds
    const response = await fetch(PROXY_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Proxy response status:', response.status);
    // Even a 404 means the proxy is reachable
    return response.status > 0;
  } catch (error) {
    console.error('Proxy connection failed:', error);
    return false;
  }
}

// Helper function to get local IP for physical device setup
export function getSetupInstructions(): string {
  return `
╔════════════════════════════════════════════════════╗
║          Supabase Proxy Setup Instructions         ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  1. Install proxy dependencies:                   ║
║     cd nail-app-mobile                           ║
║     npm install express axios body-parser cors    ║
║                                                    ║
║  2. Start the proxy server:                      ║
║     node supabase-proxy-server.js                ║
║                                                    ║
║  3. For physical device testing:                 ║
║     - Find your computer's IP: ifconfig          ║
║     - Update localIP in app.json:                ║
║       "extra": { "localIP": "YOUR_IP_HERE" }    ║
║                                                    ║
║  4. Restart the Expo app                         ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `;
}