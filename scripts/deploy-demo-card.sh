#!/usr/bin/env bash
set -euo pipefail

# Publish only the demo button copy and its empty-message styling.
# Stop if either live file differs from the verified server baseline.
revision=0ca88f07cc672e938c7e12568c291c47d59503c7
root=/var/www/oge-na-5
files=(study/index.html study/study.css)
old_hashes=(
  5cb51fba82b4e83268e5f091a102d831354902156cd098c731fad299d5722fcd
  a17736243bdef7862e3313b78fa0d75ce4dfcf22b1f905e7ede4e00ff4633215
)
new_hashes=(
  2c994fc491b0f56970d845bc0306267bc37e69d0fe4402a0fc6f21f64fc121d7
  6cbf91b2e1c4c062678b141f5b334733d7dc0b4518ec954aa8428843d1dc8529
)

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
for command_name in curl sha256sum install stat; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done

already_published=1
for i in "${!files[@]}"; do
  destination="$root/${files[$i]}"
  [[ -f "$destination" ]] || fail "нет файла $destination"
  actual=$(sha256sum "$destination" | cut -d ' ' -f 1)
  if [[ "$actual" != "${new_hashes[$i]}" ]]; then
    already_published=0
    [[ "$actual" == "${old_hashes[$i]}" ]] ||
      fail "файл ${files[$i]} изменился на сервере ($actual); ничего не заменено"
  fi
done
if [[ "$already_published" == 1 ]]; then
  echo 'ДЕМО-КАРТОЧКА_УЖЕ_ОПУБЛИКОВАНА'
  exit 0
fi

tmp=$(mktemp -d)
backup=''
cleanup() {
  exit_code=$?
  if (( exit_code != 0 )) && [[ -n "$backup" ]]; then
    for file in "${files[@]}"; do
      if [[ -f "$backup/$file" ]]; then
        cp -a "$backup/$file" "$root/$file" ||
          printf 'Не удалось восстановить %s из %s\n' "$file" "$backup" >&2
      fi
    done
  fi
  rm -rf "$tmp"
}
trap cleanup EXIT

base="https://raw.githubusercontent.com/olraif/oge-five-landing/$revision"
for i in "${!files[@]}"; do
  file="${files[$i]}"
  mkdir -p "$tmp/$(dirname "$file")"
  curl -fsSL "$base/$file" -o "$tmp/$file"
  printf '%s  %s\n' "${new_hashes[$i]}" "$tmp/$file" | sha256sum -c -
done

backup="/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-demo-card"
for file in "${files[@]}"; do
  mkdir -p "$backup/$(dirname "$file")"
  cp -a "$root/$file" "$backup/$file"
done

for i in "${!files[@]}"; do
  file="${files[$i]}"
  destination="$root/$file"
  owner=$(stat -c %u "$destination")
  group=$(stat -c %g "$destination")
  install -m 0644 -o "$owner" -g "$group" "$tmp/$file" "$destination"
  printf '%s  %s\n' "${new_hashes[$i]}" "$destination" | sha256sum -c -
done

echo "ДЕМО-КАРТОЧКА_ОПУБЛИКОВАНА. Резервная копия: $backup"
