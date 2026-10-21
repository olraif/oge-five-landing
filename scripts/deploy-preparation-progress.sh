#!/usr/bin/env bash
set -euo pipefail

# Обновляет только файлы аналитики прогресса. Исходная версия должна точно
# совпадать с живым сайтом; иначе ничего не перезаписывается.
baseline=2e64f8c49cce91a7c3bc3687cf4d14c2ae54aaeb
revision=c43d662858ccee9741b29b510e5de807f6de2a2b
target=/var/www/oge-na-5/study
backup=''
published=0
files=(
  auth-session.js
  index.html
  progress-model.js
  study.css
  math/part-one/part-one.js
  math/part-one/task1-5.js
  math/part-one/task7.js
  math/part-one/task8.js
  math/part-one/task9.js
  math/part-one/task10.js
  math/part-one/task11.js
  math/part-one/task12.js
  math/part-one/task13.js
  math/part-one/task14.js
  math/part-one/task15.js
  math/part-one/task16.js
  math/part-one/task17.js
  math/part-one/task18.js
  math/part-one/task19.js
  math/part-two/part-two.js
)

tmp=$(mktemp -d)
cleanup() {
  local status=$?
  if (( status != 0 && published == 1 )); then
    echo 'Ошибка публикации: восстанавливаю резервную копию.' >&2
    for file in "${files[@]}"; do
      if [[ -f "$backup/$file" ]]; then cp -a "$backup/$file" "$target/$file"; fi
    done
  fi
  rm -rf "$tmp"
  exit "$status"
}
trap cleanup EXIT

for file in "${files[@]}"; do
  [[ -f "$target/$file" ]] || { echo "На сервере отсутствует $file" >&2; exit 1; }
  mkdir -p "$tmp/base/$(dirname "$file")" "$tmp/new/$(dirname "$file")"
  curl -fsSL "https://raw.githubusercontent.com/olraif/oge-five-landing/$baseline/study/$file" -o "$tmp/base/$file"
  cmp -s "$target/$file" "$tmp/base/$file" || { echo "Живой файл отличается от проверенной версии: $file" >&2; exit 1; }
  curl -fsSL "https://raw.githubusercontent.com/olraif/oge-five-landing/$revision/study/$file" -o "$tmp/new/$file"
done

backup="/root/oge-site-backups/$(date -u +%Y%m%dT%H%M%SZ)-preparation-progress"
for file in "${files[@]}"; do
  mkdir -p "$backup/$(dirname "$file")"
  cp -a "$target/$file" "$backup/$file"
done

published=1
for file in "${files[@]}"; do
  install -m 0644 "$tmp/new/$file" "$target/$file.new.$$"
  mv -f "$target/$file.new.$$" "$target/$file"
  cmp -s "$target/$file" "$tmp/new/$file"
done

echo "PREPARATION_PROGRESS_PUBLISHED revision=$revision backup=$backup"
