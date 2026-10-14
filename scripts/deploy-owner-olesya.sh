#!/usr/bin/env bash
set -euo pipefail

# Run as root on the Timeweb server: bash deploy-owner-olesya.sh <40-character release SHA>
# Refuse unexpected live edits; preserve a backup and roll back on failure.
revision=${1:-}
[[ $revision =~ ^[0-9a-f]{40}$ ]] || { echo 'Укажите полный SHA релиза (40 символов)' >&2; exit 1; }
base_revision=d1b4ddf51a77d94744f2deb080659c9709363bdb
root=/var/www/oge-na-5
files=(
  study/legal/privacy.html
  study/legal/consent.html
  study/legal/offer.html
  study/legal/terms.html
  study/login.html
)

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
[[ -d $root && ! -L $root && $(cd "$root" && pwd -P) == "$root" ]] || fail 'корень сайта не найден'
for command_name in curl sha256sum install stat cp mktemp cut; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done

tmp=$(mktemp -d)
backup=''
installed=()
cleanup() {
  local exit_code=$?
  trap - EXIT
  if (( exit_code != 0 )) && [[ -n $backup ]]; then
    for file in "${installed[@]}"; do
      cp -a "$backup/$file" "$root/$file" || true
    done
    printf 'Возврат файлов из резервной копии: %s\n' "$backup" >&2
  fi
  rm -rf -- "$tmp"
  exit "$exit_code"
}
trap cleanup EXIT
hash_file() { sha256sum "$1" | cut -d ' ' -f 1; }

changed=()
for file in "${files[@]}"; do
  destination=$root/$file
  [[ -f $destination && ! -L $destination ]] || fail "нет обычного файла $destination"
  mkdir -p "$tmp/base/$(dirname "$file")" "$tmp/new/$(dirname "$file")"
  curl --proto '=https' -fsSL --max-time 30 \
    "https://raw.githubusercontent.com/olraif/oge-five-landing/$base_revision/$file" \
    -o "$tmp/base/$file" || fail "не удалось скачать базовую версию: $file"
  curl --proto '=https' -fsSL --max-time 30 \
    "https://raw.githubusercontent.com/olraif/oge-five-landing/$revision/$file" \
    -o "$tmp/new/$file" || fail "не удалось скачать релиз: $file"
  live_hash=$(hash_file "$destination")
  new_hash=$(hash_file "$tmp/new/$file")
  [[ $live_hash == "$(hash_file "$tmp/base/$file")" || $live_hash == "$new_hash" ]] ||
    fail "файл изменился на сервере: $file ($live_hash)"
  [[ $live_hash == "$new_hash" ]] || changed+=("$file")
done

if (( ${#changed[@]} == 0 )); then
  echo 'ДАННЫЕ_ВЛАДЕЛЬЦА_УЖЕ_ОПУБЛИКОВАНЫ'
  exit 0
fi

umask 077
backup=/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-owner-olesya
[[ ! -e $backup ]] || fail 'каталог резервной копии уже существует'
for file in "${changed[@]}"; do
  mkdir -p "$backup/$(dirname "$file")"
  cp -a "$root/$file" "$backup/$file"
done

for file in "${changed[@]}"; do
  destination=$root/$file
  owner=$(stat -c %u "$destination")
  group=$(stat -c %g "$destination")
  mode=$(stat -c %a "$destination")
  installed+=("$file")
  install -m "$mode" -o "$owner" -g "$group" "$tmp/new/$file" "$destination"
  [[ $(hash_file "$destination") == "$(hash_file "$tmp/new/$file")" ]] || fail "ошибка проверки: $file"
done
echo "ДАННЫЕ_ВЛАДЕЛЬЦА_ОПУБЛИКОВАНЫ: ${#changed[@]} файлов. Резервная копия: $backup"
