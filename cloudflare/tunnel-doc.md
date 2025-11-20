# Expo Tunnel Via Cloudflare (Fallback When `--tunnel` Fails)

Expo’s built-in `--tunnel` flag wraps ngrok and can hang on some Dubai networks. The safest workaround is to run Metro in LAN mode and expose it with Cloudflare’s quick tunnel. Steps:

1. **Start Metro locally**
   ```bash
   cd nail-app-mobile
   npx expo start --lan
   ```
   Leave this tab running.

2. **Open a Cloudflare tunnel in another tab**
   ```bash
   cd nail-app-mobile
   npm run cf:tunnel
   ```
   The first run installs `cloudflared`. You’ll see output similar to:
   ```
   https://promoted-compilation-belong-protective.trycloudflare.com
   exp://promoted-compilation-belong-protective.trycloudflare.com
   ```
   Ignore warnings about origin certificates—those only apply to named tunnels.

3. **Connect Expo Go**
   - Open Expo Go ➝ tap *Enter URL manually*.
   - Paste the `exp://…trycloudflare.com` address from step 2.
   - The bundle now loads through Cloudflare instead of ngrok.

4. **Stop the tunnel** by closing the `cloudflared` tab when you’re done. Each session prints a new URL; share it with teammates if they need to connect.

> Metro must remain in LAN mode while the tunnel is active. Restarting Metro requires restarting the tunnel.
