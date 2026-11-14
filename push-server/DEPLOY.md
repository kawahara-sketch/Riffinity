# Deploy Riffinity reminders

## Prerequisites

The frontend is on GitHub Pages. GitHub Pages **cannot run a push server**. This folder is a deployable Node service, but it is not deployed by merging this PR.

1. Create a Supabase project. Run `schema.sql` in the SQL editor. Copy the **project URL** and **service role key** only into private server environment variables.
2. Generate VAPID keys locally with `npx web-push generate-vapid-keys`. Store the **private** key only in the server environment. The public key can be returned to the app by `/config`.
3. Deploy `push-server/` to a continuously running HTTPS Node host, using `Dockerfile` if your provider supports Docker. Set all variables from `.env.example`. Set `ALLOWED_ORIGIN=https://kawahara-sketch.github.io`.
4. Check `https://YOUR_HOST/health` responds with `{"ok":true}`. Never publish secret keys.
5. Add GitHub Actions repository secrets: `PUSH_SERVER_URL` = your HTTPS service origin, `PUSH_CRON_SECRET` = the same private secret as `CRON_SECRET` on your server. The included workflow runs hourly. GitHub scheduled workflows may be delayed and do not guarantee minute-precise delivery.
6. Make a separate frontend PR to set `PUSH_API_URL` to your HTTPS service origin. Then enable notifications and register from the iPhone Home Screen PWA.

## Testing

- Verify notification permission is granted in the installed PWA.
- Register one test device and inspect the server subscription table.
- Temporarily choose the next Japan-time hour in app settings, wait for the scheduler, and check delivery.
- Complete a 3-minute mission before the selected hour and confirm it suppresses that day's push **after successful sync**.
- Unsubscribe and confirm no further pushes.

## Important limitations

- GitHub Actions schedule may be delayed, and a sleeping/free host may not wake in time. Choose always-on hosting if reliability matters.
- If the app completes a mission offline and cannot sync, the server may still send a reminder.
- This is a prototype, not production-grade: add rate limits, monitoring, device data retention and privacy policy before inviting public users.
- Never place `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, or `CRON_SECRET` in frontend code or a public commit.
