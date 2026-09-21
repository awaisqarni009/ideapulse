-- =====================================================================
-- 000_extensions.sql
-- =====================================================================
create extension if not exists "pgcrypto"  with schema extensions;  -- gen_random_uuid()
create extension if not exists "citext"    with schema extensions;  -- case-insensitive usernames
create extension if not exists "pg_cron";                            -- weekly cycle scheduler
-- =====================================================================
-- 001_enums.sql
-- =====================================================================
create type public.user_role as enum ('member', 'moderator', 'admin');

create type public.account_status as enum ('active', 'suspended', 'deleted');

create type public.idea_status as enum (
  'published',      -- visible, votable
  'withdrawn',      -- author pulled it; votes retained, excluded from ranking
  'under_review',   -- reported, hidden from feed, voting frozen
  'removed'         -- moderator removed; votes voided
);

create type public.cycle_status as enum ('scheduled', 'active', 'closing', 'finalized', 'recount_required');

create type public.vote_status as enum ('active', 'retracted', 'voided');

create type public.reward_status as enum ('pending', 'announced', 'claimed', 'fulfilled', 'forfeited');

create type public.abuse_kind as enum (
  'self_vote_attempt',
  'duplicate_vote_attempt',
  'vote_quota_exceeded',
  'submit_quota_exceeded',
  'unconfirmed_write_attempt',
  'suspended_write_attempt',
  'closed_idea_vote_attempt',
  'rate_limit_tripped'
);
-- =====================================================================
-- 010_profiles.sql
-- =====================================================================
create table public.profiles (
  id                uuid primary key
                      references auth.users (id) on delete cascade,
  username          citext not null unique,
  display_name      text   not null,
  bio               text,
  avatar_url        text,
  role              public.user_role       not null default 'member',
  status            public.account_status  not null default 'active',

  -- Denormalized, trigger-maintained
  ideas_count            integer not null default 0,
  votes_cast_count       integer not null default 0,
  votes_received_count   integer not null default 0,
  cycles_won             integer not null default 0,

  -- Quota bookkeeping (fast path; the ledger remains the source of truth)
  last_idea_at      timestamptz,
  last_vote_at      timestamptz,

  username_changed_at timestamptz,
  suspended_until     timestamptz,
  suspension_reason   text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint profiles_username_format
    check (username ~ '^[a-z0-9_]{3,24}$'),
  constraint profiles_display_name_len
    check (char_length(display_name) between 1 and 48),
  constraint profiles_bio_len
    check (bio is null or char_length(bio) <= 280),
  constraint profiles_counts_non_negative
    check (
      ideas_count >= 0 and votes_cast_count >= 0
      and votes_received_count >= 0 and cycles_won >= 0
    )
);

create index profiles_role_idx   on public.profiles (role) where role <> 'member';
create index profiles_status_idx on public.profiles (status) where status <> 'active';
-- =====================================================================
-- 011_handle_new_user.sql
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  base_name text;
  candidate text;
  suffix    integer := 0;
begin
  base_name := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  if char_length(base_name) < 3 then
    base_name := 'pulse' || base_name;
  end if;
  base_name := left(base_name, 20);

  candidate := base_name;
  while exists (select 1 from public.profiles p where p.username = candidate) loop
    suffix    := suffix + 1;
    candidate := left(base_name, 20) || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data ->> 'full_name', candidate),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
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
-- =====================================================================
-- 030_ideas.sql
-- =====================================================================
create table public.ideas (
  id              uuid primary key default extensions.gen_random_uuid(),
  author_id       uuid not null references public.profiles (id) on delete cascade,
  cycle_id        uuid not null references public.cycles (id)   on delete restrict,

  title           text not null,
  slug            text not null unique,
  summary         text not null,
  body            text not null,
  category        text not null,
  tags            text[] not null default '{}',

  status          public.idea_status not null default 'published',

  -- Trigger-maintained counters
  vote_count          integer not null default 0,  -- all non-voided votes
  verified_vote_count integer not null default 0,  -- votes that count toward the threshold
  report_count        integer not null default 0,

  -- Set exactly once, when verified_vote_count first reaches the cycle threshold.
  -- This timestamp is the tie-breaker at finalization.
  qualified_at    timestamptz,

  locked_at       timestamptz,   -- set on first vote; body becomes immutable
  withdrawn_at    timestamptz,
  removed_at      timestamptz,
  removal_reason  text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint ideas_title_len    check (char_length(title)   between 10  and 120),
  constraint ideas_summary_len  check (char_length(summary) between 40  and 280),
  constraint ideas_body_len     check (char_length(body)    between 100 and 5000),
  constraint ideas_slug_format  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint ideas_tags_limit   check (array_length(tags, 1) is null or array_length(tags, 1) <= 5),
  constraint ideas_category_allowed check (
    category in ('product','developer-tools','ai','sustainability','health',
                 'education','fintech','social','hardware','other')
  ),
  constraint ideas_counts_non_negative check (
    vote_count >= 0 and verified_vote_count >= 0 and report_count >= 0
  ),
  constraint ideas_verified_lte_total check (verified_vote_count <= vote_count),

  -- Required target for the composite FK from votes. Do not drop.
  constraint ideas_id_author_uk unique (id, author_id)
);

create index ideas_cycle_rank_idx
  on public.ideas (cycle_id, verified_vote_count desc, qualified_at asc)
  where status = 'published';

