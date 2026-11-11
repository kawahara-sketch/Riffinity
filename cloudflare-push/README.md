# Cloudflare Push engine (experimental)

This is an **alternative** to `push-server/`; do not deploy both. It is not yet connected to the PWA. No live notifications are enabled by merging this PR.

## Setup

1. Create a Cloudflare account and a D1 database: `npx wrangler d1 create riffinity-push`.
2. Replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.toml` with the returned ID.
3. Run `npm install` in `cloudflare-push/` and `npm test`.
4. Run `npx wrangler d1 execute riffinity-push --remote --file=./schema.sql`.
5. Generate VAPID keys using `npx web-push generate-vapid-keys`. Store `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` as Worker secrets with `npx wrangler secret put NAME`. Subject should be a `mailto:` contact.
6. Deploy with `npm run deploy`. Verify `/health` and `/config`.
7. **Before production:** test that the Node `web-push` dependency functions correctly in the deployed Workers runtime with `nodejs_compat`. This compatibility is **not verified** by this PR; adapt to a WebCrypto-compatible implementation if required.
8. A follow-up frontend PR will implement syncing `hour`, `enabled`, `completedDay`, `freezes`, and `streak` and set the Worker URL.

## Security and limitations

- Device bearer tokens are hashed before storage. Treat the raw token as a secret. All updates require matching endpoint and token.
- D1 stores only notification subscriptions and summary state, not detailed practice history.
- One notification per JST day is claimed before sending to prevent duplicates. If sending fails transiently, the notification is **not automatically retried**; reliability monitoring can be added later.
- State is synchronized only when the app is online and executes its sync. Offline practice may cause an outdated notification.
- The hourly cron is approximate; Workers scheduled execution and Apple delivery can be delayed.
- There is no production rate limiting or comprehensive observability yet; do not publish this API for general multi-user service without hardening.
- Cloudflare free-tier availability, limits, and compatibility must be checked before relying on this for daily reminders.
