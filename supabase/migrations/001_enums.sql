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
