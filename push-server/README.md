# Riffinity daily Web Push server (deployment required)

This is an **opt-in backend template**, not an active service. The current GitHub Pages app does not deliver scheduled background pushes until a server is deployed and its HTTPS URL is configured in `index.html` (`PUSH_API_URL`).

1. Create a private Supabase project and run `schema.sql` in SQL Editor. Keep service role credentials server-side only.
2. Run `npx web-push generate-vapid-keys` and copy the public/private keys to the server environment. Do **not** commit secrets.
3. Deploy this directory to an always-on Node.js hosting service with HTTPS, using `.env.example` as the environment variable list. `ALLOWED_ORIGIN` must be `https://kawahara-sketch.github.io` (origin only, without the path).
4. Set `PUSH_API_URL` in the frontend to the deployed HTTPS origin in a **separate PR**. Install/launch the iPhone Home Screen app, grant notifications and tap “定時通知を登録”.
5. Configure an authenticated scheduler to POST `/cron` at the start of every hour (UTC `0 * * * *`), with header `x-cron-secret: <CRON_SECRET>`. The server checks the current Japan hour and sends only to opted-in devices with no reported completed practice for the day. Scheduled runners can be delayed.
6. Verify with one test device and inspect server logs. Do not publish endpoint URLs, device tokens, Supabase service role keys, VAPID private keys, or cron secrets.

**Limits:** The app is currently localStorage-first. The backend only knows about a completed day **after the app syncs it**. Practice completed offline without later sync may still receive a reminder. The scheduler must be always available. The backend does not read task names, practice notes, or full history. There is no login, so subscriptions are managed with a per-installation random secret. This is a prototype; add rate limiting, retention/deletion policies, monitoring, and authentication before a public launch.
