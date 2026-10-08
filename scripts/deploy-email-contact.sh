#!/usr/bin/env bash
set -euo pipefail

# Publish only purchase/support email links, stopping if live files have drifted.
old_revision=9fe66f8ff9e6395299cc1197aebe8edf4216ae24
new_revision=6d9b369eebc0cedd5d6219fbbaa830590c1844c8
root=/var/www/oge-na-5
files=(
  site.js
  study/index.html
  study/informatics/index.html
  study/legal/terms.html
  study/math/part-one/index.html
)

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
for command_name in curl sha256sum install stat cp mktemp; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done

tmp=$(mktemp -d)
backup=''
installed=()
cleanup() {
  exit_code=$?
  if (( exit_code != 0 )) && [[ -n "$backup" ]]; then
    for file in "${installed[@]}"; do
      cp -a "$backup/$file" "$root/$file" ||
        printf 'Не удалось восстановить %s из %s\n' "$file" "$backup" >&2
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
    [[ "$actual" == "$old_hash" ]] ||
      fail "файл $file изменился на сервере ($actual); ничего не заменено"
    changed+=("$file")
  fi
done

if (( ${#changed[@]} == 0 )); then
  echo 'ПОЧТА_УЖЕ_ОБНОВЛЕНА'
  exit 0
fi

backup="/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-email-contact"
for file in "${changed[@]}"; do
  mkdir -p "$backup/$(dirname "$file")"
  cp -a "$root/$file" "$backup/$file"
done

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

echo "ПОЧТА_ОБНОВЛЕНА: ${#changed[@]} файлов. Резервная копия: $backup"
