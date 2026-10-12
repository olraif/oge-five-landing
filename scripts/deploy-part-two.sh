#!/usr/bin/env bash
set -euo pipefail

# Usage: bash deploy-part-two.sh <40-character Git commit SHA>
# Publishes only the cabinet index and seven new second-part files.
revision=${1:-}
[[ $revision =~ ^[0-9a-f]{40}$ ]] || { echo 'Укажите полный SHA коммита (40 символов)' >&2; exit 1; }
root=/var/www/oge-na-5
old_index_hash=4b5d68fa45d05a7ae6732abb155ded978b85c0bd4779b982bd9d90617401fc89
files=(
  study/index.html
  study/math/part-two/algebra.html
  study/math/part-two/geometry.html
  study/math/part-two/part-two.css
  study/math/part-two/part-two.js
  study/math/part-two/answer-check.js
  study/math/part-two/data/algebra-20-22.json
  study/math/part-two/data/geometry-23-25.json
)
hashes=(
  60c1b4a186bb83786408270d5f395dc795364d0c969931ef961f7570cfd7748e
  756cde5010ec2fb2f9fe76561d3eb54786e897342ccadedf303a417b4b61a5bd
  3b9196e2914db955374b06f3b87732369b39d407d82da35e962899f40fd697b5
  d4166b9ce0c8961be061699449fddb15d267b6c4056eec182b98d3ce7f9d7bc3
  dc99875cddb73caca63eaf871752b7e01335f9d50f83453e5352b51db94a3616
  f6bbebe906d1bf97b24dd13d096115170f94b58786454ca960067ab3bdca4d88
  d9fc6f1bb122f54a6d8fb2b6569b808f16604074936277972d2f7aa7cbe76f89
  8622c6b0329d47e00a34c4732e275d65b7d0bf6fdcbf8ff8afe4cbc783b1fa60
)

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
[[ -d $root && $(cd "$root" && pwd -P) == "$root" ]] || fail 'корень сайта не найден'
for command_name in curl sha256sum install stat cp mktemp; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done
for directory in "$root/study" "$root/study/math"; do
  [[ -d $directory && ! -L $directory ]] || fail "необычный каталог $directory"
done

tmp=$(mktemp -d)
backup=''
installed=()
cleanup() {
  exit_code=$?
  if (( exit_code != 0 )) && [[ -n $backup ]]; then
    for file in "${installed[@]}"; do
      if [[ -f $backup/$file ]]; then
        cp -a "$backup/$file" "$root/$file" || true
      else
        rm -f -- "$root/$file"
      fi
    done
  fi
  rm -rf -- "$tmp"
}
trap cleanup EXIT

base=https://raw.githubusercontent.com/olraif/oge-five-landing/$revision
changed=()
for i in "${!files[@]}"; do
  file=${files[$i]}
  destination=$root/$file
  mkdir -p "$tmp/$(dirname "$file")"
  curl -fsSL "$base/$file" -o "$tmp/$file"
  actual_download=$(sha256sum "$tmp/$file" | cut -d ' ' -f 1)
  [[ $actual_download == "${hashes[$i]}" ]] || fail "неверная контрольная сумма $file"
  [[ ! -L $destination ]] || fail "символьная ссылка вместо файла $destination"
  if [[ -f $destination ]]; then
    actual_live=$(sha256sum "$destination" | cut -d ' ' -f 1)
    [[ $actual_live == "${hashes[$i]}" || ( $file == study/index.html && $actual_live == $old_index_hash ) ]] ||
      fail "файл $file изменился на сервере ($actual_live); ничего не заменено"
    [[ $actual_live == "${hashes[$i]}" ]] || changed+=("$file")
  else
    [[ $file != study/index.html ]] || fail 'главная страница кабинета отсутствует'
    changed+=("$file")
  fi
done

backup=/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-part-two
for file in "${changed[@]}"; do
  if [[ -f $root/$file ]]; then
    mkdir -p "$backup/$(dirname "$file")"
    cp -a "$root/$file" "$backup/$file"
  fi
done
for file in "${changed[@]}"; do
  destination=$root/$file
  mkdir -p "$(dirname "$destination")"
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
  install -m "$mode" -o "$owner" -g "$group" "$tmp/$file" "$destination"
  expected=$(sha256sum "$tmp/$file" | cut -d ' ' -f 1)
  [[ $(sha256sum "$destination" | cut -d ' ' -f 1) == "$expected" ]] || fail "ошибка проверки $file"
done
echo "ВТОРАЯ_ЧАСТЬ_ОПУБЛИКОВАНА: ${#changed[@]} файлов. Резервная копия: $backup"
