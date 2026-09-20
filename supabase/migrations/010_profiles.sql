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
