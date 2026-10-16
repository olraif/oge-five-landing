#!/usr/bin/env bash
set -euo pipefail

# Publish only the updated public offer. No account or database data is changed.
revision=${1:-}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Укажите полный SHA коммита' >&2; exit 1; }

root=/var/www/oge-na-5
file=study/legal/offer.html
old_hash=8aa66e083ad6a29dfc508b2c29941bd3144844bf8e1894ac253e65ed6452df29
new_hash=ef4dbc3c682817fc03dff510e5614fa34751d327514a3d7b6cbf404bd7234fab
source="https://raw.githubusercontent.com/olraif/oge-five-landing/$revision/$file"
destination="$root/$file"

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
[[ -d "$root" && ! -L "$root" ]] || fail "нет обычного каталога $root"
[[ -f "$destination" && ! -L "$destination" ]] || fail "нет обычного файла $destination"
for command_name in id curl sha256sum cut install stat cp mktemp mkdir rm; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done

tmp=$(mktemp)
backup=''
installed=false
cleanup() {
  code=$?
  if (( code != 0 )) && [[ "$installed" == true && -n "$backup" ]]; then
    cp -a "$backup/offer.html" "$destination" || printf 'Не удалось восстановить %s\n' "$destination" >&2
  fi
  rm -f -- "$tmp"
}
trap cleanup EXIT

curl -fsSL --proto '=https' --tlsv1.2 "$source" -o "$tmp"
downloaded=$(sha256sum "$tmp" | cut -d ' ' -f 1)
[[ "$downloaded" == "$new_hash" ]] || fail 'контрольная сумма загруженной оферты не совпала'

current=$(sha256sum "$destination" | cut -d ' ' -f 1)
if [[ "$current" == "$new_hash" ]]; then
  echo 'ОФЕРТА_УЖЕ_ОПУБЛИКОВАНА'
  exit 0
fi
[[ "$current" == "$old_hash" ]] || fail "оферта на сервере отличается от ожидаемой ($current)"

mkdir -p /root/oge-site-backups
backup=$(mktemp -d /root/oge-site-backups/offer-20261016-XXXXXX)
cp -a "$destination" "$backup/offer.html"
owner=$(stat -c %u "$destination")
group=$(stat -c %g "$destination")
mode=$(stat -c %a "$destination")
installed=true
install -m "$mode" -o "$owner" -g "$group" "$tmp" "$destination"
actual=$(sha256sum "$destination" | cut -d ' ' -f 1)
[[ "$actual" == "$new_hash" ]] || fail 'контрольная сумма опубликованной оферты не совпала'

echo "ОФЕРТА_ОПУБЛИКОВАНА: резервная копия $backup/offer.html"
