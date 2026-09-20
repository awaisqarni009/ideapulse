-- =====================================================================
-- 120_rls.sql
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.cycles        enable row level security;
alter table public.ideas         enable row level security;
alter table public.votes         enable row level security;
alter table public.rewards       enable row level security;
alter table public.reports       enable row level security;
alter table public.abuse_events  enable row level security;
alter table public.admin_actions enable row level security;

-- 4.1 profiles
create policy "profiles_public_read"
  on public.profiles for select
  using (status <> 'deleted');

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_admin_update"
  on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

revoke update on public.profiles from authenticated;
grant update (display_name, bio, avatar_url, username) on public.profiles to authenticated;

-- 4.2 cycles
create policy "cycles_public_read"
  on public.cycles for select using (true);

create policy "cycles_admin_write"
  on public.cycles for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.3 ideas
create policy "ideas_public_read"
  on public.ideas for select
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "ideas_author_insert"
  on public.ideas for insert
  with check (
    auth.uid() = author_id
    and cycle_id = public.active_cycle_id()
    and status = 'published'
    and public.account_is_writable(auth.uid())
  );

create policy "ideas_author_update"
  on public.ideas for update
  using (auth.uid() = author_id and status in ('published','withdrawn'))
  with check (auth.uid() = author_id and status in ('published','withdrawn'));

create policy "ideas_admin_all"
  on public.ideas for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.4 votes
create policy "votes_self_read"
  on public.votes for select
  using (voter_id = auth.uid() or public.is_admin());

create policy "votes_self_insert"
  on public.votes for insert
  with check (
    voter_id = auth.uid()
    and voter_id <> idea_author_id
    and cycle_id = public.active_cycle_id()
    and public.account_is_writable(auth.uid())
    and exists (
      select 1 from public.ideas i
      where i.id = idea_id
        and i.author_id = idea_author_id
        and i.status = 'published'
    )
    and (
      select count(*) from public.votes v
      where v.voter_id = auth.uid()
        and v.status in ('active','retracted')
        and v.created_at > now() - interval '24 hours'
    ) < (select daily_vote_limit from public.cycles where id = public.active_cycle_id())
  );

create policy "votes_self_retract"
  on public.votes for update
  using (
    voter_id = auth.uid()
    and status = 'active'
    and created_at > now() - interval '10 minutes'
  )
  with check (voter_id = auth.uid() and status = 'retracted');

create policy "votes_admin_all"
  on public.votes for all
  using (public.is_admin()) with check (public.is_admin());

revoke delete on public.votes from authenticated, anon;
revoke insert, update on public.votes from authenticated;
grant insert (idea_id, idea_author_id, voter_id, cycle_id) on public.votes to authenticated;
grant update (status, retracted_at) on public.votes to authenticated;

-- 4.5 rewards, reports, logs
create policy "rewards_public_read"
  on public.rewards for select
  using (status in ('announced','claimed','fulfilled') or recipient_id = auth.uid() or public.is_admin());

create policy "rewards_recipient_claim"
  on public.rewards for update
  using (recipient_id = auth.uid() and status = 'announced')
  with check (recipient_id = auth.uid() and status = 'claimed');

create policy "rewards_admin_all"
  on public.rewards for all
  using (public.is_admin()) with check (public.is_admin());

create policy "reports_self_insert"
  on public.reports for insert
  with check (reporter_id = auth.uid() and public.account_is_writable(auth.uid()));

create policy "reports_self_read"
  on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());

create policy "abuse_admin_read"  on public.abuse_events  for select using (public.is_admin());
create policy "admin_log_read"    on public.admin_actions for select using (public.is_admin());

alter publication supabase_realtime add table public.ideas;
