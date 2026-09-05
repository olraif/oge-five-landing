-- Структура кабинета ученика для oge-na-5.ru
-- Выполнить целиком в Supabase → SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Ученик',
  subject text not null default 'math' check (subject in ('math', 'informatics')),
  avatar text not null default '🎓',
  role text not null default 'student' check (role in ('student', 'admin')),
  consent_accepted_at timestamptz,
  consent_version text,
  terms_accepted_at timestamptz,
  terms_version text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists consent_accepted_at timestamptz;
alter table public.profiles add column if not exists consent_version text;
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles add column if not exists terms_version text;

create table if not exists public.courses (
  id text primary key,
  subject text not null check (subject in ('math', 'informatics')),
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  code text not null,
  title text not null,
  description text not null default '',
  video_url text,
  pdf_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (course_id, code)
);

create table if not exists public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  activated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct >= 0 and correct <= attempts),
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.coupons (
  code text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  max_uses integer not null default 1 check (max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coupon_redemptions (
  code text not null references public.coupons(code) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (code, user_id)
);

insert into public.courses (id, subject, title, description, sort_order)
values
  ('math-first', 'math', 'Первая часть ОГЭ', 'Задания 1–19 из актуального банка ФИПИ.', 1),
  ('math-algebra', 'math', 'Вторая часть: алгебра', 'Разбор и практика алгебраических заданий.', 2),
  ('math-geometry', 'math', 'Вторая часть: геометрия', 'Разбор и практика геометрических заданий.', 3),
  ('informatics-first', 'informatics', 'Информатика: первая часть', 'Ответы с автоматической проверкой.', 1),
  ('informatics-second', 'informatics', 'Информатика: вторая часть', 'Практика с самопроверкой по решению.', 2)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    consent_accepted_at,
    consent_version,
    terms_accepted_at,
    terms_version
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Ученик'),
    case when new.raw_user_meta_data->>'personal_data_consent' = 'true' then now() end,
    case when new.raw_user_meta_data->>'personal_data_consent' = 'true' then nullif(new.raw_user_meta_data->>'consent_version', '') end,
    case when new.raw_user_meta_data->>'trainer_terms_accepted' = 'true' then now() end,
    case when new.raw_user_meta_data->>'trainer_terms_accepted' = 'true' then nullif(new.raw_user_meta_data->>'terms_version', '') end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.activate_coupon(p_code text)
returns table (course_id text, course_title text)
language plpgsql
security definer set search_path = public
as $$
declare
  c public.coupons%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Необходим вход в кабинет';
  end if;

  select * into c
  from public.coupons
  where upper(code) = upper(trim(p_code))
    and is_active = true
    and (expires_at is null or expires_at > now())
  for update;

  if not found or c.used_count >= c.max_uses then
    raise exception 'Промокод не найден или уже использован';
  end if;

  if exists (
    select 1 from public.coupon_redemptions
    where code = c.code and user_id = auth.uid()
  ) then
    raise exception 'Этот промокод уже активирован';
  end if;

  insert into public.coupon_redemptions (code, user_id) values (c.code, auth.uid());
  insert into public.enrollments (user_id, course_id)
  values (auth.uid(), c.course_id)
  on conflict on constraint enrollments_pkey do nothing;
  update public.coupons set used_count = used_count + 1 where code = c.code;

  return query
    select co.id, co.title from public.courses co where co.id = c.course_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

drop policy if exists "profiles own data" on public.profiles;
create policy "profiles own data" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "published courses are visible" on public.courses;
create policy "published courses are visible" on public.courses
  for select using (is_published = true);

drop policy if exists "published lessons are visible" on public.lessons;
create policy "published lessons are visible" on public.lessons
  for select using (is_published = true);

drop policy if exists "students see own enrollments" on public.enrollments;
create policy "students see own enrollments" on public.enrollments
  for select using (user_id = auth.uid());

drop policy if exists "students manage own progress" on public.lesson_progress;
create policy "students manage own progress" on public.lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "students see own redemptions" on public.coupon_redemptions;
create policy "students see own redemptions" on public.coupon_redemptions
  for select using (user_id = auth.uid());

revoke all on public.coupons from anon, authenticated;
revoke all on public.coupon_redemptions from anon, authenticated;
grant execute on function public.activate_coupon(text) to authenticated;
