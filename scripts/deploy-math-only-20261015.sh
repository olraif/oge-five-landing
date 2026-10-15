#!/usr/bin/env bash
set -euo pipefail

# Publish the math-only public site and neutral account wording.
# No database rows, user accounts, or Roskomnadzor records are changed.
revision=${1:-}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Укажите полный SHA коммита' >&2; exit 1; }
root=/var/www/oge-na-5
base="https://raw.githubusercontent.com/olraif/oge-five-landing/$revision"
files=(index.html study/login.html study/legal/privacy.html study/legal/consent.html study/legal/terms.html)
declare -A old_hash=(
  [index.html]=f37fd0bf93d8e7c10a460b7e3652f2b926f780949d1ab88df961168c5f015b93
  [study/login.html]=94106cfd8679e36164ef60a6d7ac977851b9e34aee386916dbae3eff7077f538
  [study/legal/privacy.html]=014b7f97877f0a74b61e3e450a0a28ba4d5b9135189beb20afb5f669b37ce39e
  [study/legal/consent.html]=157e6320e9558414bc4dbd99adeebef36fc513335392ca7dfbd4f66c25908468
  [study/legal/terms.html]=608a8c567d549b9ad1d899c8598d2a7e4cebeb8f6731e7b8afac88f1fc776dd2
)
declare -A new_hash=(
  [index.html]=9c67cd0129d5740249825bdbdaca79f1ce30cdf2b4e58880fd7777573a27bd13
  [study/login.html]=a01140bd118a2ee49717f42a2dd194b84ec98b760486a1dc9ae5d7713d8a58d5
  [study/legal/privacy.html]=19348d1b3629a5a632ac63e1346ed21e7caacad5b88cad78d46738763a070ccf
  [study/legal/consent.html]=8bbf8c0c8dfecf4ff94d72308e55d833281278bfb76aa54106e29449842af3bd
  [study/legal/terms.html]=17a5e1ad0f06e3e99686dfe823378476de7f10fcb7e8d18bb965297537d10033
)
obsolete=study/informatics/index.html
obsolete_hash=970252b2f1200f0dd6a23eb2eef5b35dfb337780caff203b105021dcb29752a1

fail() { printf 'Публикация остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
[[ -d "$root" && ! -L "$root" ]] || fail "нет обычного каталога $root"
for command_name in curl sha256sum install stat cp mktemp mkdir rm; do
  command -v "$command_name" >/dev/null || fail "не найдена команда $command_name"
done

tmp=$(mktemp -d)
backup=''
installed=()
removed=false
cleanup() {
  code=$?
  if (( code != 0 )) && [[ -n "$backup" ]]; then
    for file in "${installed[@]}"; do
      cp -a "$backup/$file" "$root/$file" || printf 'Не удалось восстановить %s\n' "$file" >&2
    done
    if [[ "$removed" == true ]]; then
      cp -a "$backup/$obsolete" "$root/$obsolete" || printf 'Не удалось восстановить %s\n' "$obsolete" >&2
    fi
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
  actual=$(sha256sum "$destination" | cut -d ' ' -f 1)
  if [[ "$actual" != "${new_hash[$file]}" ]]; then
    [[ "$actual" == "${old_hash[$file]}" ]] || fail "файл на сервере изменён: $file ($actual)"
    changed+=("$file")
  fi
done

remove_obsolete=false
if [[ -e "$root/$obsolete" || -L "$root/$obsolete" ]]; then
  [[ -f "$root/$obsolete" && ! -L "$root/$obsolete" ]] || fail "необычный путь $root/$obsolete"
  actual=$(sha256sum "$root/$obsolete" | cut -d ' ' -f 1)
  [[ "$actual" == "$obsolete_hash" ]] || fail "страница информатики изменена на сервере ($actual)"
  remove_obsolete=true
fi

if (( ${#changed[@]} == 0 )) && [[ "$remove_obsolete" == false ]]; then
  echo 'МАТЕМАТИКА_УЖЕ_ОПУБЛИКОВАНА'
  exit 0
fi

backup="/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-math-only"
for file in "${changed[@]}"; do
  mkdir -p "$backup/$(dirname "$file")"
  cp -a "$root/$file" "$backup/$file"
done
if [[ "$remove_obsolete" == true ]]; then
  mkdir -p "$backup/$(dirname "$obsolete")"
  cp -a "$root/$obsolete" "$backup/$obsolete"
fi

for file in "${changed[@]}"; do
  destination="$root/$file"
  owner=$(stat -c %u "$destination")
  group=$(stat -c %g "$destination")
  mode=$(stat -c %a "$destination")
  installed+=("$file")
  install -m "$mode" -o "$owner" -g "$group" "$tmp/$file" "$destination"
  actual=$(sha256sum "$destination" | cut -d ' ' -f 1)
  [[ "$actual" == "${new_hash[$file]}" ]] || fail "ошибка проверки установленного файла $file"
done
if [[ "$remove_obsolete" == true ]]; then
  rm -- "$root/$obsolete"
  removed=true
fi
echo "МАТЕМАТИКА_ОПУБЛИКОВАНА: ${#changed[@]} файлов; информатика удалена=$remove_obsolete; резервная копия: $backup"
