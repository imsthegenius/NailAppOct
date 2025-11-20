# Cloudflare Tunnel for Expo Go (Dubai-ready)

Expo’s ngrok tunnel is unreliable on UAE networks. The following workflow uses `cloudflared` to expose Metro so Expo Go can always reach your dev server.

## Prerequisites

- `cloudflared` CLI installed (`brew install cloudflared` on macOS, [docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) for other OS).
- Expo CLI / Metro already working with `npx expo start --lan`.

## Usage

1. Start Metro using LAN mode:
   ```bash
   cd nail-app-mobile
   npx expo start --lan
   ```
   Leave this terminal running.

2. In a second terminal tab run the tunnel helper:
   ```bash
   cd nail-app-mobile
   npm run cf:tunnel
   ```
   `cloudflared` prints output similar to:
   ```
   INF | Route propagating, try cloudflared tunnel list
   INF | + https://orange-bird.trycloudflare.com
   INF | + exp://purple-lizard.trycloudflare.com
   ```

3. Open Expo Go ➝ tap “Enter URL manually” ➝ paste the `exp://…` URL. The HTTPS URL also works if you prefer the web interface.

4. Keep both terminals open while developing. Restarting Metro requires restarting the tunnel command as well.

## Tips

- Combine with the Gemini proxy by setting `EXPO_PUBLIC_GEMINI_PROXY_URL` to your workers.dev URL. The tunnel handles device connectivity; the worker handles Google’s geo restrictions.
- If you need a permanent hostname, create a named tunnel in Cloudflare Zero Trust and replace `npm run cf:tunnel` with `cloudflared tunnel run <name>`. The quick-tunnel command above is usually sufficient for dev sessions.
