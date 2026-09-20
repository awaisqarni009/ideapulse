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
