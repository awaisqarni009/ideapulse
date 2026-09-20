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
