# 🚀 Cloudflare Workers Setup - Bypass Supabase Blocking in Dubai

## Why This Works
- ✅ `supabase.com` is accessible in Dubai
- ❌ `*.supabase.co` (project URLs) are DNS-blocked
- 💡 Cloudflare Workers acts as a proxy to reach your existing Supabase database

## Step-by-Step Setup (10 minutes)

### 1️⃣ Create Free Cloudflare Account
1. Go to https://workers.cloudflare.com
2. Click "Sign up"
3. Verify your email

### 2️⃣ Create Your Worker
1. Click **"Create a Service"**
2. Service name: `supabase-proxy` (or any name)
3. Select: **"HTTP Handler"**
4. Click **"Create Service"**

### 3️⃣ Add the Proxy Code
1. Click **"Quick Edit"** button
2. Delete all existing code
3. Copy and paste this code:

```javascript
export default {
  async fetch(request, env, ctx) {
    // Your Supabase project URL (replace with your values)
    const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
    const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
    
    // CORS headers for mobile app
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Get the path from request
      const url = new URL(request.url);
      const path = url.pathname + url.search;
      
      // Build target URL
      const targetUrl = `${SUPABASE_URL}${path}`;
      
      // Copy headers and add API key
      const headers = new Headers(request.headers);
      if (!headers.get('apikey')) {
        headers.set('apikey', SUPABASE_ANON_KEY);
      }
      
      // Forward the request
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' 
          ? await request.text() 
          : undefined,
      });
      
      // Return response with CORS headers
      const newResponse = new Response(response.body, response);
      Object.keys(corsHeaders).forEach(key => {
        newResponse.headers.set(key, corsHeaders[key]);
      });
      
      return newResponse;
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },
};
```

4. Click **"Save and Deploy"**

### 4️⃣ Get Your Worker URL
After deployment, you'll see your worker URL:
```
https://supabase-proxy.YOUR-SUBDOMAIN.workers.dev
```

Copy this URL - you'll need it!

### 5️⃣ Update Your App

Open `/lib/supabase.ts` and change:

```typescript
// OLD (blocked in Dubai)
const supabaseUrl = 'https://zxbdrhvmjuprsfocmnos.supabase.co';

// NEW (works through Cloudflare)
const supabaseUrl = 'https://supabase-proxy.YOUR-SUBDOMAIN.workers.dev';
```

### 6️⃣ Test It!
```bash
npm start
```

Now try signing up - it should work! 🎉

## How It Works

```
Your App (Dubai) → Cloudflare (Global) → Supabase (Your Database)
       ↑                    ↑                      ↑
   Not blocked      Acts as proxy         Your existing data
```

## Important Points

### ✅ What This Does:
- Routes your app traffic through Cloudflare
- Bypasses DNS blocking in Dubai
- Uses your EXISTING Supabase database
- All your SQL tables remain unchanged
- Free for 100,000 requests/day

### ❌ What This Doesn't Do:
- Does NOT create a new database
- Does NOT move your data
- Does NOT require re-running SQL
- Does NOT change your Supabase setup

## Testing the Worker

After deployment, test your worker:
```bash
# Test if worker is running
curl https://supabase-proxy.YOUR-SUBDOMAIN.workers.dev/rest/v1/

# Should return something (even if it's an auth error)
```

## Gemini Image Proxy

Need to route Gemini image editing through Cloudflare as well? Deploy the worker in `cloudflare/gemini-worker.js` and set `EXPO_PUBLIC_GEMINI_PROXY_URL` (see `docs/CLOUDFLARE_GEMINI_WORKER.md`). Expo Go can then call the real Gemini API without native crashes.

## Troubleshooting

### Worker returns 522 error
- Cloudflare can't reach Supabase
- Try redeploying the worker

### Worker returns 401 Unauthorized
- This is GOOD! It means the connection works
- The app will handle authentication

### App still can't connect
1. Check you updated the URL in `/lib/supabase.ts`
2. Restart the app completely
3. Clear app cache

## Free Tier Limits
- 100,000 requests per day (plenty for development)
- 10ms CPU time per request
- Works globally

## Production Considerations
For production, consider:
1. Cloudflare paid plan for more requests
2. Custom domain for the worker
3. Rate limiting and security rules

## Alternative: Quick VPN Test
If you want to verify everything works before setting up Cloudflare:
1. Download Cloudflare WARP (free): https://1.1.1.1/
2. Turn on WARP
3. Run the app with original Supabase URL
4. If it works with VPN, Cloudflare Workers will definitely work

---

**Next Steps:**
1. Set up Cloudflare Worker (10 minutes)
2. Update the app with worker URL
3. Test signup/login
4. Continue development! 🚀

**Note:** This is a permanent solution that will work as long as Cloudflare is accessible in Dubai (which it is).
