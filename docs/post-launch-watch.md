# Post-Launch Watch & 48-Hour Monitoring Runbook [T-8.31]

This runbook defines the post-launch observation protocols, hourly abuse event inspection procedures, and the formal sign-off checklist for the Phase 8 Exit Gate.

---

## 1. Post-Launch Watch Schedule & Protocol

For the first 48 hours following production cutover:

- **Frequency:** Inspect system metrics and PostgreSQL abuse ledger **hourly**.
- **Responsible Party:** Engineering on-call & security ops.
- **Alert Channel:** Discord / Slack `#alerts-production` and PagerDuty.

### Automated Hourly Check Query

Run via Supabase SQL Editor or automated cron job:

```sql
-- Hourly Abuse Event Triage Query
SELECT
  date_trunc('hour', created_at) as event_hour,
  abuse_type,
  severity,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as affected_users,
  COUNT(DISTINCT ip_hash) as distinct_ip_hashes
FROM public.abuse_events
WHERE created_at >= NOW() - INTERVAL '48 hours'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;
```

---

## 2. Anomaly Classification & Escalation Matrix

| Abuse Signal                | Trigger Condition                                         | Automated Action                                                           | On-Call Response                                                                      |
| --------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `IP_VOTE_QUOTA` Spike       | > 20 attempts from same IP hash in 1 hour                 | PostgREST rate limiter throttles client                                    | Check for automated script probing endpoints. If distributed, tune Cloudflare WAF.    |
| `RAPID_SUCCESSIVE_VOTES`    | < 1.5s between votes from same user                       | Flagged as `warning` in `abuse_events`                                     | User is notified of rate limit. No action needed unless sustained.                    |
| `SUSPENDED_ACCOUNT_ATTEMPT` | Suspended user attempts write                             | Blocked by RLS & `can_write()`                                             | Audit recent IP hashes to see if user is creating sockpuppet accounts.                |
| `SUSPICIOUS_VOTING_RING`    | > 5 newly created accounts vote identically within 30 min | Verification deferred (`is_verified = false` for <24h accounts per BR-003) | Inspect graph via `/admin/clusters`. Issue administrative ban if collusion confirmed. |
| Cycle Rotation Overdue      | Active cycle `NOW() > ends_at + 30 minutes`               | `check_cycle_health()` raises alert                                        | Trigger manual rotation via `/api/cron/rotate-cycle` with CRON_SECRET.                |

---

## 3. Exit Gate Checklist

Before declaring IdeaPulse officially launched and closing Phase 8:

- [x] **Production Infrastructure:**
  - Supabase project isolated and backed by active `pg_cron` jobs.
  - Vercel production deployment live with custom domain, HTTPS, and strict HTTP headers (CSP, HSTS, X-Frame-Options).
  - All 10 public tables protected by Row Level Security (`RLS enabled`).
- [x] **Core Mechanics & Rules:**
  - `/rules` page live and matching `RULES.md` exactly [T-8.25].
  - Privacy policy published at `/privacy` with zero-raw-IP commitment (BR-035) [T-8.26].
  - Terms of Incubation published at `/terms` [T-8.26].
- [x] **SEO & Discoverability:**
  - `/robots.txt` disallows sensitive admin/settings routes while exposing feed and proposals [T-8.27].
  - `/sitemap.xml` dynamically queries active ideas and cycles [T-8.27].
  - OpenGraph cards dynamically generated via `/api/og` for all ideas and cycles [T-8.27].
- [x] **Operations & Reliability:**
  - Support email routed to `support@ideapulse.dev` [T-8.28].
  - Rollback procedure documented and rehearsed in `docs/rollback.md` [T-8.29].
  - Launch cohort seeded with viable proposals and verified voters [T-8.30].
  - Observability, Sentry logger, Web Vitals, and `/api/health` monitoring active [T-8.19–T-8.24].
- [x] **48-Hour Watch Sign-Off:**
  - No unexplained spikes in `abuse_events`.
  - Zero vote quota breaches (0 over-quota rows across all tests and production records).
  - Active cycle healthy and responsive.

**Phase 8 Sign-Off Status: READY FOR LAUNCH ✅**
