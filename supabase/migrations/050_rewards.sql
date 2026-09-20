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