create index ideas_author_recent_idx on public.ideas (author_id, created_at desc);
create index ideas_feed_idx          on public.ideas (created_at desc) where status = 'published';
create index ideas_category_idx      on public.ideas (category)        where status = 'published';
create index ideas_tags_gin_idx      on public.ideas using gin (tags);
create index ideas_search_idx        on public.ideas
  using gin (to_tsvector('english', title || ' ' || summary));
-- =====================================================================
-- 040_votes.sql
-- =====================================================================
create table public.votes (
  id              uuid primary key default extensions.gen_random_uuid(),
  idea_id         uuid not null,
  idea_author_id  uuid not null,   -- denormalized so the CHECK below is possible
  voter_id        uuid not null references public.profiles (id) on delete cascade,
  cycle_id        uuid not null references public.cycles (id)   on delete restrict,

  status          public.vote_status not null default 'active',

  -- A vote is verified only if, at the moment it was cast, the voter's account
  -- was confirmed, at least 24h old, and in good standing. Frozen at insert
  -- time, then recomputed only by admin action (suspension / void).
  is_verified     boolean not null default false,

  retracted_at    timestamptz,
  voided_at       timestamptz,
  void_reason     text,

  created_at      timestamptz not null default now(),

  -- Referential integrity AND author identity in one constraint.
  constraint votes_idea_author_fk
    foreign key (idea_id, idea_author_id)
    references public.ideas (id, author_id)
    on delete cascade,

  -- â”€â”€ THE self-vote prohibition. Structural, not procedural. â”€â”€
  constraint votes_no_self_vote check (voter_id <> idea_author_id),

  -- One vote per user per idea, forever. Retracting does not free the slot.
  constraint votes_one_per_user_per_idea unique (idea_id, voter_id),

  constraint votes_retracted_consistent check (
    (status = 'retracted') = (retracted_at is not null)
  ),
  constraint votes_voided_consistent check (
    (status = 'voided') = (voided_at is not null)
  )
);

-- Drives the rolling 24h quota check. The partial predicate keeps it small.
create index votes_quota_idx
  on public.votes (voter_id, created_at desc)
  where status = 'active';

create index votes_idea_idx      on public.votes (idea_id) where status = 'active';
create index votes_cycle_idx     on public.votes (cycle_id, created_at desc);
create index votes_verified_idx  on public.votes (idea_id) where status = 'active' and is_verified;
-- =====================================================================
-- 050_rewards.sql
-- =====================================================================
create table public.rewards (
  id              uuid primary key default extensions.gen_random_uuid(),
  cycle_id        uuid not null references public.cycles (id)   on delete cascade,
  idea_id         uuid not null references public.ideas (id)    on delete restrict,
  recipient_id    uuid not null references public.profiles (id) on delete restrict,

  rank            integer not null,
  verified_votes  integer not null,
  qualified_at    timestamptz not null,

  title           text not null,          -- e.g. 'Cycle 14 â€” First place'
  description     text,
  payout_kind     text not null default 'recognition',  -- 'recognition' | 'credit' | 'cash'
  payout_amount   numeric(12,2),
  payout_currency char(3),

  status          public.reward_status not null default 'pending',
  announced_at    timestamptz,
  claimed_at      timestamptz,
  fulfilled_at    timestamptz,

  created_at      timestamptz not null default now(),

  constraint rewards_rank_positive   check (rank >= 1),
  constraint rewards_votes_positive  check (verified_votes >= 1),
  constraint rewards_one_per_idea    unique (cycle_id, idea_id),
  constraint rewards_one_per_rank    unique (cycle_id, rank),
  constraint rewards_amount_shape    check (
    (payout_kind = 'recognition' and payout_amount is null)
    or (payout_kind <> 'recognition' and payout_amount > 0 and payout_currency is not null)
  )
);

