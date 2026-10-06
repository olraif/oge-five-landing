#!/usr/bin/env bash
set -euo pipefail

# Apply the database migration before replacing the three live trainer files.
# Every live file must match the verified old or new checksum; otherwise stop.
revision=0ec2567
root=/var/www/oge-na-5
files=(study/index.html study/auth-session.js study/study.css)
old_hashes=(
  401d96f8ae69f7152ce8dd9d2c9bfe5a18aff6b9ab6835c7aea10294e2ec5283
  5e1550e31c576b075468deb021dbd3fe0ad0acf93667c95faea7890fc086e23c
  cfa86a6254c15704ab34f545edc677b9018717c5e79e551de8432f646a350cab
)
new_hashes=(
  5cb51fba82b4e83268e5f091a102d831354902156cd098c731fad299d5722fcd
  649d8734a5637f85890ec97de3860df7e02d15c43f7fecffb3a502f2ee800d3f
  a17736243bdef7862e3313b78fa0d75ce4dfcf22b1f905e7ede4e00ff4633215
)
sql_file=supabase/migrations/20261006_math_trial.sql
sql_hash=8b25fb1c2990689be5a4717226e44458c5f90c4586bc83ac8677ee51178efc40

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
command -v docker >/dev/null || fail 'Docker не найден; пришлите этот результат'
command -v curl >/dev/null || fail 'curl не найден'
command -v sha256sum >/dev/null || fail 'sha256sum не найден'

for i in "${!files[@]}"; do
  file="$root/${files[$i]}"
  [[ -f "$file" ]] || fail "нет файла $file"
  actual=$(sha256sum "$file" | cut -d ' ' -f 1)
  [[ "$actual" == "${old_hashes[$i]}" || "$actual" == "${new_hashes[$i]}" ]] ||
    fail "файл ${files[$i]} изменился на сервере ($actual); ничего не заменено"
done

mapfile -t candidates < <(docker ps --format '{{.Names}}|{{.Image}}' | awk -F '|' 'tolower($2) ~ /supabase\/postgres/ {print $1}')
[[ ${#candidates[@]} == 1 ]] || {
  docker ps --format '{{.Names}} {{.Image}}' | grep -Ei 'postgres|supabase' || true
  fail "не удалось однозначно найти контейнер базы (${#candidates[@]} найдено); пришлите этот результат"
}
db_container=${candidates[0]}

db_psql() {
  docker exec -i "$db_container" sh -c '
    export PGPASSWORD="${POSTGRES_PASSWORD:-}"
    exec psql -X -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" "$@"
  ' sh "$@"
}
[[ $(db_psql -Atc "select to_regclass('auth.users') is not null and to_regclass('public.enrollments') is not null") == t ]] ||
  fail 'выбранная база не содержит таблицы тренажёра'

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
base="https://raw.githubusercontent.com/olraif/oge-five-landing/$revision"
for i in "${!files[@]}"; do
  curl -fsSL "$base/${files[$i]}" -o "$tmp/$i"
  actual=$(sha256sum "$tmp/$i" | cut -d ' ' -f 1)
  [[ "$actual" == "${new_hashes[$i]}" ]] || fail "неверная контрольная сумма ${files[$i]}"
done
curl -fsSL "$base/$sql_file" -o "$tmp/migration.sql"
[[ $(sha256sum "$tmp/migration.sql" | cut -d ' ' -f 1) == "$sql_hash" ]] ||
  fail 'неверная контрольная сумма SQL'

backup="/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-math-trial"
for file in "${files[@]}"; do
  mkdir -p "$backup/$(dirname "$file")"
  cp -a "$root/$file" "$backup/$file"
done

db_psql -1 -f - < "$tmp/migration.sql"
[[ $(db_psql -Atc "select to_regprocedure('public.math_trial(boolean)') is not null") == t ]] ||
  fail 'функция демодоступа не появилась в базе; файлы сайта не заменены'

for i in "${!files[@]}"; do
  destination="$root/${files[$i]}"
  owner=$(stat -c %u "$destination")
  group=$(stat -c %g "$destination")
  install -m 0644 -o "$owner" -g "$group" "$tmp/$i" "$destination"
  actual=$(sha256sum "$destination" | cut -d ' ' -f 1)
  [[ "$actual" == "${new_hashes[$i]}" ]] || fail "не удалось проверить ${files[$i]}"
done
printf 'ДЕМОДОСТУП_ОПУБЛИКОВАН. Резервная копия: %s\n' "$backup"
