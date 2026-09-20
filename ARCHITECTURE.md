# ARCHITECTURE.md — IdeaPulse

**System Architecture & Data Model**
Version 1.0 · Postgres 15 (Supabase) · Next.js 14+ App Router

---

## 1. System overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│  Next.js App Router · React Server Components · Framer Motion    │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────────┐   │
│  │ Feed / RSC │  │ Vote button │  │ Realtime leaderboard sub │   │
│  └────────────┘  └─────────────┘  └──────────────────────────┘   │
└───────┬──────────────────┬─────────────────────┬─────────────────┘
        │ RSC fetch        │ Server Action       │ WebSocket
        │ (cookie session) │ (service-scoped)    │ (anon key + RLS)
        ▼                  ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE / NODE RUNTIME                    │
│  middleware.ts — session refresh, route guards                   │
│  Server Actions — castVote(), submitIdea(), retractVote()        │
│  Route Handlers — /api/cron/close-cycle (secret-protected)       │
└───────┬──────────────────────────────────────────────────────────┘
        │ supabase-js (PostgREST + RPC)
        ▼
┌──────────────────────────────────────────────────────────────────┐
│                           SUPABASE                               │
│  ┌───────────┐ ┌──────────────┐ ┌──────────┐ ┌───────────────┐   │
│  │ GoTrue    │ │ PostgREST    │ │ Realtime │ │ pg_cron       │   │
│  │ (auth)    │ │ (REST + RPC) │ │ (WS)     │ │ (cycle jobs)  │   │
│  └───────────┘ └──────────────┘ └──────────┘ └───────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL 15                                              │  │
│  │  RLS on every table · triggers enforce quotas · CHECK       │  │
│  │  constraints make self-voting structurally impossible       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.1 Architectural stance

**The database is the rulebook.** Every business rule in `RULES.md` maps to a constraint, trigger, or RLS policy. The Next.js layer exists to render state and produce good error messages — it is never the last line of defense. A determined user with the anon key and `curl` must hit exactly the same walls as a user clicking buttons.

**Three trust levels:**

| Client              | Key                               | Can do                                                                                                                                             |
| ------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser             | `anon` key + user JWT             | Read published data; write only through RLS-guarded policies and `SECURITY DEFINER` RPCs.                                                          |
| Server Action / RSC | `anon` key + user JWT from cookie | Same permissions as the browser. Server Actions do **not** escalate privilege; they exist for latency and to keep validation logic off the client. |
| Cron / admin job    | `service_role` key                | Bypasses RLS. Used only in `/api/cron/*` route handlers and Edge Functions, never in code reachable from a user request.                           |

---

## 2. Database schema

All SQL below is written to run top-to-bottom as the initial migration. Every timestamp is `timestamptz` stored in UTC.

### 2.1 Extensions and enums

```sql
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
```

### 2.2 `profiles`

Mirrors `auth.users` with the public-facing, application-owned columns. The auth table is never queried directly from the app.

```sql
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
```

**Automatic profile creation.** A trigger on `auth.users` guarantees a profile always exists, so no code path ever has to handle a missing profile.

```sql
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
```

### 2.3 `cycles`

The heartbeat. Every idea and every vote belongs to exactly one cycle, resolved server-side at write time.

```sql
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
```

### 2.4 `ideas`

Note `ideas_id_author_uk` — that redundant-looking unique constraint is load-bearing. It allows `votes` to carry a composite foreign key on `(idea_id, idea_author_id)`, which in turn makes self-voting preventable by a plain `CHECK` constraint. Postgres does not allow subqueries in `CHECK`, so this denormalization is what turns "no self-voting" from a trigger you could forget into a structural impossibility.

```sql
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
```

### 2.5 `votes`

The immutable ledger. Rows are never deleted; retraction and voiding are status changes so the audit trail survives.

```sql
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

  -- ── THE self-vote prohibition. Structural, not procedural. ──
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
```

### 2.6 `rewards`

```sql
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

  title           text not null,          -- e.g. 'Cycle 14 — First place'
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
```

### 2.7 Trust & safety tables

```sql
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
```

---

## 3. Business-logic functions

### 3.1 Shared helpers

```sql
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
```