create index rewards_recipient_idx on public.rewards (recipient_id, created_at desc);
create index rewards_cycle_idx     on public.rewards (cycle_id, rank);
-- =====================================================================
-- 060_safety.sql
-- =====================================================================
create table public.abuse_events (
  id           bigserial primary key,
  actor_id     uuid references public.profiles (id) on delete set null,
  kind         public.abuse_kind not null,
  target_table text,
  target_id    uuid,
  error_code   text not null,
  detail       jsonb not null default '{}'::jsonb,
  ip_hash      text,             -- sha256(ip + daily salt); never the raw address
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index abuse_actor_idx on public.abuse_events (actor_id, created_at desc);
create index abuse_kind_idx  on public.abuse_events (kind, created_at desc);

create table public.reports (
  id          uuid primary key default extensions.gen_random_uuid(),
  idea_id     uuid not null references public.ideas (id)    on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason      text not null,
  detail      text,
  resolved_at timestamptz,
  resolution  text,
  created_at  timestamptz not null default now(),

  constraint reports_one_per_user_per_idea unique (idea_id, reporter_id),
  constraint reports_reason_allowed check (
    reason in ('spam','duplicate','offensive','plagiarism','vote_manipulation','other')
  )
);

create table public.admin_actions (
  id          bigserial primary key,
  admin_id    uuid not null references public.profiles (id) on delete restrict,
  action      text not null,
  target_table text not null,
  target_id   uuid not null,
  reason      text not null,
  before_state jsonb,
  after_state  jsonb,
  created_at  timestamptz not null default now()
);

create index admin_actions_target_idx on public.admin_actions (target_table, target_id, created_at desc);
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
-- =====================================================================
-- 080_cast_vote.sql
-- =====================================================================
create or replace function public.cast_vote(p_idea_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_voter        uuid := auth.uid();
  v_idea         public.ideas%rowtype;
  v_cycle        public.cycles%rowtype;
  v_used         integer;
  v_next_slot    timestamptz;
  v_verified     boolean;
  v_vote_id      uuid;
begin
  if v_voter is null then
    raise exception 'IP_UNAUTHENTICATED' using errcode = '42501';
  end if;

  -- Serialize this user's vote writes. Prevents two concurrent requests
  -- from both reading "4 votes used" and both inserting a 5th.
  perform pg_advisory_xact_lock(hashtextextended(v_voter::text, 0));

  if not public.account_is_writable(v_voter) then
    perform public.log_abuse(v_voter, 'unconfirmed_write_attempt', 'IP_ACCOUNT_NOT_WRITABLE',
                             'ideas', p_idea_id);
    raise exception 'IP_ACCOUNT_NOT_WRITABLE' using errcode = 'P0001';
  end if;

  select * into v_idea from public.ideas where id = p_idea_id;
  if not found then
    raise exception 'IP_IDEA_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_idea.status <> 'published' then
    perform public.log_abuse(v_voter, 'closed_idea_vote_attempt', 'IP_IDEA_CLOSED',
                             'ideas', p_idea_id, jsonb_build_object('status', v_idea.status));
    raise exception 'IP_IDEA_CLOSED' using errcode = 'P0001';
  end if;

  if v_idea.author_id = v_voter then
    perform public.log_abuse(v_voter, 'self_vote_attempt', 'IP_SELF_VOTE', 'ideas', p_idea_id);
    raise exception 'IP_SELF_VOTE' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.votes v
             where v.idea_id = p_idea_id and v.voter_id = v_voter) then
    perform public.log_abuse(v_voter, 'duplicate_vote_attempt', 'IP_DUPLICATE_VOTE',
                             'ideas', p_idea_id);
    raise exception 'IP_DUPLICATE_VOTE' using errcode = 'P0001';
  end if;

  select * into v_cycle from public.cycles where id = public.active_cycle_id();
  if not found then
    raise exception 'IP_NO_ACTIVE_CYCLE' using errcode = 'P0002';
  end if;

  -- Rolling 24h window. Retracted votes still occupy their slot (RULES.md BR-014).
  select count(*) into v_used
  from public.votes v
  where v.voter_id = v_voter
    and v.status in ('active','retracted')
    and v.created_at > now() - interval '24 hours';

  if v_used >= v_cycle.daily_vote_limit then
    select min(v.created_at) + interval '24 hours' into v_next_slot
    from (
      select created_at from public.votes
      where voter_id = v_voter
        and status in ('active','retracted')
        and created_at > now() - interval '24 hours'
      order by created_at asc
      limit 1
    ) v;

    perform public.log_abuse(v_voter, 'vote_quota_exceeded', 'IP_VOTE_QUOTA', 'ideas', p_idea_id,
                             jsonb_build_object('used', v_used, 'limit', v_cycle.daily_vote_limit));
    raise exception 'IP_VOTE_QUOTA:%', v_next_slot using errcode = 'P0001';
  end if;

  v_verified := public.voter_is_verified(v_voter);

  insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id, is_verified)
  values (p_idea_id, v_idea.author_id, v_voter, v_cycle.id, v_verified)
  returning id into v_vote_id;

  update public.profiles
     set last_vote_at = now(), updated_at = now()
   where id = v_voter;

  return jsonb_build_object(
    'vote_id',        v_vote_id,
    'is_verified',    v_verified,
    'votes_used',     v_used + 1,
    'votes_limit',    v_cycle.daily_vote_limit,
    'idea_id',        p_idea_id
  );
end;
$$;

