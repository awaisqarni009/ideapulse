# Disaster Recovery & Backup Runbook — IdeaPulse

**Authority:** `ARCHITECTURE.md`, `TASKS.md` [T-8.12], `RULES.md`  
**Target Environment:** Production Supabase (`tsdghmnmsyogjulpzgmu`)

---

## 1. Backup Strategy

IdeaPulse maintains a multi-layered data protection and backup model:

### 1.1 Automated Supabase Backups

- **Daily Physical Backups:** Managed automatically by Supabase Cloud at 00:00 UTC with 7-day minimum retention.
- **WAL Archiving & PITR:** Point-In-Time Recovery allows restoring database state to any specific minute within the retention window.

### 1.2 On-Demand Logical Backups (CLI)

Before executing database migrations, major release sweeps, or administrative interventions, capture an immediate logical dump:

```bash
# Export complete schema and public data
supabase db dump --db-url "$DATABASE_URL" -f "backups/ideapulse_backup_$(date +%Y%m%d_%H%M%S).sql"

# Export data-only (for seed/audit reconciliation)
supabase db dump --data-only --db-url "$DATABASE_URL" -f "backups/ideapulse_data_$(date +%Y%m%d_%H%M%S).sql"

# Export roles and permissions
supabase db dump --role-only --db-url "$DATABASE_URL" -f "backups/ideapulse_roles_$(date +%Y%m%d_%H%M%S).sql"
```

---

## 2. Restore Procedure

### Scenario A: Rollback via Supabase Dashboard (PITR / Snapshot)

1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/tsdghmnmsyogjulpzgmu).
2. Navigate to **Project Settings** → **Database** → **Backups**.
3. Select the desired restore snapshot or enter the target recovery timestamp (UTC).
4. Click **Restore Backup**. The project transitions to `RESTORING` status and returns to `ACTIVE_HEALTHY` once complete.

### Scenario B: Manual Logical Restore (psql)

To restore into a fresh database or test replica:

```bash
# 1. Connect to Postgres host
export PGPASSWORD="$DB_PASSWORD"
psql -h "db.tsdghmnmsyogjulpzgmu.supabase.co" -U postgres -d postgres -f backup.sql
```

---

## 3. Post-Restore Verification Checklist

After any database restore, run the following verification steps before redirecting live traffic:

1. **Verify Critical Table Constraints:**

   ```sql
   -- Assert ideas_id_author_uk exists (REQUIRED for self-vote prevention FK constraint)
   SELECT conname, contype
   FROM pg_constraint
   WHERE conrelid = 'public.ideas'::regclass AND conname = 'ideas_id_author_uk';

   -- Assert votes foreign key to ideas(id, author_id)
   SELECT conname
   FROM pg_constraint
   WHERE conrelid = 'public.votes'::regclass AND conname = 'votes_idea_author_fk';
   ```

2. **Verify Row Level Security Status:**

   ```sql
   -- Confirm all public tables have rowsecurity = true
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

3. **Verify pg_cron Scheduled Jobs:**

   ```sql
   -- Confirm rotate_cycle and purge_old_abuse_events jobs are present and active
   SELECT jobid, jobname, schedule, active FROM cron.job;
   ```

4. **Verify Active Cycle Status:**

   ```sql
   -- Confirm exactly one cycle is 'active'
   SELECT id, cycle_number, status, starts_at, ends_at
   FROM public.cycles
   WHERE status = 'active';
   ```

5. **Execute Automated RLS Verification Suite:**
   ```bash
   npm run test tests/production-rls.test.ts
   ```

---

## 4. Emergency Escalation & Contacts

- **Platform Status:** [Supabase Status Page](https://status.supabase.com)
- **Supabase Support:** Dashboard ticket under Project ID `tsdghmnmsyogjulpzgmu`
- **Internal Security Contact:** security@ideapulse.dev
