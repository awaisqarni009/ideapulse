-- =====================================================================
-- 137_leaderboard_function.sql
-- RPC to fetch ranked leaderboard from idea_public_stats [T-4.9, T-4.10]
-- =====================================================================

create or replace function public.get_leaderboard(
  p_cycle_id uuid default null,
  p_limit integer default 20
)
returns table (
  idea_id uuid,
  cycle_id uuid,
  cycle_rank bigint,
  title text,
  slug text,
  author_id uuid,
  author_username text,
  author_display_name text,
  author_avatar_url text,
  vote_count integer,
  verified_vote_count integer,
  vote_threshold integer,
  is_qualified boolean,
  votes_to_qualify integer,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_cycle_id uuid := p_cycle_id;
begin
  if v_cycle_id is null then
    v_cycle_id := public.active_cycle_id();
  end if;

  return query
  select
    s.idea_id,
    s.cycle_id,
    s.cycle_rank,
    i.title,
    i.slug,
    i.author_id,
    p.username::text as author_username,
    p.display_name as author_display_name,
    p.avatar_url as author_avatar_url,
    s.vote_count,
    s.verified_vote_count,
    s.vote_threshold,
    s.is_qualified,
    s.votes_to_qualify,
    i.created_at
  from public.idea_public_stats s
  join public.ideas i on i.id = s.idea_id
  join public.profiles p on p.id = i.author_id
  where s.cycle_id = v_cycle_id
  order by s.cycle_rank asc, i.created_at asc
  limit greatest(1, least(p_limit, 50));
end;
$$;

grant execute on function public.get_leaderboard to anon, authenticated;
