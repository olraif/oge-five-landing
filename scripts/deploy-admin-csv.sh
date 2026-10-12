#!/usr/bin/env bash
set -euo pipefail

revision=42a4a99803b68bc00e9695f994cfc97f3832652f
base="https://raw.githubusercontent.com/olraif/oge-five-landing/$revision/study"
target=/var/www/oge-na-5/study

if [[ ! -f "$target/admin.html" || ! -f "$target/admin-extra.css" ]]; then
  echo "Не найдены файлы админки в $target" >&2
  exit 1
fi
if ! grep -Fq admin_list_accounts "$target/admin.html"; then
  echo 'Живая админка отличается от проверенной версии. Обновление остановлено.' >&2
  exit 1
fi

tmp=$(mktemp -d)
trap 'rm -f "$tmp/admin.html" "$tmp/admin-extra.css"; rmdir "$tmp"' EXIT
curl -fsSL "$base/admin.html" -o "$tmp/admin.html"
curl -fsSL "$base/admin-extra.css" -o "$tmp/admin-extra.css"
grep -Fq download-students "$tmp/admin.html"
grep -Fq admin-panel-head "$tmp/admin-extra.css"

backup="/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-admin-csv"
mkdir -p "$backup"
cp -a "$target/admin.html" "$target/admin-extra.css" "$backup/"
install -m 0644 "$tmp/admin-extra.css" "$target/admin-extra.css"
install -m 0644 "$tmp/admin.html" "$target/admin.html"

echo "ADMIN_CSV_PUBLISHED backup=$backup"
