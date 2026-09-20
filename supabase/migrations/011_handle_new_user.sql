-- =====================================================================
-- 011_handle_new_user.sql
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  base_name text;
  candidate text;
  suffix    integer := 0;
begin
  base_name := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  if char_length(base_name) < 3 then
    base_name := 'pulse' || base_name;
  end if;
  base_name := left(base_name, 20);

  candidate := base_name;
  while exists (select 1 from public.profiles p where p.username = candidate) loop
    suffix    := suffix + 1;
    candidate := left(base_name, 20) || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data ->> 'full_name', candidate),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
