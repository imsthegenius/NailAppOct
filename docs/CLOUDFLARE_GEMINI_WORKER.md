# Cloudflare Gemini Proxy

This worker lets Expo Go call the real Gemini 2.5 image-editing API without crashing. The React Native app sends the photo + selections to the worker, the worker calls Gemini, and the edited image is returned to the device.

## 1. Deploy the Worker

1. Go to <https://workers.cloudflare.com>, create a service (HTTP handler).
2. In **Quick Edit**, paste the contents of `cloudflare/gemini-worker.js`.
3. Add an environment variable binding named `GEMINI_API_KEY` with your Google Gemini key.
4. Save and deploy.

You’ll get a URL such as:
```
https://nail-gemini.YOUR-SUBDOMAIN.workers.dev
```

## 2. Configure the Mobile App

Add the worker URL to your `.env` (already committed for reference):
```dotenv
EXPO_PUBLIC_GEMINI_PROXY_URL=https://nail-gemini.YOUR-SUBDOMAIN.workers.dev
```

Restart Metro (`npx expo start --clear`). Expo Go will now send transformations to the worker. Development builds / release builds will still use the direct SDK if the proxy is omitted.

## 3. How Requests Flow

```
Expo Go (React Native)
   ↓ POST /transform
Cloudflare Worker (gemini-worker.js)
   ↓ REST call to Google Gemini 2.5 Flash
Gemini edited image (base64)
   ↓
App shows transformed nails
```

The worker enforces CORS, so mobile, simulator, and web can reuse the same endpoint.

## 4. Troubleshooting

| Symptom | Fix |
| --- | --- |
| 502 from worker | Check the `GEMINI_API_KEY` binding and Cloudflare logs |
| 400 `imageBase64 required` | Ensure the app sends the full base64 string (we strip prefixes server-side) |
| Expo Go crashes | Confirm proxy URL is set and Metro restarted |
| Wrong colour | Verify the hex in the logs; the worker enforces the same prompt as the direct SDK |

Keep the proxy URL private (treat like an API endpoint). Rotate the Gemini key regularly and restrict it to the worker in Google Cloud if possible.
