#!/usr/bin/env bash
set -euo pipefail
umask 077

# Run locally on the TimeWeb host, in an interactive root console. This script
# never accepts a password in its command line and never prints SMTP secrets.
fail() { printf 'Настройка остановлена: %s\n' "$*" >&2; exit 1; }
[[ $(id -u) == 0 ]] || fail 'нужен вход root в консоли сервера'
[[ -t 0 ]] || fail 'нужна интерактивная консоль для скрытого ввода пароля'
for program in docker python3; do command -v "$program" >/dev/null || fail "не найден $program"; done
docker compose version >/dev/null || fail 'Docker Compose не найден'

mapfile -t auth_ids < <(docker ps --filter 'label=com.docker.compose.service=auth' --format '{{.ID}}')
[[ ${#auth_ids[@]} == 1 ]] || fail "ожидался один работающий контейнер auth, найдено ${#auth_ids[@]}"
auth_id=${auth_ids[0]}
workdir=$(docker inspect -f '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}' "$auth_id")
project=$(docker inspect -f '{{ index .Config.Labels "com.docker.compose.project" }}' "$auth_id")
config_files=$(docker inspect -f '{{ index .Config.Labels "com.docker.compose.project.config_files" }}' "$auth_id")
[[ -d "$workdir" && -n "$project" && -n "$config_files" ]] || fail 'не удалось определить Docker Compose проект'
env_file="$workdir/.env"
[[ -f "$env_file" && ! -L "$env_file" ]] || fail "не найден обычный файл $env_file"
IFS=',' read -r -a config_paths <<< "$config_files"
compose_files=()
for file in "${config_paths[@]}"; do
  [[ -f "$file" ]] || fail "не найден Compose-файл $file"
  compose_files+=(-f "$file")
done
cd "$workdir"
compose=(docker compose -p "$project" "${compose_files[@]}")
"${compose[@]}" config --services | grep -Fx auth >/dev/null || fail 'в Compose-проекте нет сервиса auth'

printf 'Создайте в Mail.ru пароль внешнего приложения с правом «Только отправка писем».\n'
printf 'Введите его ниже; символы не будут видны и не попадут в историю команд.\n'
read -r -s -p 'Пароль приложения Mail.ru: ' smtp_pass
printf '\n'
[[ -n "$smtp_pass" && "$smtp_pass" != *$'\n'* ]] || fail 'пароль пустой или содержит перевод строки'
trap 'unset smtp_pass SMTP_PASSWORD' EXIT
export SMTP_PASSWORD="$smtp_pass"

python3 - <<'PY' || fail 'SMTP-вход в Mail.ru не удался; настройки сервера не менялись'
import os, smtplib, ssl
with smtplib.SMTP_SSL('smtp.mail.ru', 465, context=ssl.create_default_context(), timeout=20) as smtp:
    smtp.login('oge-na-5@mail.ru', os.environ['SMTP_PASSWORD'])
print('SMTP-вход Mail.ru проверен.')
PY

mkdir -m 0700 -p /root/oge-site-backups
backup_dir=$(mktemp -d "/root/oge-site-backups/$(date +%Y%m%d-%H%M%S)-auth-smtp.XXXXXX")
cp -p -- "$env_file" "$backup_dir/.env"
chmod 0600 "$backup_dir/.env"
export SMTP_ENV_FILE="$env_file"
python3 - <<'PY' || fail "Не удалось обновить .env; резервная копия: $backup_dir"
import os, pathlib, re, tempfile

path = pathlib.Path(os.environ['SMTP_ENV_FILE'])
password = os.environ['SMTP_PASSWORD']
def quote(value):
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"

values = {
    'SMTP_ADMIN_EMAIL': 'oge-na-5@mail.ru',
    'SMTP_HOST': 'smtp.mail.ru',
    'SMTP_PORT': '465',
    'SMTP_USER': 'oge-na-5@mail.ru',
    'SMTP_PASS': password,
    'SMTP_SENDER_NAME': 'ОГЭ на 5',
}
existing = path.read_text(encoding='utf-8').splitlines()
seen, updated = set(), []
for line in existing:
    match = re.match(r'^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=', line)
    key = match.group(1) if match else None
    if key in values:
        if key not in seen:
            updated.append(f'{key}={quote(values[key])}')
            seen.add(key)
    else:
        updated.append(line)
for key, value in values.items():
    if key not in seen:
        updated.append(f'{key}={quote(value)}')
fd, temp_name = tempfile.mkstemp(prefix='.smtp-', dir=path.parent)
try:
    with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as stream:
        stream.write('\n'.join(updated) + '\n')
    os.chmod(temp_name, 0o600)
    os.replace(temp_name, path)
finally:
    if os.path.exists(temp_name): os.unlink(temp_name)
PY

if ! "${compose[@]}" config --quiet >/dev/null 2>&1; then
  cp -p -- "$backup_dir/.env" "$env_file"
  fail "Compose не принял новые параметры; исходный .env восстановлен из $backup_dir"
fi
restore_auth() {
  cp -p -- "$backup_dir/.env" "$env_file"
  "${compose[@]}" up -d --no-deps --force-recreate auth >/dev/null 2>&1 || true
}
if ! "${compose[@]}" up -d --no-deps --force-recreate auth; then
  restore_auth
  fail "Не удалось перезапустить auth; прежние настройки восстановлены из $backup_dir. Проверьте контейнер auth."
fi

mapfile -t new_auth_ids < <(docker ps --filter "label=com.docker.compose.project=$project" --filter 'label=com.docker.compose.service=auth' --format '{{.ID}}')
if [[ ${#new_auth_ids[@]} != 1 ]]; then
  restore_auth
  fail "После перезапуска не найден один контейнер auth; прежние настройки восстановлены из $backup_dir"
fi
for attempt in {1..20}; do
  health=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${new_auth_ids[0]}")
  [[ "$health" == healthy || "$health" == running ]] && break
  sleep 1
done
if [[ "$health" != healthy && "$health" != running ]]; then
  restore_auth
  fail "Контейнер auth не стал доступен; прежние настройки восстановлены из $backup_dir"
fi
if ! docker inspect "${new_auth_ids[0]}" | python3 -c '
import json, os, sys
environment = dict(item.split("=", 1) for item in json.load(sys.stdin)[0]["Config"]["Env"] if "=" in item)
expected = {
    "GOTRUE_SMTP_ADMIN_EMAIL": "oge-na-5@mail.ru",
    "GOTRUE_SMTP_HOST": "smtp.mail.ru",
    "GOTRUE_SMTP_PORT": "465",
    "GOTRUE_SMTP_USER": "oge-na-5@mail.ru",
    "GOTRUE_SMTP_PASS": os.environ["SMTP_PASSWORD"],
    "GOTRUE_SMTP_SENDER_NAME": "ОГЭ на 5",
}
if any(environment.get(key) != value for key, value in expected.items()):
    raise SystemExit("SMTP-параметры не попали в auth-контейнер; проверьте Compose-файл")
print("SMTP-параметры применены в auth-контейнере; пароль не показан.")
'; then
  restore_auth
  fail "Проверка контейнера не пройдена; прежние настройки восстановлены из $backup_dir"
fi

printf 'ГОТОВО. Резервная копия прежней конфигурации: %s\n' "$backup_dir"
printf 'Теперь зарегистрируйте тестовый адрес и проверьте письмо подтверждения и ссылку в нём.\n'
