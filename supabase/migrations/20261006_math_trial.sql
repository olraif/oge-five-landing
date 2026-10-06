-- One free, two-hour trial of the available first-part mathematics trainer per account.
-- Run in Supabase SQL Editor before publishing the matching site files.
create table if not exists public.math_trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '2 hours')
);

alter table public.math_trials enable row level security;
revoke all on public.math_trials from public, anon, authenticated;

create or replace function public.math_trial(p_start boolean default false)
returns table (status text, expires_at timestamptz, remaining_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_expiry timestamptz;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.enrollments
    where user_id = v_user and course_id = 'math-first'
  ) then
    return query select 'purchased'::text, null::timestamptz, null::integer;
    return;
  end if;

  if p_start then
    if not exists (
      select 1 from auth.users
      where id = v_user and email_confirmed_at is not null
    ) then
      raise exception 'EMAIL_NOT_CONFIRMED' using errcode = '42501';
    end if;

    insert into public.math_trials (user_id)
    values (v_user)
    on conflict (user_id) do nothing;
  end if;

  select t.expires_at into v_expiry
  from public.math_trials t
  where t.user_id = v_user;

  return query select
    case
      when v_expiry is null then 'not_started'::text
      when v_expiry > now() then 'active'::text
      else 'expired'::text
    end,
    v_expiry,
    case when v_expiry is null then null::integer
      else greatest(0, ceil(extract(epoch from v_expiry - now()))::integer)
    end;
end;
$$;

revoke all on function public.math_trial(boolean) from public, anon;
grant execute on function public.math_trial(boolean) to authenticated;
notify pgrst, 'reload schema';
