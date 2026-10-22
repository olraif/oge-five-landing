#!/usr/bin/env bash
set -euo pipefail

# Обновляет только карточку темпа подготовки и её стили.
# Если файлы сервера отличаются от проверенной версии, публикация отменяется.
baseline=c43d662858ccee9741b29b510e5de807f6de2a2b
revision=4fe1b302fcb3ab6421d1dd18d5b0f4b16627ebc4
target=/var/www/oge-na-5/study
backup=''
published=0
files=(index.html study.css)

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

backup="/root/oge-site-backups/$(date -u +%Y%m%dT%H%M%SZ)-preparation-card"
mkdir -p "$backup"
for file in "${files[@]}"; do cp -a "$target/$file" "$backup/$file"; done

published=1
for file in "${files[@]}"; do
  install -m 0644 "$tmp/new-$file" "$target/$file.new.$$"
  mv -f "$target/$file.new.$$" "$target/$file"
  cmp -s "$target/$file" "$tmp/new-$file"
done

echo "PREPARATION_CARD_PUBLISHED revision=$revision backup=$backup"
