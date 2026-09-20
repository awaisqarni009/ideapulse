-- =====================================================================
-- 000_extensions.sql
-- =====================================================================
create extension if not exists "pgcrypto"  with schema extensions;  -- gen_random_uuid()
create extension if not exists "citext"    with schema extensions;  -- case-insensitive usernames
create extension if not exists "pg_cron";                            -- weekly cycle scheduler