### 3.2 `cast_vote` — the critical path

Called as an RPC. `SECURITY DEFINER` so it can write to `votes` and `abuse_events` atomically, with an advisory lock that closes the race window on the quota check.

```sql
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
```

### 3.3 `retract_vote`

```sql
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
```

### 3.4 Counter maintenance

A single trigger keeps `ideas.vote_count`, `ideas.verified_vote_count`, `ideas.qualified_at`, and the profile counters correct for inserts, retractions, voids, and verification changes.

```sql
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
```

### 3.5 Submission quota

```sql
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
```

### 3.6 Cycle lifecycle

```sql
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
      format('Cycle %s — rank %s', v_cycle.cycle_number, v_rank),
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
```

> **Free-tier note.** If `pg_cron` is unavailable, replace the schedule with a Vercel Cron hitting `POST /api/cron/rotate-cycle`, which authenticates a shared secret header and calls `rotate_cycle()` with the `service_role` key. The SQL is identical either way.

---

## 4. Row Level Security

RLS is enabled on every table. There is no table where a missing policy silently permits access — `alter table ... enable row level security` with no matching policy denies by default.

```sql
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
```

### 4.1 `profiles`

```sql
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

-- No INSERT policy: profiles are created exclusively by the
-- handle_new_user() SECURITY DEFINER trigger.
-- No DELETE policy: deletion cascades from auth.users only.
```

Privilege escalation is blocked at the column level, because `WITH CHECK (auth.uid() = id)` alone would still let a user set `role = 'admin'` on their own row:

```sql
revoke update on public.profiles from authenticated;
grant update (display_name, bio, avatar_url, username) on public.profiles to authenticated;
```

### 4.2 `cycles`

```sql
create policy "cycles_public_read"
  on public.cycles for select using (true);

create policy "cycles_admin_write"
  on public.cycles for all
  using (public.is_admin()) with check (public.is_admin());
```

### 4.3 `ideas`

```sql
-- Anyone sees published ideas. Authors also see their own withdrawn/under-review ones.
create policy "ideas_public_read"
  on public.ideas for select
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_admin()
  );

-- Authors insert only as themselves, only into the active cycle.
-- The weekly cooldown is enforced by the BEFORE INSERT trigger, not here,
-- so the rejection can carry a precise next-slot timestamp.
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

-- No DELETE policy for members. Withdrawal is a status change; the record stays.
```

### 4.4 `votes` — the tightest surface

```sql
-- Vote counts are public; who voted for what is not.
-- A user may read only their own vote rows.
create policy "votes_self_read"
  on public.votes for select
  using (voter_id = auth.uid() or public.is_admin());

-- Direct INSERT is permitted but so narrowly scoped that it cannot
-- bypass a single rule. In practice clients call cast_vote() instead.
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
        and i.author_id = idea_author_id     -- forged author_id is impossible
        and i.status = 'published'
    )
    and (
      select count(*) from public.votes v
      where v.voter_id = auth.uid()
        and v.status in ('active','retracted')
        and v.created_at > now() - interval '24 hours'
    ) < (select daily_vote_limit from public.cycles where id = public.active_cycle_id())
  );

-- Retraction only, only your own, only inside the window.
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

-- Never deletable by anyone but a superuser. The ledger is append-only.
revoke delete on public.votes from authenticated, anon;

-- is_verified must never be client-settable.
revoke insert, update on public.votes from authenticated;
grant insert (idea_id, idea_author_id, voter_id, cycle_id) on public.votes to authenticated;
grant update (status, retracted_at) on public.votes to authenticated;
```

### 4.5 `rewards`, `reports`, logs

```sql
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

-- Logs: writable only by SECURITY DEFINER functions, readable only by admins.
create policy "abuse_admin_read"  on public.abuse_events  for select using (public.is_admin());
create policy "admin_log_read"    on public.admin_actions for select using (public.is_admin());
```

### 4.6 Public aggregate view

Vote counts must be public without exposing the ledger. A `security_invoker = false` view over aggregated data solves this cleanly.

```sql
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
```

---

## 5. Frontend ↔ backend flows

### 5.1 Route map

