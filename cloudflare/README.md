# Cloudflare Worker & Tunnel Setup

These instructions make the duplicated repo self-sufficient: you can deploy the Gemini proxy worker and spin up a Cloudflare tunnel that Expo Go can reach from Dubai.

## 1. Requirements

- Cloudflare account with Workers enabled.
- `wrangler` CLI (installed automatically via `npx`).
- `cloudflared` CLI (`brew install cloudflared` on macOS, or download from <https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/>).

## 2. Deploy the Gemini Worker

1. From `nail-app-mobile/` run:
   ```bash
   npm run cf:login
   ```
2. Set the Gemini key as a Cloudflare secret:
   ```bash
   npm run cf:secret
   # enter GEMINI_API_KEY when prompted
   ```
3. Deploy the worker:
   ```bash
   npm run cf:deploy
   ```
4. Wrangler prints the worker URL (e.g. `https://nail-gemini.<subdomain>.workers.dev`). Copy it and add it to `.env`:
   ```env
   EXPO_PUBLIC_GEMINI_PROXY_URL=https://nail-gemini.<subdomain>.workers.dev
   ```
5. Restart Metro (`npx expo start --clear`). All Gemini traffic now goes through Cloudflare.

> The worker source lives in `cloudflare/gemini-worker.js`; `cloudflare/wrangler.toml` points wrangler at that file.

## 3. Launch a Cloudflare Tunnel for Metro

This replaces Expo’s ngrok tunnel and works reliably from Dubai.

1. Start Expo in LAN mode (new terminal tab):
   ```bash
   cd nail-app-mobile
   npx expo start --lan
   ```
2. Once Metro shows the QR code, start the tunnel in another tab:
   ```bash
   npm run cf:tunnel
   ```
   Cloudflared prints a public URL such as `https://purple-lizard.trycloudflare.com`.
3. In Expo Go tap “Enter URL manually” and paste the `exp://` (or HTTPS) URL from cloudflared.

Every time you restart Metro you can reuse the same command; the tunnel automatically forwards to port 8081.

## 4. Optional: Local Worker Dev

To test the worker locally without deploying:

```bash
npm run cf:dev
```

Wrangler starts a local worker at `http://127.0.0.1:8787`. Point `EXPO_PUBLIC_GEMINI_PROXY_URL` there while debugging.

---

Keep the Cloudflare credentials outside version control and re-run `npm run cf:secret` whenever you rotate the Gemini API key.
