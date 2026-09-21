-- =====================================================================
-- 141_reports_and_admin.sql
-- T-6.2: Trigger moving an idea to `under_review` at 3 distinct reporters (BR-037)
-- RLS policies and helper functions for Admin Actions and Moderation
-- =====================================================================

-- 1. Trigger to move idea to under_review at 3 distinct reporters (BR-037)
create or replace function public.check_idea_reports()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_distinct_reporters integer;
begin
  select count(distinct reporter_id) into v_distinct_reporters
  from public.reports
  where idea_id = new.idea_id
    and resolved_at is null;

  if v_distinct_reporters >= 3 then
    update public.ideas
    set status = 'under_review'
    where id = new.idea_id
      and status = 'published';
  end if;

  return new;
end;
$$;

drop trigger if exists on_report_inserted on public.reports;
create trigger on_report_inserted
  after insert on public.reports
  for each row
  execute function public.check_idea_reports();

-- 2. Admin policies for reports and admin_actions
drop policy if exists "reports_admin_all" on public.reports;
create policy "reports_admin_all"
  on public.reports for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_actions_admin_insert" on public.admin_actions;
create policy "admin_actions_admin_insert"
  on public.admin_actions for insert
  with check (public.is_admin());

drop policy if exists "admin_actions_admin_all" on public.admin_actions;
create policy "admin_actions_admin_all"
  on public.admin_actions for all
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Atomic moderation function for reports and ideas
create or replace function public.moderate_idea_report(
  p_idea_id uuid,
  p_action text, -- 'dismiss' | 'remove'
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_idea public.ideas%rowtype;
  v_before_status public.idea_status;
  v_new_status public.idea_status;
begin
  if not public.is_admin(v_admin_id) then
    raise exception 'IP_UNAUTHORIZED' using errcode = '42501';
  end if;

  if p_action not in ('dismiss', 'remove') then
    raise exception 'IP_INVALID_ACTION' using errcode = 'P0001';
  end if;

  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'IP_REASON_REQUIRED' using errcode = 'P0001';
  end if;

  select * into v_idea from public.ideas where id = p_idea_id for update;
  if not found then
    raise exception 'IP_IDEA_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_before_status := v_idea.status;

  if p_action = 'remove' then
    v_new_status := 'removed';
    update public.ideas
    set status = 'removed'
    where id = p_idea_id;
  else
    -- dismissed: restore to published if it was under_review
    if v_before_status = 'under_review' then
      v_new_status := 'published';
      update public.ideas
      set status = 'published'
      where id = p_idea_id;
    else
      v_new_status := v_before_status;
    end if;
  end if;

  -- Mark all pending reports for this idea as resolved
  update public.reports
  set resolved_at = now(),
      resolution = p_action
  where idea_id = p_idea_id
    and resolved_at is null;

  -- Log the admin audit action
  insert into public.admin_actions (
    admin_id,
    action,
    target_table,
    target_id,
    reason,
    before_state,
    after_state
  ) values (
    v_admin_id,
    case when p_action = 'remove' then 'remove_idea' else 'dismiss_reports' end,
    'ideas',
    p_idea_id,
    p_reason,
    jsonb_build_object('status', v_before_status),
    jsonb_build_object('status', v_new_status)
  );

  return jsonb_build_object(
    'success', true,
    'idea_id', p_idea_id,
    'action', p_action,
    'previous_status', v_before_status,
    'current_status', v_new_status
  );
end;
$$;

-- Grant execution to authenticated role (protected by public.is_admin inside)
grant execute on function public.moderate_idea_report(uuid, text, text) to authenticated;