| Route           | Rendering                              | Data source                                                 |
| --------------- | -------------------------------------- | ----------------------------------------------------------- |
| `/`             | Static + ISR 60s                       | Top 3 ideas of the active cycle                             |
| `/feed`         | RSC + client pagination                | `ideas` + `idea_public_stats`, cursor on `(created_at, id)` |
| `/idea/[slug]`  | RSC, ISR 30s                           | Idea row, author profile, viewer's vote state               |
| `/leaderboard`  | RSC + Realtime subscription            | `idea_public_stats` ordered by `cycle_rank`                 |
| `/submit`       | RSC (auth-guarded)                     | Cooldown state from `profiles.last_idea_at`                 |
| `/u/[username]` | RSC, ISR 120s                          | Profile + authored ideas                                    |
| `/cycles/[n]`   | Static after finalization              | `cycles` + `rewards`                                        |
| `/rules`        | Static                                 | Markdown, content mirrors `RULES.md`                        |
| `/admin/*`      | RSC, `is_admin()` guard, 404 otherwise | Admin queries via `service_role` route handlers             |

### 5.2 Vote flow (the one that has to be right)

```
User clicks "Vote"
  │
  ├─▶ [Client] Optimistic update: button → voted state, count +1, HUD −1
  │
  ├─▶ [Server Action] castVote(ideaId)
  │      ├─ createServerClient() with the user's cookie session
  │      ├─ supabase.rpc('cast_vote', { p_idea_id: ideaId })
  │      │
  │      ├─▶ [Postgres] pg_advisory_xact_lock(voter)
  │      │   ├─ account_is_writable?        → IP_ACCOUNT_NOT_WRITABLE
  │      │   ├─ idea published?             → IP_IDEA_CLOSED
  │      │   ├─ author_id ≠ voter?          → IP_SELF_VOTE
  │      │   ├─ no existing vote?           → IP_DUPLICATE_VOTE
  │      │   ├─ votes in 24h < limit?       → IP_VOTE_QUOTA:<next_slot>
  │      │   ├─ INSERT vote (is_verified computed server-side)
  │      │   │    └─ CHECK votes_no_self_vote — structural backstop
  │      │   │    └─ UNIQUE (idea_id, voter_id) — structural backstop
  │      │   └─ AFTER trigger recomputes counters + qualified_at
  │      │
  │      ├─ success → revalidateTag(`idea:${ideaId}`), return payload
  │      └─ failure → map SQLSTATE/message to a typed VoteError
  │
  ├─▶ [Client] on success: reconcile count with server value, play vote burst
  │           on failure:  roll back optimistic state, show the specific reason
  │
  └─▶ [Realtime] other open clients receive the ideas UPDATE and animate rank change
```

**Error mapping.** The server action translates database errors into a discriminated union the UI can render without a lookup table on the client:

```ts
type VoteError =
  | { code: 'IP_VOTE_QUOTA'; nextSlotAt: string }
  | { code: 'IP_DUPLICATE_VOTE' }
  | { code: 'IP_SELF_VOTE' }
  | { code: 'IP_IDEA_CLOSED' }
  | { code: 'IP_ACCOUNT_NOT_WRITABLE'; reason: 'unconfirmed' | 'suspended' }
  | { code: 'IP_NO_ACTIVE_CYCLE' }
  | { code: 'IP_UNKNOWN' };
```

Each code has exactly one user-facing message, defined once in `lib/errors.ts` and linked to the relevant rule anchor in `/rules`.

### 5.3 Submission flow

```
/submit (RSC)
  └─ Server reads profiles.last_idea_at
       ├─ within cooldown → render <CooldownPanel nextSlotAt={...} />, no form
       └─ slot open       → render <IdeaForm />

Submit
  └─ Server Action submitIdea(payload)
       ├─ zod validation (mirrors the DB CHECK constraints exactly)
       ├─ supabase.from('ideas').insert({ ...payload, author_id, cycle_id })
       │    ├─ RLS ideas_author_insert
       │    ├─ BEFORE trigger: writability + cooldown + slug generation
       │    └─ AFTER trigger: profile counters
       ├─ success → redirect(`/idea/${slug}`)
       └─ IP_SUBMIT_COOLDOWN → re-render with the exact next-slot timestamp
```

### 5.4 Realtime leaderboard

