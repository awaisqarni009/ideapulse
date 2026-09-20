-- =====================================================================
-- 110_cycle_engine.sql
-- =====================================================================
create or replace function public.open_next_cycle()
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_prev public.cycles%rowtype;
  v_id   uuid;
  v_num  integer;
  v_start timestamptz;
begin
  select * into v_prev from public.cycles
  where status in ('finalized','closing') order by cycle_number desc limit 1;

  v_num   := coalesce(v_prev.cycle_number, 0) + 1;
  v_start := coalesce(v_prev.ends_at, date_trunc('week', now()));

  insert into public.cycles (cycle_number, starts_at, ends_at, status)
  values (v_num, v_start, v_start + interval '7 days', 'active')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.finalize_cycle(p_cycle_id uuid default null)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_cycle    public.cycles%rowtype;
  v_rank     integer := 0;
  v_row      record;
  v_awarded  integer := 0;
begin
  select * into v_cycle from public.cycles
  where id = coalesce(p_cycle_id, public.active_cycle_id())
  for update;

  if not found then
    raise exception 'IP_CYCLE_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_cycle.status = 'finalized' then
    raise exception 'IP_CYCLE_ALREADY_FINALIZED' using errcode = 'P0001';
  end if;

  update public.cycles set status = 'closing' where id = v_cycle.id;

  -- Rank qualifying ideas. Ties broken by who crossed the threshold first.
  for v_row in
    select i.id, i.author_id, i.verified_vote_count, i.qualified_at
    from public.ideas i
    where i.cycle_id = v_cycle.id
      and i.status = 'published'
      and i.verified_vote_count >= v_cycle.vote_threshold
    order by i.verified_vote_count desc, i.qualified_at asc, i.created_at asc
    limit greatest(v_cycle.reward_slots, 0)
  loop
    v_rank := v_rank + 1;

    insert into public.rewards (
      cycle_id, idea_id, recipient_id, rank, verified_votes, qualified_at, title, status
    ) values (
      v_cycle.id, v_row.id, v_row.author_id, v_rank,
      v_row.verified_vote_count, v_row.qualified_at,
      format('Cycle %s — rank %s', v_cycle.cycle_number, v_rank),
      'announced'
    );

    update public.profiles set cycles_won = cycles_won + 1 where id = v_row.author_id;
    v_awarded := v_awarded + 1;
  end loop;

  update public.cycles
     set status          = 'finalized',
         finalized_at    = now(),
         qualified_count = v_awarded,
         total_ideas     = (select count(*) from public.ideas where cycle_id = v_cycle.id),
         total_votes     = (select count(*) from public.votes
                            where cycle_id = v_cycle.id and status = 'active'),
         finalization_note = case
           when v_awarded = 0
           then format('No idea reached the %s-vote threshold this cycle.', v_cycle.vote_threshold)
           else null end
   where id = v_cycle.id;

  return jsonb_build_object('cycle_id', v_cycle.id, 'rewards_created', v_awarded);
end;
$$;

create or replace function public.rotate_cycle()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_closed jsonb; v_new uuid;
begin
  v_closed := public.finalize_cycle();
  v_new    := public.open_next_cycle();
  return jsonb_build_object('closed', v_closed, 'opened', v_new);
end;
$$;

-- Every Monday at 00:00 UTC.
select cron.schedule(
  'ideapulse-rotate-cycle',
  '0 0 * * 1',
  $$ select public.rotate_cycle(); $$
);