revoke all on function public.cast_vote(uuid) from public;
grant execute on function public.cast_vote(uuid) to authenticated;
-- =====================================================================
-- 085_retract_vote.sql
-- =====================================================================
create or replace function public.retract_vote(p_idea_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_voter uuid := auth.uid();
  v_vote  public.votes%rowtype;
begin
  if v_voter is null then
    raise exception 'IP_UNAUTHENTICATED' using errcode = '42501';
  end if;

  select * into v_vote from public.votes
  where idea_id = p_idea_id and voter_id = v_voter and status = 'active';

  if not found then
    raise exception 'IP_VOTE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_vote.created_at < now() - interval '10 minutes' then
    raise exception 'IP_RETRACTION_WINDOW_CLOSED' using errcode = 'P0001';
  end if;

  update public.votes
     set status = 'retracted', retracted_at = now()
   where id = v_vote.id;

  -- Quota slot is deliberately NOT refunded.
  return jsonb_build_object('idea_id', p_idea_id, 'quota_refunded', false);
end;
$$;

grant execute on function public.retract_vote(uuid) to authenticated;
-- =====================================================================
-- 090_counters.sql
-- =====================================================================
create or replace function public.sync_vote_counters()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_idea_id   uuid := coalesce(new.idea_id, old.idea_id);
  v_total     integer;
  v_verified  integer;
  v_threshold integer;
  v_author    uuid;
begin
  select count(*) filter (where status = 'active'),
         count(*) filter (where status = 'active' and is_verified)
    into v_total, v_verified
  from public.votes where idea_id = v_idea_id;

  select i.author_id, c.vote_threshold
    into v_author, v_threshold
  from public.ideas i join public.cycles c on c.id = i.cycle_id
  where i.id = v_idea_id;

  update public.ideas
     set vote_count          = v_total,
         verified_vote_count = v_verified,
         locked_at           = coalesce(locked_at, case when v_total > 0 then now() end),
         qualified_at        = case
                                 when v_verified >= v_threshold then coalesce(qualified_at, now())
                                 else null   -- fell back below the bar: clear it
                               end,
         updated_at          = now()
   where id = v_idea_id;

  update public.profiles p
     set votes_received_count = (
           select count(*) from public.votes v
           join public.ideas i on i.id = v.idea_id
           where i.author_id = v_author and v.status = 'active'
         )
   where p.id = v_author;

  if tg_op = 'INSERT' then
    update public.profiles set votes_cast_count = votes_cast_count + 1 where id = new.voter_id;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger votes_sync_counters
  after insert or update of status, is_verified or delete on public.votes
  for each row execute function public.sync_vote_counters();
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
-- =====================================================================
-- 110_cycle_engine.sql
-- =====================================================================
create or replace function public.open_next_cycle()
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_prev public.cycles%rowtype;
  v_id   uuid;
  v_num  integer;
  v_start timestamptz;
begin
  select * into v_prev from public.cycles
  where status in ('finalized','closing') order by cycle_number desc limit 1;

  v_num   := coalesce(v_prev.cycle_number, 0) + 1;
  v_start := coalesce(v_prev.ends_at, date_trunc('week', now()));

  insert into public.cycles (cycle_number, starts_at, ends_at, status)
  values (v_num, v_start, v_start + interval '7 days', 'active')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.finalize_cycle(p_cycle_id uuid default null)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_cycle    public.cycles%rowtype;
  v_rank     integer := 0;
  v_row      record;
  v_awarded  integer := 0;
begin
  select * into v_cycle from public.cycles
  where id = coalesce(p_cycle_id, public.active_cycle_id())
  for update;

  if not found then
    raise exception 'IP_CYCLE_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_cycle.status = 'finalized' then
    raise exception 'IP_CYCLE_ALREADY_FINALIZED' using errcode = 'P0001';
  end if;

  update public.cycles set status = 'closing' where id = v_cycle.id;

  -- Rank qualifying ideas. Ties broken by who crossed the threshold first.
  for v_row in
    select i.id, i.author_id, i.verified_vote_count, i.qualified_at
    from public.ideas i
    where i.cycle_id = v_cycle.id
      and i.status = 'published'
      and i.verified_vote_count >= v_cycle.vote_threshold
    order by i.verified_vote_count desc, i.qualified_at asc, i.created_at asc
    limit greatest(v_cycle.reward_slots, 0)
  loop
    v_rank := v_rank + 1;

    insert into public.rewards (
      cycle_id, idea_id, recipient_id, rank, verified_votes, qualified_at, title, status
    ) values (
      v_cycle.id, v_row.id, v_row.author_id, v_rank,
      v_row.verified_vote_count, v_row.qualified_at,
      format('Cycle %s â€” rank %s', v_cycle.cycle_number, v_rank),
      'announced'
    );

    update public.profiles set cycles_won = cycles_won + 1 where id = v_row.author_id;
    v_awarded := v_awarded + 1;
  end loop;

  update public.cycles
     set status          = 'finalized',
         finalized_at    = now(),
         qualified_count = v_awarded,
         total_ideas     = (select count(*) from public.ideas where cycle_id = v_cycle.id),
         total_votes     = (select count(*) from public.votes
                            where cycle_id = v_cycle.id and status = 'active'),
         finalization_note = case
           when v_awarded = 0
           then format('No idea reached the %s-vote threshold this cycle.', v_cycle.vote_threshold)
           else null end
   where id = v_cycle.id;

  return jsonb_build_object('cycle_id', v_cycle.id, 'rewards_created', v_awarded);
end;
$$;

create or replace function public.rotate_cycle()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_closed jsonb; v_new uuid;
begin
  v_closed := public.finalize_cycle();
  v_new    := public.open_next_cycle();
  return jsonb_build_object('closed', v_closed, 'opened', v_new);
end;
$$;

-- Every Monday at 00:00 UTC.
select cron.schedule(
  'ideapulse-rotate-cycle',
  '0 0 * * 1',
  $$ select public.rotate_cycle(); $$
);
-- =====================================================================
-- 120_rls.sql
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.cycles        enable row level security;
alter table public.ideas         enable row level security;
alter table public.votes         enable row level security;
alter table public.rewards       enable row level security;
alter table public.reports       enable row level security;
alter table public.abuse_events  enable row level security;
alter table public.admin_actions enable row level security;

-- 4.1 profiles
create policy "profiles_public_read"
  on public.profiles for select
  using (status <> 'deleted');

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_admin_update"
  on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

revoke update on public.profiles from authenticated;
grant update (display_name, bio, avatar_url, username) on public.profiles to authenticated;

-- 4.2 cycles
create policy "cycles_public_read"
  on public.cycles for select using (true);

create policy "cycles_admin_write"
  on public.cycles for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.3 ideas
create policy "ideas_public_read"
  on public.ideas for select
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "ideas_author_insert"
  on public.ideas for insert
  with check (
    auth.uid() = author_id
    and cycle_id = public.active_cycle_id()
    and status = 'published'
    and public.account_is_writable(auth.uid())
  );

create policy "ideas_author_update"
  on public.ideas for update
  using (auth.uid() = author_id and status in ('published','withdrawn'))
  with check (auth.uid() = author_id and status in ('published','withdrawn'));

create policy "ideas_admin_all"
  on public.ideas for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.4 votes
create policy "votes_self_read"
  on public.votes for select
  using (voter_id = auth.uid() or public.is_admin());

create policy "votes_self_insert"
  on public.votes for insert
  with check (
    voter_id = auth.uid()
    and voter_id <> idea_author_id
    and cycle_id = public.active_cycle_id()
    and public.account_is_writable(auth.uid())
    and exists (
      select 1 from public.ideas i
      where i.id = idea_id
        and i.author_id = idea_author_id
        and i.status = 'published'
    )
    and (
      select count(*) from public.votes v
      where v.voter_id = auth.uid()
        and v.status in ('active','retracted')
        and v.created_at > now() - interval '24 hours'
    ) < (select daily_vote_limit from public.cycles where id = public.active_cycle_id())
  );

create policy "votes_self_retract"
  on public.votes for update
  using (
    voter_id = auth.uid()
    and status = 'active'
    and created_at > now() - interval '10 minutes'
  )
  with check (voter_id = auth.uid() and status = 'retracted');

create policy "votes_admin_all"
  on public.votes for all
  using (public.is_admin()) with check (public.is_admin());

revoke delete on public.votes from authenticated, anon;
revoke insert, update on public.votes from authenticated;
grant insert (idea_id, idea_author_id, voter_id, cycle_id) on public.votes to authenticated;
grant update (status, retracted_at) on public.votes to authenticated;

-- 4.5 rewards, reports, logs
create policy "rewards_public_read"
  on public.rewards for select
  using (status in ('announced','claimed','fulfilled') or recipient_id = auth.uid() or public.is_admin());

create policy "rewards_recipient_claim"
  on public.rewards for update
  using (recipient_id = auth.uid() and status = 'announced')
  with check (recipient_id = auth.uid() and status = 'claimed');

create policy "rewards_admin_all"
  on public.rewards for all
  using (public.is_admin()) with check (public.is_admin());

create policy "reports_self_insert"
  on public.reports for insert
  with check (reporter_id = auth.uid() and public.account_is_writable(auth.uid()));

create policy "reports_self_read"
  on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());

