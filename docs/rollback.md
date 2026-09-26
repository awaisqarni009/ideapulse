# Rollback Procedure & Rehearsal Runbook [T-8.29]

This runbook outlines the exact sequence for rolling back application code, environment variables, and handling database schema considerations in the event of an unhealthy production deployment.

---

## 1. Application Layer Rollback (Vercel)

Vercel provides atomic, immutable deployment artifacts. Rolling back restores the previous stable build within seconds without rebuilding.

### Method A: Vercel Dashboard (Instant 1-Click Rollback)

1. Navigate to [vercel.com](https://vercel.com) > **IdeaPulse** project > **Deployments**.
2. Identify the last known healthy deployment (e.g. marked with a green checkmark prior to the failing release).
3. Click the three dots (`...`) menu on the target deployment row and select **Instant Rollback**.
4. Confirm the rollback. Vercel will immediately re-route edge traffic (`ideapulse.dev`) to the previous deployment artifact.

### Method B: Vercel CLI (Command Line Rollback)

```bash
# List recent deployments
vercel ls

# Roll back to specific deployment URL / hash
vercel rollback <deployment-hash> --yes
```

---

## 2. Database Schema Rollback Policy

Per `ARCHITECTURE.md` and ADR-001, IdeaPulse follows **Zero-Downtime, Additive-Only Database Migrations**:

1. **Additive Compatibility:**
   - Database migrations must be forward- and backward-compatible with at least $N-1$ and $N$ versions of the Next.js application.
   - Never remove or rename an active column in the same migration that alters application code.
2. **Column Deprecation Flow (Expand & Contract):**
   - _Phase 1 (Expand):_ Add new column as nullable or with safe defaults. Deploy code writing to both.
   - _Phase 2 (Migrate):_ Backfill existing data.
   - _Phase 3 (Contract):_ Stop reading old column; drop old column only after 2+ successful releases.
3. **If a Migration Fails Application Logic:**
   - **Do not blindly run destructive `DROP` scripts** on live production data.
   - If an RPC function was modified erroneously, re-apply the prior function definition from git history (`git show HEAD~1:supabase/migrations/...`) using Supabase SQL Editor or `supabase db push`.

---

## 3. Disaster Recovery & PITR (Point-In-Time Recovery)

If a catastrophic data incident occurs (e.g., accidental bulk deletion):

1. Navigate to **Supabase Dashboard** > **Project Settings** > **Database** > **Backups**.
2. Select **Point in Time Recovery (PITR)**.
3. Choose the exact timestamp prior to the incident (e.g. `2026-09-24 14:30:00 UTC`).
4. Restore to a new project or clone for verification before pointing production DNS.

---

## 4. Rehearsal Verification Checklist

Prior to production launch, perform a simulated deployment rollback:

- [x] **Pre-Check:** `/api/health` reports status `200` (`"status": "healthy"`).
- [x] **Deploy Canary:** Push preview branch and verify preview deployment succeeds.
- [x] **Simulate Reversion:** Trigger instant rollback on test preview domain.
- [x] **Post-Reversion Verification:**
  - Verify `/api/health` is responsive within < 300ms.
  - Verify `/feed` loads active cycle ideas without 500 errors.
  - Verify Supabase RLS policies remain intact and active.
- [x] **Audit Log:** Record rollback event and root cause in incident log.
