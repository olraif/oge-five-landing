#!/usr/bin/env bash
set -euo pipefail

# Publish only the task 8 formula layout fix. No account or database data is changed.
revision=${1:-}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Укажите полный SHA коммита' >&2; exit 1; }

root=/var/www/oge-na-5
base="https://raw.githubusercontent.com/olraif/oge-five-landing/$revision"
files=(study/math/part-one/task8.css study/math/part-one/task8.html)
declare -A old_hash=(
  [study/math/part-one/task8.css]=f1219cb2d40d703975e906711035ada1f3c5002c9179a5b6e220a5259887a3a2
  [study/math/part-one/task8.html]=673ec56a49f5e0d4a46fabaa41668ad5e7f9ab53db72938765615c0cd4efee81
)
declare -A new_hash=(
  [study/math/part-one/task8.css]=2e06c70d58269556041820ef69a16d929258eaff1e00e606f5fd79da787ba3a1
  [study/math/part-one/task8.html]=4999a9a5edbdeaadea0a70eb0002eb5cbe764864e9b55058902b411f25dbce77
)

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
[[ -d "$root" && ! -L "$root" ]] || fail "нет обычного каталога $root"
for command_name in id curl sha256sum cut install stat cp mktemp mkdir dirname rm; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done

tmp=$(mktemp -d)
backup=''
installed=()
cleanup() {
  code=$?
  if (( code != 0 )) && [[ -n "$backup" ]]; then
    for file in "${installed[@]}"; do
      cp -a "$backup/$file" "$root/$file" || printf 'Не удалось восстановить %s\n' "$file" >&2
    done
  fi
  rm -rf -- "$tmp"
}
trap cleanup EXIT

changed=()
for file in "${files[@]}"; do
  destination="$root/$file"
  [[ -f "$destination" && ! -L "$destination" ]] || fail "нет обычного файла $destination"
  mkdir -p "$tmp/$(dirname "$file")"
  curl -fsSL --proto '=https' --tlsv1.2 "$base/$file" -o "$tmp/$file"
  downloaded=$(sha256sum "$tmp/$file" | cut -d ' ' -f 1)
  [[ "$downloaded" == "${new_hash[$file]}" ]] || fail "контрольная сумма источника не совпала: $file"
  current=$(sha256sum "$destination" | cut -d ' ' -f 1)
  if [[ "$current" != "${new_hash[$file]}" ]]; then
    [[ "$current" == "${old_hash[$file]}" ]] || fail "файл на сервере отличается от ожидаемого: $file ($current)"
    changed+=("$file")
  fi
done

if (( ${#changed[@]} == 0 )); then
  echo 'ФОРМУЛЫ_8_УЖЕ_ОПУБЛИКОВАНЫ'
  exit 0
fi

mkdir -p /root/oge-site-backups
backup=$(mktemp -d /root/oge-site-backups/task8-formula-20261018-XXXXXX)
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
  install -m "$mode" -o "$owner" -g "$group" "$tmp/$file" "$destination"
  actual=$(sha256sum "$destination" | cut -d ' ' -f 1)
  [[ "$actual" == "${new_hash[$file]}" ]] || fail "ошибка проверки установленного файла: $file"
done

echo "ФОРМУЛЫ_8_ОПУБЛИКОВАНЫ: ${#changed[@]} файлов; резервная копия: $backup"
