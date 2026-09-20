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
