#!/usr/bin/env bash
set -euo pipefail

# Publish yearly access and the admin coupon/date columns. Stop if live files drifted.
old_revision=347c214
csv_revision=b50b4eb
live_admin_hash=b7bd2e92f1a41c7158197c3dad6190a83a8a87351037a611c78a05b370bae878
new_revision=75fc9ca61cd3edbd338e9a19c0543a24b8edc26e
root=/var/www/oge-na-5
files=(study/admin.html study/admin-extra.css study/auth-session.js study/index.html)
sql_file=supabase/migrations/20261012_yearly_course_access.sql

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
for command_name in docker curl sha256sum install stat cp mktemp; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done

mapfile -t candidates < <(docker ps --format '{{.Names}}|{{.Image}}' | awk -F '|' 'tolower($2) ~ /^supabase\/postgres(:|@|$)/ {print $1}')
[[ ${#candidates[@]} == 1 ]] || fail "не удалось однозначно найти контейнер базы (${#candidates[@]} найдено)"
db_container=${candidates[0]}
db_psql() {
  docker exec -i "$db_container" sh -c '
    export PGPASSWORD="${POSTGRES_PASSWORD:-}"
    exec psql -X -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" "$@"
  ' sh "$@"
}
[[ $(db_psql -Atc "select to_regclass('auth.users') is not null and to_regclass('public.enrollments') is not null and to_regclass('public.math_trials') is not null") == t ]] ||
  fail 'выбранная база не содержит таблицы тренажёра и демодоступа'

tmp=$(mktemp -d)
backup=''
installed=()
cleanup() {
  exit_code=$?
  if (( exit_code != 0 )) && [[ -n "$backup" ]]; then
    for file in "${installed[@]}"; do
      cp -a "$backup/$file" "$root/$file" || printf 'Не удалось восстановить %s\n' "$file" >&2
    done
  fi
  rm -rf "$tmp"
}
trap cleanup EXIT

base=https://raw.githubusercontent.com/olraif/oge-five-landing
changed=()
for file in "${files[@]}"; do
  destination="$root/$file"
  [[ -f "$destination" && ! -L "$destination" ]] || fail "нет обычного файла $destination"
  mkdir -p "$tmp/old/$(dirname "$file")" "$tmp/new/$(dirname "$file")"
  curl -fsSL "$base/$old_revision/$file" -o "$tmp/old/$file"
  curl -fsSL "$base/$new_revision/$file" -o "$tmp/new/$file"
  old_hash=$(sha256sum "$tmp/old/$file" | cut -d ' ' -f 1)
  new_hash=$(sha256sum "$tmp/new/$file" | cut -d ' ' -f 1)
  actual=$(sha256sum "$destination" | cut -d ' ' -f 1)
  if [[ "$actual" != "$new_hash" ]]; then
    if [[ "$file" == study/admin.html ]]; then
      curl -fsSL "$base/$csv_revision/$file" -o "$tmp/admin-live-old.html"
      csv_hash=$(sha256sum "$tmp/admin-live-old.html" | cut -d ' ' -f 1)
      [[ "$actual" == "$old_hash" || "$actual" == "$csv_hash" || "$actual" == "$live_admin_hash" ]] ||
        fail "файл $file изменился на сервере ($actual); ничего не заменено"
    else
      [[ "$actual" == "$old_hash" ]] || fail "файл $file изменился на сервере ($actual); ничего не заменено"
    fi
    changed+=("$file")
  fi
done
curl -fsSL "$base/$new_revision/$sql_file" -o "$tmp/migration.sql"
[[ $(sha256sum "$tmp/migration.sql" | cut -d ' ' -f 1) == 05bc6ad33c2186d62dec72c00a0585bc128bf821ce82b2c2f8320cab673e894f ]] || fail 'неверная контрольная сумма SQL'

backup="/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-yearly-access"
for file in "${changed[@]}"; do
  mkdir -p "$backup/$(dirname "$file")"
  cp -a "$root/$file" "$backup/$file"
done

# The migration starts its own transaction and rolls back on any SQL error.
db_psql -f - < "$tmp/migration.sql"
[[ $(db_psql -Atc "select exists(select 1 from information_schema.columns where table_schema='public' and table_name='enrollments' and column_name='expires_at') and to_regprocedure('public.admin_list_access()') is not null") == t ]] ||
  fail 'годовой срок или административная функция не появились в базе; файлы сайта не заменены'

for file in "${changed[@]}"; do
  destination="$root/$file"
  owner=$(stat -c %u "$destination")
  group=$(stat -c %g "$destination")
  mode=$(stat -c %a "$destination")
  installed+=("$file")
  install -m "$mode" -o "$owner" -g "$group" "$tmp/new/$file" "$destination"
  expected=$(sha256sum "$tmp/new/$file" | cut -d ' ' -f 1)
  printf '%s  %s\n' "$expected" "$destination" | sha256sum -c - >/dev/null
done

echo "ГОДОВОЙ_ДОСТУП_ОПУБЛИКОВАН: ${#changed[@]} файлов. Резервная копия: $backup"