```ts
supabase
  .channel(`cycle:${cycleId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'ideas',
      filter: `cycle_id=eq.${cycleId}`,
    },
    (payload) => applyRankUpdate(payload.new),
  )
  .subscribe();
```

Realtime is enabled only on `ideas` — never on `votes`, which would leak the voting ledger to any subscriber. The published `ideas` row carries only aggregate counts.

```sql
alter publication supabase_realtime add table public.ideas;
```

### 5.5 Caching strategy

| Surface              | Strategy                  | Invalidation                         |
| -------------------- | ------------------------- | ------------------------------------ |
| Landing page         | ISR, 60s                  | Time-based                           |
| Feed page 1          | ISR, 30s                  | `revalidateTag('feed')` on new idea  |
| Feed pages 2+        | Client fetch, no cache    | —                                    |
| Idea detail          | ISR, 30s + realtime patch | `revalidateTag('idea:<id>')` on vote |
| Leaderboard          | RSC no-store + realtime   | Continuous                           |
| Profile              | ISR, 120s                 | `revalidateTag('user:<id>')`         |
| Closed cycle archive | Static, permanent         | Never (immutable once finalized)     |

### 5.6 Middleware

```ts
// middleware.ts — runs on every request
// 1. Refresh the Supabase session cookie (required; tokens are short-lived)
// 2. Guard /submit and /settings → redirect to /login?next=<path>
// 3. Guard /admin/* → rewrite to /404 unless profiles.role in ('admin','moderator')
// 4. Attach a request-id header for log correlation
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)'],
};
```

---

## 6. Migration order

| #   | File                   | Contents                                                            |
| --- | ---------------------- | ------------------------------------------------------------------- |
| 000 | `extensions.sql`       | pgcrypto, citext, pg_cron                                           |
| 001 | `enums.sql`            | All enum types                                                      |
| 010 | `profiles.sql`         | Table, indexes, `handle_new_user` trigger                           |
| 020 | `cycles.sql`           | Table, single-active index, `active_cycle_id()`                     |
| 030 | `ideas.sql`            | Table, constraints, indexes                                         |
| 040 | `votes.sql`            | Table, composite FK, self-vote CHECK, indexes                       |
| 050 | `rewards.sql`          | Table, uniqueness constraints                                       |
| 060 | `safety.sql`           | `abuse_events`, `reports`, `admin_actions`                          |
| 070 | `helpers.sql`          | `is_admin`, `account_is_writable`, `voter_is_verified`, `log_abuse` |
| 080 | `cast_vote.sql`        | Vote RPC + grants                                                   |
| 085 | `retract_vote.sql`     | Retraction RPC                                                      |
| 090 | `counters.sql`         | Counter sync triggers                                               |
| 100 | `submission_quota.sql` | Submission trigger, immutability guard                              |
| 110 | `cycle_engine.sql`     | `open_next_cycle`, `finalize_cycle`, `rotate_cycle`, cron schedule  |
| 120 | `rls.sql`              | Enable RLS + all policies + column grants                           |
| 130 | `views.sql`            | `idea_public_stats`                                                 |
| 140 | `seed.sql`             | Cycle 1, categories, dev fixtures (local only)                      |

---

## 7. Non-functional requirements

| Concern       | Requirement                           | Approach                                                               |
| ------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| Latency       | p95 vote round-trip < 300 ms          | Single RPC, advisory lock held briefly, indexed quota query            |
| Throughput    | 200 concurrent voters                 | Denormalized counters; no aggregate scans on the read path             |
| Consistency   | No over-quota votes under concurrency | Advisory lock + unique constraint as backstop                          |
| Auditability  | Every write reconstructable           | Append-only `votes`, `abuse_events`, `admin_actions`                   |
| Privacy       | Vote ledger never public              | RLS `votes_self_read` + aggregate-only view + realtime on `ideas` only |
| PII           | No raw IPs stored                     | `ip_hash` = sha256(ip + rotating daily salt)                           |
| Recovery      | Point-in-time restore                 | Supabase daily backups; migrations in version control                  |
| Observability | Alert if a cycle fails to rotate      | Heartbeat row written by `rotate_cycle`; alert at boundary + 30 min    |
