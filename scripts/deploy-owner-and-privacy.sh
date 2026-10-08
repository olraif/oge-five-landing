#!/usr/bin/env bash
set -euo pipefail

# Publish legal-owner changes and remove the analytics counter. Stop on drift.
old_revision=fc928142b2580ea5da756e9fcbae106a1c7d36fc
new_revision=6a54f785fcac5d746451b50497eb5c4c3a4f5e8e
root=/var/www/oge-na-5
files=(
  index.html study/admin.html study/choose.html study/index.html
  study/informatics/index.html study/legal/consent.html study/legal/index.html
  study/legal/offer.html study/legal/privacy.html study/legal/terms.html
  study/login.html study/math/part-one/index.html study/math/part-one/task1-5.html
  study/math/part-one/task10.html study/math/part-one/task11.html
  study/math/part-one/task12.html study/math/part-one/task13.html
  study/math/part-one/task14.html study/math/part-one/task15.html
  study/math/part-one/task16.html study/math/part-one/task17.html
  study/math/part-one/task18.html study/math/part-one/task19.html
  study/math/part-one/task7.html study/math/part-one/task8.html
  study/math/part-one/task9.html study/reset-password.html
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
  echo 'ДОКУМЕНТЫ_И_СЧЁТЧИК_УЖЕ_ОБНОВЛЕНЫ'
  exit 0
fi

backup="/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-owner-privacy"
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

echo "ДОКУМЕНТЫ_И_СЧЁТЧИК_ОБНОВЛЕНЫ: ${#changed[@]} файлов. Резервная копия: $backup"
