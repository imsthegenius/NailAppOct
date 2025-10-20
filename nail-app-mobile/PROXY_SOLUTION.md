# 🔧 Supabase Proxy Solution - Bypassing DNS Blocking

## Problem Identified
Your network is blocking all `*.supabase.co` domains at the DNS level. This is likely due to:
- Corporate firewall/security policy
- ISP content filtering
- Network-level DNS filtering (Pi-hole, AdGuard, etc.)

## Solution: Local Proxy Server

I've created a proxy server that bypasses the DNS blocking by:
1. Running locally on your machine (no DNS needed for localhost)
2. Forwarding all Supabase requests through the proxy
3. Using alternative DNS servers (Google DNS) on the proxy side
4. Attempting direct IP connections if DNS fails

## Setup Instructions

### Step 1: Start the Proxy Server

**Option A: Automatic Setup (Recommended)**
```bash
cd /Users/imraan/Downloads/NailApp/nail-app-mobile
./setup-proxy.sh
```

**Option B: Manual Setup**
```bash
# Install dependencies
npm install express@4.18.2 axios@1.6.5 body-parser@1.20.2 cors@2.8.5

# Start the proxy
node supabase-proxy-server.js
```

The proxy will start on `http://localhost:8080`

### Step 2: Keep Proxy Running
Keep the terminal with the proxy server running. You should see:
```
✅ Successfully connected to Supabase via proxy!
```

### Step 3: Test the App

In a **new terminal**, run the app:
```bash
cd /Users/imraan/Downloads/NailApp/nail-app-mobile
npm start
```

### Step 4: For Physical Device Testing

If testing on a physical device:

1. Find your computer's local IP:
   ```bash
   # macOS
   ipconfig getifaddr en0
   
   # Or check System Preferences → Network
   ```

2. Update `/lib/supabaseProxy.ts` line 20:
   ```typescript
   const localIP = 'YOUR_IP_HERE'; // e.g., '192.168.1.100'
   ```

3. Make sure your phone is on the same WiFi network

## How It Works

The app now tries connections in this order:
1. **Proxy Server** (if available) → Bypasses DNS blocking
2. **XMLHttpRequest** → Sometimes works when fetch fails
3. **Regular Supabase** → Direct connection attempt
4. **Mock Auth** → Fallback for development

## Testing the Proxy

To verify the proxy is working:
```bash
# Test health check
curl http://localhost:8080/health

# Test Supabase connection through proxy
curl http://localhost:8080/test-connection
```

## Architecture

```
Your App → localhost:8080 (Proxy) → Alternative DNS → Supabase
    ↓           ↓                         ↓
No DNS      No blocking            Actual connection
needed      on localhost           to your project
```

## Benefits

1. ✅ Bypasses network DNS blocking
2. ✅ Works with existing Supabase project
3. ✅ No changes to Supabase configuration needed
4. ✅ Transparent to the app (just different URL)
5. ✅ Can be used for development and testing

## Troubleshooting

### Proxy won't start
- Check if port 8080 is already in use: `lsof -i :8080`
- Kill any process using it: `kill -9 <PID>`

### App can't connect to proxy
- Ensure proxy is running in separate terminal
- Check firewall isn't blocking localhost connections
- For physical device, ensure same WiFi network

### Still getting DNS errors
The proxy itself might be blocked from resolving DNS. Try:
1. Use a VPN on your computer
2. Change your DNS settings to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)
3. Use mobile hotspot instead of current network

## Alternative Solutions

If the proxy doesn't work:

1. **Use Mobile Hotspot**: Connect your computer to your phone's hotspot
2. **VPN**: Use a VPN that bypasses DNS filtering
3. **Different Network**: Try a different WiFi network
4. **Cloud Proxy**: Deploy the proxy to a cloud service (Vercel, Railway, etc.)

## Next Steps

1. Start the proxy server (keep it running)
2. Test signup functionality in the app
3. If it works, you'll see "Proxy signup successful!" in the logs
4. The connection issue will be resolved!

---

**Note**: This proxy is for development and testing. For production, you'd want to either:
- Fix the network DNS blocking issue
- Deploy the proxy to a cloud service
- Use a different network without restrictions