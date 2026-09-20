-- =====================================================================
-- 020_cycles.sql
-- =====================================================================
create table public.cycles (
  id                  uuid primary key default extensions.gen_random_uuid(),
  cycle_number        integer not null unique,
  starts_at           timestamptz not null,
  ends_at             timestamptz not null,
  status              public.cycle_status not null default 'scheduled',

  -- Per-cycle tunables. Changing the rules never requires a deploy.
  vote_threshold      integer not null default 50,
  daily_vote_limit    integer not null default 5,
  submission_cooldown interval not null default interval '7 days',
  reward_slots        integer not null default 3,

  -- Finalization output
  finalized_at        timestamptz,
  qualified_count     integer,
  total_votes         integer,
  total_ideas         integer,
  finalization_note   text,

  created_at          timestamptz not null default now(),

  constraint cycles_window_valid  check (ends_at > starts_at),
  constraint cycles_threshold_pos check (vote_threshold >= 1),
  constraint cycles_limit_pos     check (daily_vote_limit between 1 and 100),
  constraint cycles_slots_pos     check (reward_slots >= 0)
);

-- At most one cycle may be active at a time.
create unique index cycles_single_active_idx
  on public.cycles ((status))
  where status = 'active';

create index cycles_window_idx on public.cycles (starts_at, ends_at);

-- Resolve the cycle that owns "now". Used by every write path.
create or replace function public.active_cycle_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.cycles c
  where c.status = 'active'
    and now() >= c.starts_at
    and now() <  c.ends_at
  limit 1;
$$;
