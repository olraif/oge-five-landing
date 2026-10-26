#!/usr/bin/env bash
set -euo pipefail

# Обновляет только сводку прогресса и недельный план в количестве заданий.
# При любом неожиданном изменении файлов на сервере публикация отменяется.
baseline=4fe1b302fcb3ab6421d1dd18d5b0f4b16627ebc4
revision=3582105bbd4bce30bbd049f3b3bf606b8f162fb5
target=/var/www/oge-na-5/study
backup=''
published=0
files=(index.html study.css progress-model.js)

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
  curl -fsSL "https://raw.githubusercontent.com/olraif/oge-five-landing/$baseline/study/$file" -o "$tmp/base-$file"
  cmp -s "$target/$file" "$tmp/base-$file" || { echo "Живой файл отличается от проверенной версии: $file" >&2; exit 1; }
  curl -fsSL "https://raw.githubusercontent.com/olraif/oge-five-landing/$revision/study/$file" -o "$tmp/new-$file"
done

backup="/root/oge-site-backups/$(date -u +%Y%m%dT%H%M%SZ)-progress-task-counts"
mkdir -p "$backup"
for file in "${files[@]}"; do cp -a "$target/$file" "$backup/$file"; done

published=1
for file in "${files[@]}"; do
  install -m 0644 "$tmp/new-$file" "$target/$file.new.$$"
  mv -f "$target/$file.new.$$" "$target/$file"
  cmp -s "$target/$file" "$tmp/new-$file"
done

echo "PROGRESS_TASK_COUNTS_PUBLISHED revision=$revision backup=$backup"
