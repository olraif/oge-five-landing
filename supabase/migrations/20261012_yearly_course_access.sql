-- Paid course access lasts one calendar year from coupon redemption.
-- Existing test enrollments receive the same term from their recorded activation date.
begin;

alter table public.enrollments
  add column if not exists expires_at timestamptz;
alter table public.enrollments
  add column if not exists coupon_code text;

update public.enrollments
set expires_at = activated_at + interval '1 year'
where expires_at is null;

with latest_redemption as (
  select distinct on (r.user_id, c.course_id)
    r.user_id, c.course_id, r.code
  from public.coupon_redemptions as r
  join public.coupons as c on c.code = r.code
  order by r.user_id, c.course_id, r.redeemed_at desc, r.code
)
update public.enrollments as e
set coupon_code = r.code
from latest_redemption as r
where e.user_id = r.user_id
  and e.course_id = r.course_id
  and e.coupon_code is null;

alter table public.enrollments
  alter column expires_at set not null;

drop policy if exists "students see own enrollments" on public.enrollments;
create policy "students see own enrollments" on public.enrollments
  for select using (user_id = auth.uid() and expires_at > now());

create or replace function public.activate_coupon(p_code text)
returns table (course_id text, course_title text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.coupons%rowtype;
  v_activated_at timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Необходим вход в кабинет';
  end if;

  select coupon.* into c
  from public.coupons as coupon
  where upper(coupon.code) = upper(trim(p_code))
    and coupon.is_active = true
    and (coupon.expires_at is null or coupon.expires_at > now())
  for update;

  if not found or c.used_count >= c.max_uses then
    raise exception 'Промокод не найден или уже использован';
  end if;

  if exists (
    select 1 from public.coupon_redemptions as redemption
    where redemption.code = c.code and redemption.user_id = auth.uid()
  ) then
    raise exception 'Этот промокод уже активирован';
  end if;

  insert into public.coupon_redemptions (code, user_id, redeemed_at)
  values (c.code, auth.uid(), v_activated_at);

  insert into public.enrollments (user_id, course_id, activated_at, expires_at, coupon_code)
  values (auth.uid(), c.course_id, v_activated_at, v_activated_at + interval '1 year', c.code)
  on conflict on constraint enrollments_pkey do update set
    activated_at = excluded.activated_at,
    expires_at = excluded.expires_at,
    coupon_code = excluded.coupon_code;

  update public.coupons
  set used_count = used_count + 1
  where code = c.code;

  return query
    select co.id, co.title from public.courses as co where co.id = c.course_id;
end;
$$;

revoke all on function public.activate_coupon(text) from public, anon;
grant execute on function public.activate_coupon(text) to authenticated;

create or replace function public.admin_list_access()
returns table (
  user_id uuid,
  course_id text,
  course_title text,
  coupon_code text,
  activated_at timestamptz,
  expires_at timestamptz,
  is_active boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles as profile
    where profile.id = auth.uid() and profile.role = 'admin'
  ) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;

  return query
    select e.user_id, e.course_id, c.title, e.coupon_code,
      e.activated_at, e.expires_at, e.expires_at > now()
    from public.enrollments as e
    join public.courses as c on c.id = e.course_id
    order by e.activated_at desc, e.user_id, e.course_id;
end;
$$;

revoke all on function public.admin_list_access() from public, anon;
grant execute on function public.admin_list_access() to authenticated;

-- An expired paid enrollment is not a current purchase for trial status.
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
    select 1 from public.enrollments as enrollment
    where enrollment.user_id = v_user
      and enrollment.course_id = 'math-first'
      and enrollment.expires_at > now()
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
  from public.math_trials as t
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
commit;
