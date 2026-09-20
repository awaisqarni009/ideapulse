-- =====================================================================
-- 100_submission_quota.sql
-- =====================================================================
create or replace function public.enforce_submission_rules()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_cooldown interval;
  v_last     timestamptz;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.author_id::text, 1));

  if not public.account_is_writable(new.author_id) then
    perform public.log_abuse(new.author_id, 'unconfirmed_write_attempt', 'IP_ACCOUNT_NOT_WRITABLE', 'ideas');
    raise exception 'IP_ACCOUNT_NOT_WRITABLE' using errcode = 'P0001';
  end if;

  select submission_cooldown into v_cooldown
  from public.cycles where id = new.cycle_id;

  select max(created_at) into v_last
  from public.ideas
  where author_id = new.author_id
    and status in ('published','withdrawn','under_review');

  if v_last is not null and v_last > now() - v_cooldown then
    perform public.log_abuse(
      new.author_id, 'submit_quota_exceeded', 'IP_SUBMIT_COOLDOWN', 'ideas', null,
      jsonb_build_object('next_slot_at', v_last + v_cooldown)
    );
    raise exception 'IP_SUBMIT_COOLDOWN:%', (v_last + v_cooldown) using errcode = 'P0001';
  end if;

  new.slug := left(
    regexp_replace(lower(new.title), '[^a-z0-9]+', '-', 'g'), 60
  ) || '-' || substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 6);
  new.slug := regexp_replace(new.slug, '(^-+|-+$)', '', 'g');

  return new;
end;
$$;

create trigger ideas_enforce_submission
  before insert on public.ideas
  for each row execute function public.enforce_submission_rules();

create or replace function public.sync_idea_counters()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set ideas_count = (select count(*) from public.ideas
                        where author_id = new.author_id and status = 'published'),
         last_idea_at = greatest(coalesce(last_idea_at, new.created_at), new.created_at)
    where id = new.author_id;
  return new;
end;
$$;

create trigger ideas_sync_counters
  after insert or update of status on public.ideas
  for each row execute function public.sync_idea_counters();

-- Freeze content once voting has started.
create or replace function public.guard_idea_immutability()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.locked_at is not null and not public.is_admin() then
    if new.title <> old.title or new.body <> old.body or new.summary <> old.summary then
      raise exception 'IP_IDEA_LOCKED' using errcode = 'P0001';
    end if;
  end if;
  if new.author_id <> old.author_id or new.cycle_id <> old.cycle_id then
    raise exception 'IP_IMMUTABLE_FIELD' using errcode = 'P0001';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger ideas_guard_immutability
  before update on public.ideas
  for each row execute function public.guard_idea_immutability();
