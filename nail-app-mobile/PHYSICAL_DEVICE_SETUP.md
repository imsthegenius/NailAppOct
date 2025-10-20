# 📱 Physical Device Setup Guide - Dubai/UAE

## 🚨 The Issue
When running on a physical device in Dubai, the Cloudflare worker proxy might not be accessible due to:
1. Network restrictions on your mobile carrier
2. Cloudflare worker domain not properly configured
3. HTTPS/SSL certificate issues on physical devices

## ✅ Solution Options (Try in Order)

### Option 1: Use Expo Go with Tunnel (Easiest)
```bash
# Instead of regular npm start, use:
npx expo start --tunnel

# This creates a public tunnel that bypasses local network issues
# Scan the QR code with Expo Go app on your phone
```

### Option 2: Create Your Own Cloudflare Worker

1. **Go to** https://workers.cloudflare.com and sign in

2. **Create a new worker** named `nail-proxy` (different name from before)

3. **Copy this updated worker code:**

```javascript
export default {
  async fetch(request, env, ctx) {
    // Your Supabase project URL
    const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
    
    // Enhanced CORS headers for mobile apps
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    try {
      // Parse the incoming request
      const url = new URL(request.url);
      const path = url.pathname + url.search;
      
      // Build target URL
      const targetUrl = `${SUPABASE_URL}${path}`;
      
      // Clone and modify headers
      const headers = new Headers(request.headers);
      
      // Always set the API key
      headers.set('apikey', SUPABASE_ANON_KEY);
      headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
      
      // Get request body if exists
      let body = null;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.text();
      }
      
      // Forward the request to Supabase
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: body || undefined,
      });
      
      // Clone the response and add CORS headers
      const responseHeaders = new Headers(response.headers);
      Object.keys(corsHeaders).forEach(key => {
        responseHeaders.set(key, corsHeaders[key]);
      });
      
      // Return the modified response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Proxy error', 
          message: error.message,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
    }
  },
};
```

4. **Deploy the worker** and get your new URL

5. **Update** `/lib/supabase.ts` with your new worker URL:
```typescript
PROXY_URLS: [
  'https://nail-proxy.YOUR-USERNAME.workers.dev',  // Your new worker
  'https://supabase-proxy.imraan.workers.dev',     // Fallback
],
```

### Option 3: Use ngrok for Local Development

1. **Install ngrok:**
```bash
# If you have homebrew
brew install ngrok

# Or download from https://ngrok.com/download
```

2. **Start your Expo server:**
```bash
npm start
```

3. **In a new terminal, create ngrok tunnel:**
```bash
ngrok http 8081  # or whatever port Expo is using
```

4. **Use the ngrok URL** in Expo Go app

### Option 4: Direct Connection with VPN

1. **Install a VPN app** (Cloudflare WARP is free and works well)
   - iOS: https://apps.apple.com/app/id1423538627
   - Android: https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone

2. **Enable VPN** before opening the app

3. **Update** `/lib/supabase.ts` to use direct connection:
```typescript
// Temporarily use direct connection with VPN
const supabaseUrl = 'https://zxbdrhvmjuprsfocmnos.supabase.co';
```

### Option 5: Create .env File for Physical Device

1. **Create** `.env` file in project root:
```bash
# For physical device in Dubai
EXPO_PUBLIC_SUPABASE_URL=https://nail-proxy.YOUR-USERNAME.workers.dev
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

2. **Restart Expo:**
```bash
# Clear cache and restart
npx expo start -c
```

## 🔍 Debugging Steps

### 1. Check if Cloudflare Worker is Accessible

On your phone's browser, visit:
```
https://supabase-proxy.imraan.workers.dev/
```

If you see any response (even an error), the worker is accessible.

### 2. Check Network Logs

In the app, look for console logs showing:
- Platform (iOS/Android)
- Is Device (true for physical device)
- URL being used
- Fetch errors

### 3. Test with Postman/REST Client

From your phone, use a REST client app to test:
```
GET https://supabase-proxy.imraan.workers.dev/rest/v1/
Headers:
  apikey: [your-anon-key]
```

## 🚀 Quick Fix for Testing

If you need to test immediately without fixing the proxy:

1. **Use Local Network:**
```bash
# Find your computer's IP address
ifconfig | grep inet

# Start Expo with your IP
EXPO_PUBLIC_SUPABASE_URL=http://YOUR-COMPUTER-IP:54321 npm start

# Make sure phone is on same WiFi network
```

2. **Use Supabase Local Development:**
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# Use local URL in app
# http://YOUR-COMPUTER-IP:54321
```

## 📝 Permanent Solution

For production in Dubai/UAE:

1. **Use a custom domain** for your Cloudflare worker
2. **Set up a proper backend** API that proxies requests
3. **Consider using** Firebase as an alternative (not blocked in Dubai)
4. **Deploy to** a cloud provider with Middle East presence (AWS Bahrain, Azure UAE)

## 🔧 Current Configuration

Your app is configured to:
1. Try primary Cloudflare proxy
2. Fall back to secondary proxy if first fails
3. Add retry logic with exponential backoff
4. Include platform detection for debugging

## ❓ Still Not Working?

1. **Check mobile data vs WiFi** - Try both
2. **Check phone date/time** - Must be correct for HTTPS
3. **Clear Expo cache:**
   ```bash
   rm -rf .expo
   npm start --clear
   ```
4. **Try different worker name** - Some ISPs block common names
5. **Use mobile hotspot** from another phone

## 💡 Alternative: Use Production Build

Build a standalone app that bundles everything:

```bash
# For iOS (requires Mac)
eas build --platform ios --profile preview

# For Android  
eas build --platform android --profile preview

# This creates an APK/IPA that might handle connections better
```

---

**Note:** The Cloudflare worker approach should work, but physical devices in Dubai might have additional network restrictions. The tunnel or VPN approach is most reliable for development.