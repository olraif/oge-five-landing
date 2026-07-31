-- Права администратора для кабинета управления.
-- Выполнить после schema.sql в Supabase SQL Editor.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- В проекте предусмотрен один административный аккаунт.
-- Новые пользователи создаются со статусом student, а второй admin
-- не сможет быть назначен случайно.
create unique index if not exists one_admin_profile
  on public.profiles ((role))
  where role = 'admin';

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage courses" on public.courses;
create policy "admins manage courses" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage lessons" on public.lessons;
create policy "admins manage lessons" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage enrollments" on public.enrollments;
create policy "admins manage enrollments" on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage coupons" on public.coupons;
create policy "admins manage coupons" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins see redemptions" on public.coupon_redemptions;
create policy "admins see redemptions" on public.coupon_redemptions
  for select using (public.is_admin());

grant execute on function public.is_admin() to authenticated;
