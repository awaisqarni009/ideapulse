-- =====================================================================
-- 135_feed_functions.sql
-- Trending score and cursor pagination RPC for feed discovery [T-4.2, T-4.5]
-- =====================================================================

create or replace function public.get_feed_ideas(
  p_sort text default 'trending',
  p_category text default null,
  p_tag text default null,
  p_limit integer default 12,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null,
  p_cursor_score numeric default null,
  p_cursor_votes integer default null
)
returns table (
  id uuid,
  title text,
  slug text,
  summary text,
  category text,
  tags text[],
  status public.idea_status,
  vote_count integer,
  verified_vote_count integer,
  created_at timestamptz,
  author_id uuid,
  author_username text,
  author_display_name text,
  author_avatar_url text,
  cycle_id uuid,
  cycle_number integer,
  vote_threshold integer,
  trending_score numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  with scored_ideas as (
    select
      i.id,
      i.title,
      i.slug,
      i.summary,
      i.category,
      i.tags,
      i.status,
      i.vote_count,
      i.verified_vote_count,
      i.created_at,
      i.author_id,
      p.username::text as author_username,
      p.display_name as author_display_name,
      p.avatar_url as author_avatar_url,
      i.cycle_id,
      c.cycle_number,
      coalesce(c.vote_threshold, 50) as vote_threshold,
      round(
        (i.verified_vote_count::numeric / power(greatest(extract(epoch from (now() - i.created_at)) / 3600.0, 0.0) + 2.0, 1.5))::numeric,
        4
      ) as trending_score
    from public.ideas i
    join public.profiles p on p.id = i.author_id
    left join public.cycles c on c.id = i.cycle_id
    where i.status = 'published'
      and (p_category is null or i.category = p_category)
      and (p_tag is null or p_tag = any(i.tags))
  )
  select *
  from scored_ideas s
  where
    -- Newest: cursor on (created_at, id) [T-4.2]
    (p_sort = 'newest' and (
      p_cursor_created_at is null or
      s.created_at < p_cursor_created_at or
      (s.created_at = p_cursor_created_at and s.id < p_cursor_id)
    ))
    or
    -- Top: cursor on (verified_vote_count, created_at, id)
    (p_sort = 'top' and (
      p_cursor_votes is null or
      s.verified_vote_count < p_cursor_votes or
      (s.verified_vote_count = p_cursor_votes and (
        s.created_at < p_cursor_created_at or
        (s.created_at = p_cursor_created_at and s.id < p_cursor_id)
      ))
    ))
    or
    -- Trending: cursor on (trending_score, id) [T-4.5]
    ((p_sort = 'trending' or p_sort is null) and (
      p_cursor_score is null or
      s.trending_score < p_cursor_score or
      (s.trending_score = p_cursor_score and s.id < p_cursor_id)
    ))
  order by
    case when p_sort = 'newest' then s.created_at end desc nulls last,
    case when p_sort = 'top' then s.verified_vote_count end desc nulls last,
    case when p_sort = 'trending' or p_sort is null then s.trending_score end desc nulls last,
    s.created_at desc,
    s.id desc
  limit greatest(1, least(p_limit, 50));
end;
$$;

grant execute on function public.get_feed_ideas to anon, authenticated;
