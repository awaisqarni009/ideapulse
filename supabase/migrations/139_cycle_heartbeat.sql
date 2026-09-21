-- =====================================================================
-- 139_cycle_heartbeat.sql
-- Heartbeat tracking and boundary transition observability [T-5.12]
-- =====================================================================

create table if not exists public.cycle_heartbeats (
  id          uuid primary key default extensions.gen_random_uuid(),
  cycle_id    uuid references public.cycles (id) on delete set null,
  action      text not null, -- 'rotation', 'finalization', 'health_check'
  status      text not null, -- 'success', 'error', 'alert'
  details     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists cycle_heartbeats_created_idx
  on public.cycle_heartbeats (created_at desc);

create index if not exists cycle_heartbeats_cycle_idx
  on public.cycle_heartbeats (cycle_id, created_at desc);

-- Enable RLS on cycle_heartbeats
alter table public.cycle_heartbeats enable row level security;

create policy "cycle_heartbeats_admin_read"
  on public.cycle_heartbeats for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Update rotate_cycle() to write heartbeat row on execution [T-5.12]
create or replace function public.rotate_cycle()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active_id uuid;
  v_closed    jsonb;
  v_new       uuid;
  v_res       jsonb;
begin
  select id into v_active_id from public.cycles where status = 'active' limit 1;
  if v_active_id is null then
    raise exception 'IP_NO_ACTIVE_CYCLE' using errcode = 'P0002';
  end if;

  v_closed := public.finalize_cycle(v_active_id);
  v_new    := public.open_next_cycle();
  v_res    := jsonb_build_object('closed', v_closed, 'opened', v_new);

  -- Record heartbeat row on successful cycle rotation
  insert into public.cycle_heartbeats (cycle_id, action, status, details)
  values (v_new, 'rotation', 'success', v_res);

  return v_res;
exception when others then
  -- Log failure heartbeat
  insert into public.cycle_heartbeats (cycle_id, action, status, details)
  values (
    (select id from public.cycles where status in ('active', 'closing') limit 1),
    'rotation',
    'error',
    jsonb_build_object('error', sqlerrm, 'sqlstate', sqlstate)
  );
  raise;
end;
$$;

-- Health check function to detect if cycle boundary transition is overdue by 30 minutes
create or replace function public.check_cycle_health()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active public.cycles%rowtype;
  v_overdue boolean := false;
  v_mins numeric := 0;
begin
  select * into v_active from public.cycles where status = 'active' limit 1;

  if not found then
    return jsonb_build_object('healthy', false, 'reason', 'no_active_cycle');
  end if;

  if now() > v_active.ends_at + interval '30 minutes' then
    v_overdue := true;
    v_mins := round(extract(epoch from (now() - v_active.ends_at)) / 60.0, 1);

    insert into public.cycle_heartbeats (cycle_id, action, status, details)
    values (
      v_active.id,
      'health_check',
      'alert',
      jsonb_build_object(
        'message', format('Cycle %s is overdue by %s minutes without rotation', v_active.cycle_number, v_mins),
        'ends_at', v_active.ends_at
      )
    );

    return jsonb_build_object(
      'healthy', false,
      'alert', true,
      'cycle_number', v_active.cycle_number,
      'overdue_minutes', v_mins
    );
  end if;

  return jsonb_build_object('healthy', true, 'cycle_number', v_active.cycle_number);
end;
$$;

grant execute on function public.rotate_cycle to service_role;
grant execute on function public.check_cycle_health to service_role, authenticated;
