-- =====================================================================
-- 143_retention_and_security.sql
-- T-6.13: ip_hash verification & log_abuse ip_hash support (BR-035)
-- T-6.14: 180-day retention job purging old abuse_events (BR-035)
-- =====================================================================

-- 1. log_abuse overload accepting ip_hash and user_agent
create or replace function public.log_abuse(
  p_actor uuid,
  p_kind public.abuse_kind,
  p_code text,
  p_table text default null,
  p_target uuid default null,
  p_detail jsonb default '{}'::jsonb,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.abuse_events (
    actor_id,
    kind,
    error_code,
    target_table,
    target_id,
    detail,
    ip_hash,
    user_agent
  ) values (
    p_actor,
    p_kind,
    p_code,
    p_table,
    p_target,
    p_detail,
    p_ip_hash,
    p_user_agent
  );
end;
$$;

grant execute on function public.log_abuse(uuid, public.abuse_kind, text, text, uuid, jsonb, text, text) to authenticated, anon;

-- 2. Purge old abuse_events older than 180 days (BR-035 retention)
create or replace function public.purge_old_abuse_events()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.abuse_events
  where created_at < now() - interval '180 days';
  get diagnostics v_deleted = row_count;

  return jsonb_build_object(
    'success', true,
    'deleted_rows', v_deleted,
    'purged_before', (now() - interval '180 days')
  );
end;
$$;

grant execute on function public.purge_old_abuse_events() to service_role, postgres;

-- 3. Schedule daily retention job at 03:00 UTC via pg_cron
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('ideapulse-purge-abuse-events');
  end if;
exception when others then
  -- Ignore if unschedule fails
end $$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'ideapulse-purge-abuse-events',
      '0 3 * * *',
      'select public.purge_old_abuse_events();'
    );
  end if;
exception when others then
  raise notice 'pg_cron schedule notice: %', sqlerrm;
end $$;
