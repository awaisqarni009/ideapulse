-- =====================================================================
-- 070_helpers.sql
-- =====================================================================
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role in ('admin','moderator')
  );
$$;

create or replace function public.account_is_writable(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = uid
      and p.status = 'active'
      and (p.suspended_until is null or p.suspended_until < now())
      and u.email_confirmed_at is not null
  );
$$;

-- A vote counts toward the threshold only if the voter is established.
create or replace function public.voter_is_verified(uid uuid)
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = uid
      and p.status = 'active'
      and u.email_confirmed_at is not null
      and u.created_at <= now() - interval '24 hours'
  );
$$;

create or replace function public.log_abuse(
  p_actor uuid, p_kind public.abuse_kind, p_code text,
  p_table text default null, p_target uuid default null,
  p_detail jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.abuse_events (actor_id, kind, error_code, target_table, target_id, detail)
  values (p_actor, p_kind, p_code, p_table, p_target, p_detail);
end;
$$;
