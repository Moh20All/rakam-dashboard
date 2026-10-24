# Warshati — ورشتي · Website & admin

Next.js app that serves:

- `/` — the public landing page (`public/landing.html`, FR / AR / EN)
- `/guide` — the user guide (`public/guide.html`)
- `/dashboard` — the private admin: licenses, customers, feedback and crash reports

## Environment variables

| Name | What |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server only — never put it in the desktop app) |
| `DASHBOARD_PASSWORD` | Admin password |
| `SESSION_SECRET` | Optional. Long random string used to sign the login cookie. If unset, it is derived from the password and the service key, so changing the password signs everyone out. |

## Database

Run `supabase/dashboard-upgrade.sql` once in the Supabase SQL editor. It adds the columns the
dashboard uses (last seen, prices, notes, feedback status), the login-attempts table, and locks
the tables so the public key inside the desktop app can only send feedback and crash reports.

"Last seen" and "version in use" come from the `license` Edge Function in the Warshati app repo
(`supabase/functions/license`), which records each successful license check.

## Develop

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
```
