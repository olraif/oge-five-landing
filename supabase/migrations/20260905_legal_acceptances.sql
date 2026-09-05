begin;

alter table public.profiles add column if not exists consent_accepted_at timestamptz;
alter table public.profiles add column if not exists consent_version text;
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles add column if not exists terms_version text;

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

commit;
