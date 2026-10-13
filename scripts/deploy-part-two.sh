#!/usr/bin/env bash
set -euo pipefail

# Run as root on the Timeweb server: bash deploy-part-two.sh <40-character release SHA>
# All downloads are pinned to Git commits. Any unexpected live edit aborts before changes.
revision=${1:-}
[[ $revision =~ ^[0-9a-f]{40}$ ]] || { echo 'Укажите полный SHA релиза (40 символов)' >&2; exit 1; }
base_revision=77de857655de787620bae0601050504467274785
root=/var/www/oge-na-5

files=(
  study/auth-session.js
  study/index.html
  study/math/index.html
  study/math/math-hub.css
  study/math/math-hub.js
  study/math/part-one/index.html
  study/math/part-one/part-one.css
  study/math/part-one/task1-5.html
  study/math/part-one/task7.html
  study/math/part-one/task8.html
  study/math/part-one/task9.html
  study/math/part-one/task10.html
  study/math/part-one/task11.html
  study/math/part-one/task12.html
  study/math/part-one/task13.html
  study/math/part-one/task14.html
  study/math/part-one/task15.html
  study/math/part-one/task16.html
  study/math/part-one/task17.html
  study/math/part-one/task18.html
  study/math/part-one/task19.html
  study/math/part-one/trainer-navigation.js
  study/math/part-two/algebra.html
  study/math/part-two/answer-check.js
  study/math/part-two/geometry.html
  study/math/part-two/part-two.css
  study/math/part-two/part-two.js
  study/math/part-two/data/author-bank.json
  study/math/part-two/graph-preview.js
  study/math/part-two/progress-codec.js
)
new_files=(
  study/math/index.html
  study/math/math-hub.css
  study/math/math-hub.js
  study/math/part-two/data/author-bank.json
  study/math/part-two/graph-preview.js
  study/math/part-two/progress-codec.js
)

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
[[ -d $root && ! -L $root && $(cd "$root" && pwd -P) == "$root" ]] || fail 'корень сайта не найден'
[[ -f $root/study/index.html && ! -L $root/study/index.html ]] || fail 'кабинет на сервере не найден'
for command_name in curl sha256sum install stat cp mktemp cut; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done

is_new() {
  local candidate=$1 item
  for item in "${new_files[@]}"; do [[ $candidate == "$item" ]] && return 0; done
  return 1
}
hash_file() { sha256sum "$1" | cut -d ' ' -f 1; }
check_directory() {
  local path=$1 piece current=$root
  IFS=/ read -ra pieces <<< "${path%/*}"
  for piece in "${pieces[@]}"; do
    current=$current/$piece
    [[ ! -L $current ]] || fail "символьная ссылка вместо каталога: $current"
  done
}

tmp=$(mktemp -d)
backup=''
installed=()
cleanup() {
  local exit_code=$?
  trap - EXIT
  if (( exit_code != 0 )) && [[ -n $backup ]]; then
    for file in "${installed[@]}"; do
      if [[ -f $backup/$file ]]; then
        cp -a "$backup/$file" "$root/$file" || true
      else
        rm -f -- "$root/$file"
      fi
    done
    printf 'Возврат файлов из резервной копии: %s\n' "$backup" >&2
  fi
  rm -rf -- "$tmp"
  exit "$exit_code"
}
trap cleanup EXIT

changed=()
for file in "${files[@]}"; do
  check_directory "$file"
  destination=$root/$file
  [[ ! -L $destination ]] || fail "символьная ссылка вместо файла: $destination"
  mkdir -p "$tmp/new/$(dirname "$file")" "$tmp/base/$(dirname "$file")"
  curl --proto '=https' -fsSL --max-time 30 \
    "https://raw.githubusercontent.com/olraif/oge-five-landing/$revision/$file" \
    -o "$tmp/new/$file" || fail "не удалось скачать релиз: $file"
  new_hash=$(hash_file "$tmp/new/$file")
  if is_new "$file"; then
    if [[ -f $destination ]]; then
      [[ $(hash_file "$destination") == "$new_hash" ]] || fail "неожиданный файл на сервере: $file"
    else
      changed+=("$file")
    fi
  else
    curl --proto '=https' -fsSL --max-time 30 \
      "https://raw.githubusercontent.com/olraif/oge-five-landing/$base_revision/$file" \
      -o "$tmp/base/$file" || fail "не удалось скачать базовую версию: $file"
    [[ -f $destination ]] || fail "отсутствует существующий файл: $file"
    live_hash=$(hash_file "$destination")
    [[ $live_hash == "$(hash_file "$tmp/base/$file")" || $live_hash == "$new_hash" ]] ||
      fail "файл изменился на сервере: $file ($live_hash)"
    [[ $live_hash == "$new_hash" ]] || changed+=("$file")
  fi
done

if (( ${#changed[@]} == 0 )); then
  echo 'ВТОРАЯ_ЧАСТЬ_УЖЕ_ОПУБЛИКОВАНА: все файлы совпадают с релизом'
  exit 0
fi

umask 077
backup=/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-part-two
[[ ! -e $backup ]] || fail 'каталог резервной копии уже существует'
for file in "${changed[@]}"; do
  if [[ -f $root/$file ]]; then
    mkdir -p "$backup/$(dirname "$file")"
    cp -a "$root/$file" "$backup/$file"
  fi
done

for file in "${changed[@]}"; do
  destination=$root/$file
  mkdir -p "$(dirname "$destination")"
  check_directory "$file"
  if [[ -f $destination ]]; then
    owner=$(stat -c %u "$destination")
    group=$(stat -c %g "$destination")
    mode=$(stat -c %a "$destination")
  else
    owner=$(stat -c %u "$root/study/index.html")
    group=$(stat -c %g "$root/study/index.html")
    mode=644
  fi
  installed+=("$file")
  install -m "$mode" -o "$owner" -g "$group" "$tmp/new/$file" "$destination"
  [[ $(hash_file "$destination") == "$(hash_file "$tmp/new/$file")" ]] || fail "ошибка проверки: $file"
done
echo "ВТОРАЯ_ЧАСТЬ_ОПУБЛИКОВАНА: ${#changed[@]} файлов. Резервная копия: $backup"