create policy "abuse_admin_read"  on public.abuse_events  for select using (public.is_admin());
create policy "admin_log_read"    on public.admin_actions for select using (public.is_admin());

alter publication supabase_realtime add table public.ideas;
-- =====================================================================
-- 130_views.sql
-- =====================================================================
create view public.idea_public_stats
with (security_invoker = false) as
select
  i.id                        as idea_id,
  i.cycle_id,
  i.vote_count,
  i.verified_vote_count,
  i.qualified_at is not null  as is_qualified,
  c.vote_threshold,
  greatest(c.vote_threshold - i.verified_vote_count, 0) as votes_to_qualify,
  rank() over (
    partition by i.cycle_id
    order by i.verified_vote_count desc, i.qualified_at asc nulls last
  ) as cycle_rank
from public.ideas i
join public.cycles c on c.id = i.cycle_id
where i.status = 'published';

grant select on public.idea_public_stats to anon, authenticated;
-- =====================================================================
-- 140_seed.sql (Local development & test fixtures)
-- =====================================================================

do $$
declare
  v_cycle_id uuid;
  u1 uuid := '11111111-1111-4111-a111-111111111111';
  u2 uuid := '22222222-2222-4222-a222-222222222222';
  u3 uuid := '33333333-3333-4333-a333-333333333333';
  u4 uuid := '44444444-4444-4444-a444-444444444444';
  u5 uuid := '55555555-5555-4555-a555-555555555555';
  u6 uuid := '66666666-6666-4666-a666-666666666666';
  u7 uuid := '77777777-7777-4777-a777-777777777777';
  u8 uuid := '88888888-8888-4888-a888-888888888888';

  i1 uuid := 'a1111111-1111-4111-a111-111111111111';
  i2 uuid := 'a2222222-2222-4222-a222-222222222222';
  i3 uuid := 'a3333333-3333-4333-a333-333333333333';
  i4 uuid := 'a4444444-4444-4444-a444-444444444444';
  i5 uuid := 'a5555555-5555-4555-a555-555555555555';
  i6 uuid := 'a6666666-6666-4666-a666-666666666666';
  i7 uuid := 'a7777777-7777-4777-a777-777777777777';
  i8 uuid := 'a8888888-8888-4888-a888-888888888888';
  i9 uuid := 'a9999999-9999-4999-a999-999999999999';
  i10 uuid := 'baaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  i11 uuid := 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  i12 uuid := 'bccccccc-cccc-4ccc-cccc-cccccccccccc';
  i13 uuid := 'bddddddd-dddd-4ddd-dddd-dddddddddddd';
  i14 uuid := 'beeeeeee-eeee-4eee-eeee-eeeeeeeeeeee';
  i15 uuid := 'bfffffff-ffff-4fff-ffff-ffffffffffff';
