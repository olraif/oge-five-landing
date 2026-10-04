#!/usr/bin/env bash
set -euo pipefail

# Publish only the two trainer pricing pages. Abort if the live files have
# changed since the verified baseline so unrelated server edits are preserved.
root=/var/www/oge-na-5/study
revision=bee36dd20c10e4b8aa784fad213f451350d15185
old_math=bab4972b4cab4c063398b88f57e20587671401af4e3bedfde931ebdd260e0425
old_info=e911283523233bd192e25c216e730e616ef3ac11c6c82b5454a8d2cec81b6bd5
new_math=401d96f8ae69f7152ce8dd9d2c9bfe5a18aff6b9ab6835c7aea10294e2ec5283
new_info=857e021db2afd4ad73f009ca644c60d671a308177cafa3657ed59f321a87151c

math_file="$root/index.html"
info_file="$root/informatics/index.html"
math_hash=$(sha256sum "$math_file" | cut -d ' ' -f 1)
info_hash=$(sha256sum "$info_file" | cut -d ' ' -f 1)
if [[ "$math_hash" == "$new_math" && "$info_hash" == "$new_info" ]]; then
  echo 'Цены 1 490 ₽ уже опубликованы.'
  exit 0
fi
if [[ "$math_hash" != "$old_math" || "$info_hash" != "$old_info" ]]; then
  echo 'Файлы на сервере изменились; публикация остановлена без замены.' >&2
  exit 1
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
base="https://raw.githubusercontent.com/olraif/oge-five-landing/$revision/study"
curl -fsSL "$base/index.html" -o "$tmp/math.html"
curl -fsSL "$base/informatics/index.html" -o "$tmp/info.html"
printf '%s  %s\n' "$new_math" "$tmp/math.html" "$new_info" "$tmp/info.html" | sha256sum -c -

backup="/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-price-1490"
mkdir -p "$backup/informatics"
cp -a "$math_file" "$backup/index.html"
cp -a "$info_file" "$backup/informatics/index.html"
install -m 0644 -o root -g caddy "$tmp/math.html" "$math_file"
install -m 0644 -o root -g caddy "$tmp/info.html" "$info_file"
printf '%s  %s\n' "$new_math" "$math_file" "$new_info" "$info_file" | sha256sum -c -
echo "Цены 1 490 ₽ опубликованы. Резервная копия: $backup"
