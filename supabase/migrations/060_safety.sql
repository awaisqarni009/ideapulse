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