begin
  -- 1. Create or resolve active cycle 1
  insert into public.cycles (cycle_number, starts_at, ends_at, status, vote_threshold, daily_vote_limit, reward_slots)
  values (1, now() - interval '3 days', now() + interval '4 days', 'active', 50, 5, 3)
  on conflict (cycle_number) do update set status = 'active'
  returning id into v_cycle_id;

  -- 2. Mock auth users in auth.users if running in Supabase local
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'users') then
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    values
      (u1, 'maya@ideapulse.dev', 'dummy-hash', now() - interval '30 days', now() - interval '30 days', now()),
      (u2, 'dev@ideapulse.dev', 'dummy-hash', now() - interval '25 days', now() - interval '25 days', now()),
      (u3, 'elena@ideapulse.dev', 'dummy-hash', now() - interval '20 days', now() - interval '20 days', now()),
      (u4, 'marcus@ideapulse.dev', 'dummy-hash', now() - interval '15 days', now() - interval '15 days', now()),
      (u5, 'aisha@ideapulse.dev', 'dummy-hash', now() - interval '10 days', now() - interval '10 days', now()),
      (u6, 'sam@ideapulse.dev', 'dummy-hash', now() - interval '8 days', now() - interval '8 days', now()),
      (u7, 'chloe@ideapulse.dev', 'dummy-hash', now() - interval '5 days', now() - interval '5 days', now()),
      (u8, 'alex@ideapulse.dev', 'dummy-hash', now() - interval '2 days', now() - interval '2 days', now())
    on conflict (id) do nothing;
  end if;

  -- 3. Seed profiles
  insert into public.profiles (id, username, display_name, bio, role, status)
  values
    (u1, 'maya_chen', 'Maya Chen', 'Full-stack builder interested in local-first sync & edge DBs.', 'member', 'active'),
    (u2, 'dev_patel', 'Dev Patel', 'Product curator and open-source enthusiast.', 'member', 'active'),
    (u3, 'elena_r', 'Elena Rostova', 'Machine learning and vector search systems.', 'member', 'active'),
    (u4, 'marcus_b', 'Marcus Brody', 'Low-level systems and distributed queues.', 'member', 'active'),
    (u5, 'aisha_m', 'Aisha Al-Mansoor', 'Health tech and decentralized medical records.', 'member', 'active'),
    (u6, 'sam_becker', 'Sam Becker', 'Fintech protocols and micro-treasuries.', 'member', 'active'),
    (u7, 'chloe_d', 'Chloe Dupont', 'Climate data intelligence and carbon auditing.', 'member', 'active'),
    (u8, 'alex_thorne', 'Alex Thorne', 'IdeaPulse Community Moderator & Steward.', 'admin', 'active')
  on conflict (id) do update
    set username = excluded.username, display_name = excluded.display_name, role = excluded.role;

  -- 4. Seed 15 ideas across categories
  insert into public.ideas (id, author_id, cycle_id, title, slug, summary, body, category, tags, status, created_at)
  values
    (i1, u1, v_cycle_id, 'Offline-first sync for remote field research teams',
     'offline-first-sync-field-research-teams-a1b2c3',
     'A conflict-free replicated data protocol that lets field researchers record observations disconnected from cell signal.',
     'Field teams operating in remote ecology and disaster zones struggle with connectivity loss. This protocol implements state-based CRDTs in SQLite, merging seamlessly into Postgres upon signal recovery without manual conflicts.',
     'developer-tools', array['offline-first', 'crdt', 'sqlite'], 'published', now() - interval '2 days'),

    (i2, u3, v_cycle_id, 'Locally cached LLM inference on consumer GPUs for privacy',
     'locally-cached-llm-inference-consumer-gpus-b2c3d4',
     'Quantized on-device LLM inference engine with zero data leakage for enterprise documents.',
     'Enterprises handling sensitive medical or financial records cannot send queries to hosted model providers. This lightweight runtime executes 8-bit quantized models locally with deterministic memory footprints.',
     'ai', array['ai', 'local-llm', 'privacy'], 'published', now() - interval '2 days 6 hours'),

    (i3, u7, v_cycle_id, 'Open soil health sensor network with LoRaWAN telemetry',
     'open-soil-health-sensor-network-lorawan-c3d4e5',
     'Low-cost open hardware probe measuring moisture, nitrogen, and phosphorus with multi-mile wireless mesh.',
     'Precision agriculture should not require proprietary vendor lock-in. We provide open gerbers, firmware, and dashboard telemetry for regenerative farming monitoring.',
     'sustainability', array['hardware', 'iot', 'farming'], 'published', now() - interval '2 days 12 hours'),

    (i4, u5, v_cycle_id, 'End-to-end encrypted immunization records on passkeys',
     'encrypted-immunization-records-passkeys-d4e5f6',
     'Self-sovereign digital vaccine cards verified cryptographically without central databases.',
     'Patients should control their verifiable health records without relying on state or corporate databases that risk surveillance. Encrypted under WebAuthn public keys.',
     'health', array['health', 'passkeys', 'crypto'], 'published', now() - interval '2 days 18 hours'),

    (i5, u6, v_cycle_id, 'Automated payroll streaming for international contractors',
     'automated-payroll-streaming-contractors-e5f6a7',
     'Per-second salary streaming without bank wire delays or exorbitant currency transfer fees.',
     'Traditional cross-border banking extracts 4-7% in spreads. Real-time programmable liquidity pools allow contractors worldwide to be compensated instantly as work completes.',
     'fintech', array['fintech', 'payroll', 'global'], 'published', now() - interval '1 day 20 hours'),

    (i6, u4, v_cycle_id, 'Zero-overhead memory sanitizer for embedded rust applications',
     'zero-overhead-memory-sanitizer-embedded-rust-f6a7b8',
     'Compile-time safety verifier catching silent hardware buffer underruns in microcontrollers.',
     'Embedded firmware developers require deterministic memory guarantees without sacrificing MCU clock cycles. This tool provides formal static verification during compilation.',
     'developer-tools', array['rust', 'embedded', 'tooling'], 'published', now() - interval '1 day 16 hours'),

    (i7, u2, v_cycle_id, 'Community mesh wifi protocol for rural broadband sharing',
     'community-mesh-wifi-rural-broadband-a7b8c9',
     'Decentralized packet forwarding software converting home routers into neighborhood mesh networks.',
     'Neighborhoods with fiber access can share bandwidth with nearby unconnected households over directional radio antennas with automated fair-share throttling.',
     'social', array['mesh', 'networking', 'open-source'], 'published', now() - interval '1 day 12 hours'),

    (i8, u1, v_cycle_id, 'Interactive visual compiler pipeline debugger in the browser',
     'interactive-visual-compiler-pipeline-debugger-b8c9d0',
     'Inspect AST transformations, intermediate representations, and assembly generation step-by-step.',
     'Computer science students and systems engineers struggle to understand compiler optimizations. This interactive visual canvas demonstrates each optimization pass.',
     'education', array['compilers', 'education', 'visualization'], 'published', now() - interval '1 day 8 hours'),

    (i9, u3, v_cycle_id, 'Zero-shot synthetic training data pipeline for rare defect inspection',
     'synthetic-training-data-pipeline-defects-c9d0e1',
     'Diffusion model trained on CAD specifications to render photorealistic industrial defects for quality control.',
     'Industrial computer vision systems suffer from scarce training examples of rare manufacturing flaws. This tool synthesizes photorealistic defective parts to train vision classifiers.',
     'ai', array['computer-vision', 'synthetic-data'], 'published', now() - interval '1 day 4 hours'),

    (i10, u7, v_cycle_id, 'Distributed grid battery balancing via edge smart meters',
     'distributed-grid-battery-balancing-smart-meters-d0e1f2',
     'Peak shaving algorithm coordinating household EV batteries to prevent suburban transformer overloads.',
     'As home electrification surges, neighborhood distribution grids face thermal failure during evening peak hours. This decentralized protocol coordinates car charging schedules autonomously.',
     'sustainability', array['clean-tech', 'energy', 'smart-grid'], 'published', now() - interval '1 day'),

    (i11, u4, v_cycle_id, 'Deterministic replay debugger for distributed actor systems',
     'deterministic-replay-debugger-actor-systems-e1f2a3',
     'Record network message order and clock timestamps to reproduce flaky distributed bugs in test environments.',
     'Heisenbugs in distributed actor architectures are notorious for vanishing under inspection. By recording lightweight causal ordering vectors, bugs can be replayed deterministically.',
     'developer-tools', array['distributed-systems', 'debugging'], 'published', now() - interval '20 hours'),

    (i12, u5, v_cycle_id, 'Open prosthetic hand with compliant silicone tendons',
     'open-prosthetic-hand-compliant-silicone-f2a3b4',
     '3D printable multi-articulated bionic hand costing under 150 dollars in bill of materials.',
     'Commercial bionic prosthetics remain prohibitively expensive for most amputees. This design uses 3D printed nylon and silicone flexure joints to achieve natural grip patterns.',
     'health', array['prosthetics', '3d-printing', 'open-hardware'], 'published', now() - interval '16 hours'),

    (i13, u6, v_cycle_id, 'Cryptographic proof of reserves auditor for peer-to-peer marketplaces',
     'proof-of-reserves-auditor-p2p-marketplaces-a3b4c5',
     'Zero-knowledge solvency verifier enabling platforms to prove asset backing without leaking balances.',
     'Marketplaces holding customer escrow need to prove full solvency without revealing individual customer transaction histories. This protocol uses zk-SNARKs over Merkle state trees.',
     'fintech', array['fintech', 'zkp', 'cryptography'], 'published', now() - interval '12 hours'),

    (i14, u2, v_cycle_id, 'Minimalist distracted driving prevention dashboard for fleets',
     'distracted-driving-prevention-dashboard-fleets-b4c5d6',
     'Edge camera computer vision analyzing driver eye gaze and fatigue without storing video streams.',
     'Fleet operators must reduce driver fatigue incidents without turning vehicles into surveillance pods. The edge model computes safety telemetry while discarding raw video frames.',
     'product', array['safety', 'fleet', 'edge-ai'], 'published', now() - interval '8 hours'),

    (i15, u8, v_cycle_id, 'Universal schema converter for disparate scientific tabular datasets',
     'universal-schema-converter-scientific-datasets-c5d6e7',
     'Semantic mapping algorithm bridging non-standard CSV headers into FAIR standard ontologies.',
     'Academic research teams publish datasets with idiosyncratic column conventions, slowing meta-analyses. This tool infers semantic schema mappings automatically.',
     'education', array['data-science', 'ontology', 'open-science'], 'published', now() - interval '4 hours')
  on conflict (id) do nothing;

  -- 5. Seed ~60 votes (ensuring no self-votes and respecting one-per-user-per-idea)
  insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id, is_verified, status, created_at)
  values
    -- Votes on idea 1 (Maya's idea - author u1)
    (i1, u1, u2, v_cycle_id, true, 'active', now() - interval '40 hours'),
    (i1, u1, u3, v_cycle_id, true, 'active', now() - interval '38 hours'),
    (i1, u1, u4, v_cycle_id, true, 'active', now() - interval '36 hours'),
    (i1, u1, u5, v_cycle_id, true, 'active', now() - interval '30 hours'),
    (i1, u1, u6, v_cycle_id, true, 'active', now() - interval '24 hours'),
    (i1, u1, u7, v_cycle_id, true, 'active', now() - interval '18 hours'),
    (i1, u1, u8, v_cycle_id, true, 'active', now() - interval '12 hours'),

    -- Votes on idea 2 (Elena's idea - author u3)
    (i2, u3, u1, v_cycle_id, true, 'active', now() - interval '40 hours'),
    (i2, u3, u2, v_cycle_id, true, 'active', now() - interval '38 hours'),
    (i2, u3, u4, v_cycle_id, true, 'active', now() - interval '34 hours'),
    (i2, u3, u5, v_cycle_id, true, 'active', now() - interval '28 hours'),
    (i2, u3, u6, v_cycle_id, true, 'active', now() - interval '20 hours'),
    (i2, u3, u7, v_cycle_id, true, 'active', now() - interval '14 hours'),

    -- Votes on idea 3 (Chloe's idea - author u7)
    (i3, u7, u1, v_cycle_id, true, 'active', now() - interval '36 hours'),
    (i3, u7, u2, v_cycle_id, true, 'active', now() - interval '32 hours'),
    (i3, u7, u3, v_cycle_id, true, 'active', now() - interval '28 hours'),
    (i3, u7, u4, v_cycle_id, true, 'active', now() - interval '22 hours'),
    (i3, u7, u5, v_cycle_id, true, 'active', now() - interval '16 hours'),
    (i3, u7, u6, v_cycle_id, true, 'active', now() - interval '10 hours'),
    (i3, u7, u8, v_cycle_id, true, 'active', now() - interval '6 hours'),

    -- Votes on idea 4 (Aisha's idea - author u5)
    (i4, u5, u1, v_cycle_id, true, 'active', now() - interval '35 hours'),
    (i4, u5, u2, v_cycle_id, true, 'active', now() - interval '30 hours'),
    (i4, u5, u3, v_cycle_id, true, 'active', now() - interval '25 hours'),
    (i4, u5, u4, v_cycle_id, true, 'active', now() - interval '18 hours'),
    (i4, u5, u6, v_cycle_id, true, 'active', now() - interval '12 hours'),
    (i4, u5, u7, v_cycle_id, true, 'active', now() - interval '5 hours'),

    -- Votes on idea 5 (Sam's idea - author u6)
    (i5, u6, u1, v_cycle_id, true, 'active', now() - interval '30 hours'),
    (i5, u6, u2, v_cycle_id, true, 'active', now() - interval '24 hours'),
    (i5, u6, u3, v_cycle_id, true, 'active', now() - interval '18 hours'),
    (i5, u6, u4, v_cycle_id, true, 'active', now() - interval '14 hours'),
    (i5, u6, u5, v_cycle_id, true, 'active', now() - interval '8 hours'),

    -- Votes on idea 6 (Marcus's idea - author u4)
    (i6, u4, u1, v_cycle_id, true, 'active', now() - interval '28 hours'),
    (i6, u4, u2, v_cycle_id, true, 'active', now() - interval '22 hours'),
    (i6, u4, u3, v_cycle_id, true, 'active', now() - interval '16 hours'),
    (i6, u4, u5, v_cycle_id, true, 'active', now() - interval '10 hours'),
    (i6, u4, u7, v_cycle_id, true, 'active', now() - interval '4 hours'),

    -- Votes on idea 7 (Dev's idea - author u2)
    (i7, u2, u1, v_cycle_id, true, 'active', now() - interval '25 hours'),
    (i7, u2, u3, v_cycle_id, true, 'active', now() - interval '20 hours'),
    (i7, u2, u4, v_cycle_id, true, 'active', now() - interval '15 hours'),
    (i7, u2, u6, v_cycle_id, true, 'active', now() - interval '9 hours'),

    -- Votes on idea 8 (Maya's second idea - author u1)
    (i8, u1, u2, v_cycle_id, true, 'active', now() - interval '22 hours'),
    (i8, u1, u4, v_cycle_id, true, 'active', now() - interval '16 hours'),
    (i8, u1, u5, v_cycle_id, true, 'active', now() - interval '11 hours'),
    (i8, u1, u7, v_cycle_id, true, 'active', now() - interval '5 hours'),

    -- Votes on idea 9 (Elena's second idea - author u3)
    (i9, u3, u2, v_cycle_id, true, 'active', now() - interval '20 hours'),
    (i9, u3, u4, v_cycle_id, true, 'active', now() - interval '14 hours'),
    (i9, u3, u6, v_cycle_id, true, 'active', now() - interval '8 hours'),

    -- Votes on idea 10 (Chloe's second idea - author u7)
    (i10, u7, u1, v_cycle_id, true, 'active', now() - interval '18 hours'),
    (i10, u7, u3, v_cycle_id, true, 'active', now() - interval '12 hours'),
    (i10, u7, u5, v_cycle_id, true, 'active', now() - interval '6 hours'),

    -- Votes on idea 11 (Marcus's second idea - author u4)
    (i11, u4, u1, v_cycle_id, true, 'active', now() - interval '15 hours'),
    (i11, u4, u6, v_cycle_id, true, 'active', now() - interval '7 hours'),

    -- Votes on idea 12 (Aisha's second idea - author u5)
    (i12, u5, u2, v_cycle_id, true, 'active', now() - interval '14 hours'),
    (i12, u5, u7, v_cycle_id, true, 'active', now() - interval '4 hours'),

    -- Votes on idea 13 (Sam's second idea - author u6)
    (i13, u6, u1, v_cycle_id, true, 'active', now() - interval '10 hours'),
    (i13, u6, u3, v_cycle_id, true, 'active', now() - interval '3 hours'),

    -- Votes on idea 14 (Dev's second idea - author u2)
    (i14, u2, u4, v_cycle_id, true, 'active', now() - interval '6 hours'),
    (i14, u2, u5, v_cycle_id, true, 'active', now() - interval '2 hours'),

    -- Votes on idea 15 (Alex's idea - author u8)
    (i15, u8, u1, v_cycle_id, true, 'active', now() - interval '3 hours'),
    (i15, u8, u2, v_cycle_id, true, 'active', now() - interval '1 hour')
  on conflict do nothing;

end;
$$;
