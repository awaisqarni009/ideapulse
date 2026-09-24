# Vercel Deployment & Production Operations Runbook — IdeaPulse

**Authority:** `TASKS.md` [T-8.13 – T-8.18], `MEMORY.md` §2, `ARCHITECTURE.md` §6  
**Target Environment:** Vercel + Supabase Cloud (`tsdghmnmsyogjulpzgmu`)

---

## 1. Repository & Branch Configuration [T-8.13]

- **Git Provider:** GitHub / GitLab / Bitbucket
- **Production Branch:** `main` (Automatic deployment to production domain)
- **Preview Branches:** Any Pull Request / feature branch triggers an isolated Preview deployment.

### Vercel Project Setup:

1. Import repository into Vercel Dashboard.
2. Framework Preset: **Next.js**.
3. Root Directory: `./`.
4. Build Command: `next build` (or `npm run build`).
5. Output Directory: `.next`.

---

## 2. Environment Variables & Scoping [T-8.14]

Configure the following variables in the **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable                        | Target Environments                                                   | Description                        | Security Class                                           |
| :------------------------------ | :-------------------------------------------------------------------- | :--------------------------------- | :------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Production & Preview                                                  | URL of the Supabase project        | Public (bundled in client)                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production & Preview                                                  | Anon publishable API key           | Public (protected by RLS)                                |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Production only (Server)**                                          | Administrative service role key    | **Confidential / Server-only** (Never exposed to client) |
| `NEXT_PUBLIC_SITE_URL`          | Production: `https://ideapulse.dev`<br>Preview: `https://$VERCEL_URL` | Site root URL for redirects        | Public                                                   |
| `CRON_SECRET`                   | Production & Preview                                                  | 32-byte hex secret for cron routes | **Confidential / Server-only**                           |
| `IP_HASH_SALT_SEED`             | Production & Preview                                                  | 32-byte hex seed for rotating salt | **Confidential / Server-only**                           |

> ⚠️ **CRITICAL SECURITY NOTE:** `SUPABASE_SERVICE_ROLE_KEY` must **NEVER** have the `NEXT_PUBLIC_` prefix and must never be selected for client delivery. It is strictly consumed by `/api/cron/*` server route handlers.

---

## 3. Custom Domain & HTTPS Provisioning [T-8.15]

1. In Vercel Project Settings, navigate to **Domains**.
2. Add the custom domain:
   - Apex: `ideapulse.dev` (Redirect to `www.ideapulse.dev` or serve directly)
   - Canonical: `www.ideapulse.dev`
3. Configure DNS records at your DNS registrar:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
4. Vercel automatically generates and auto-renews Let's Encrypt SSL/TLS certificates with HTTP-to-HTTPS redirect.
5. In [Supabase Dashboard](https://supabase.com/dashboard/project/tsdghmnmsyogjulpzgmu/auth/url-configuration):
   - Set **Site URL** to `https://www.ideapulse.dev`.
   - Add redirect allowlist entries:
     - `https://www.ideapulse.dev/**`
     - `https://ideapulse.dev/**`
     - `https://*-ideapulse.vercel.app/**` (for preview test branches)

---

## 4. Security Headers Specification [T-8.16]

All responses served by Next.js include hardened HTTP security headers defined in [`next.config.mjs`](file:///d:/STUDY%206th%20SEM/WEB%20ENG/next.config.mjs):

- **`X-Frame-Options: DENY`**: Prevents clickjacking and embedding in iframes.
- **`X-Content-Type-Options: nosniff`**: Prevents MIME-type sniffing.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Limits referrer leakage to external domains.
- **`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`**: Enforces strict HTTPS for 2 years across all subdomains.
- **`Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`**: Blocks unnecessary device sensors and tracking.
- **`Content-Security-Policy`**: Restricts resource origins, restricts script evaluation, restricts frame ancestors, and isolates forms.

---

## 5. Vercel Cron Schedules [T-8.17]

[`vercel.json`](file:///d:/STUDY%206th%20SEM/WEB%20ENG/vercel.json) defines automated cron fallbacks alongside PostgreSQL's native `pg_cron`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/rotate-cycle",
      "schedule": "0 0 * * 1"
    },
    {
      "path": "/api/cron/purge-abuse",
      "schedule": "0 3 * * *"
    }
  ]
}
```

- **`0 0 * * 1`**: Weekly cycle rotation on Mondays at 00:00 UTC.
- **`0 3 * * *`**: Daily retention cleanup of abuse logs older than 180 days at 03:00 UTC.
- Both endpoints validate `Authorization: Bearer <CRON_SECRET>`.

---

## 6. Staging & Preview Isolation [T-8.18]

To guarantee that preview deployments cannot alter production cycle standings, votes, or balances:

1. Preview environments must be connected to a dedicated staging Supabase instance (`ideapulse-staging`) or local branch databases.
2. In Vercel Environment Variables, assign the staging Supabase URL and anon key specifically to the **Preview** environment scope.
3. Production credentials must remain restricted exclusively to the **Production** environment scope.
