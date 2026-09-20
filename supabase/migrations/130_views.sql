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
