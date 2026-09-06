begin;

create or replace function public.admin_list_accounts()
returns table (
  user_id uuid,
  email text,
  display_name text,
  account_role text,
  email_confirmed boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;

  return query
    select
      u.id,
      u.email::text,
      coalesce(p.display_name, split_part(u.email, '@', 1)),
      coalesce(p.role, 'student'),
      u.email_confirmed_at is not null,
      u.created_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc;
end;
$$;

create or replace function public.admin_delete_account(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'CANNOT_DELETE_CURRENT_ADMIN' using errcode = '22023';
  end if;

  delete from auth.users where id = p_user_id;
  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

revoke all on function public.admin_list_accounts() from public;
revoke all on function public.admin_list_accounts() from anon;
grant execute on function public.admin_list_accounts() to authenticated;

revoke all on function public.admin_delete_account(uuid) from public;
revoke all on function public.admin_delete_account(uuid) from anon;
grant execute on function public.admin_delete_account(uuid) to authenticated;

commit;
