#!/usr/bin/env bash
set -u

MAIL_TO="${MAIL_TO:-you@example.com}"
MAIL_FROM="${MAIL_FROM:-root@$(hostname -f 2>/dev/null || hostname)}"
APP_URL="${APP_URL:-http://127.0.0.1:3002/}"
LOG_FILE="${LOG_FILE:-/var/log/nginx/access.log}"
CHECK_TIMEOUT="${CHECK_TIMEOUT:-10}"
STALE_SECONDS="${STALE_SECONDS:-600}"
SERVICE_NAME="${SERVICE_NAME:-nginx}"
EMAIL_SUBJECT_PREFIX="${EMAIL_SUBJECT_PREFIX:-[gshock-server-health]}"

send_alert() {
  local subject="$1"
  local body="$2"

  if [[ -z "${MAIL_TO:-}" || "${MAIL_TO}" == "you@example.com" ]]; then
    echo "[$(date -Is)] ALERT: ${subject}" >&2
    echo "$body" >&2
    return 0
  fi

  local mailer=""
  for candidate in mail mailx sendmail; do
    if command -v "$candidate" >/dev/null 2>&1; then
      mailer="$candidate"
      break
    fi
  done

  if [[ -z "$mailer" ]]; then
    echo "[$(date -Is)] ALERT: ${subject}" >&2
    echo "$body" >&2
    echo "No mail program is installed on this server. Set MAIL_TO to a valid address once a mail transport is configured." >&2
    return 0
  fi

  case "$mailer" in
    sendmail)
      printf 'From: %s\nTo: %s\nSubject: %s\n\n%s\n' "$MAIL_FROM" "$MAIL_TO" "$EMAIL_SUBJECT_PREFIX $subject" "$body" | sendmail -t
      ;;
    *)
      printf '%s\n' "$body" | "$mailer" -s "$EMAIL_SUBJECT_PREFIX $subject" "$MAIL_TO"
      ;;
  esac
}

check_health() {
  if ! systemctl is-active --quiet "$SERVICE_NAME"; then
    local body
    body=$(cat <<EOF
Nginx is no longer active.
Time: $(date -Is)
Service: $SERVICE_NAME
Check: systemctl status $SERVICE_NAME
Journal: journalctl -u $SERVICE_NAME -n 100
EOF
)
    send_alert "nginx stopped" "$body"
    return 1
  fi

  if ! curl --max-time "$CHECK_TIMEOUT" -fsS "$APP_URL" >/dev/null 2>&1; then
    local body
    body=$(cat <<EOF
The application is not responding at $APP_URL.
Time: $(date -Is)
Service: $SERVICE_NAME
Check: curl -I $APP_URL
EOF
)
    send_alert "application unreachable" "$body"
    return 1
  fi

  if [[ -f "$LOG_FILE" ]]; then
    local now_ts file_ts age_seconds
    now_ts=$(date +%s)
    file_ts=$(stat -c %Y "$LOG_FILE" 2>/dev/null || echo 0)
    age_seconds=$((now_ts - file_ts))

    if (( age_seconds > STALE_SECONDS )); then
      local body
      body=$(cat <<EOF
The access log has not updated in $age_seconds seconds.
Time: $(date -Is)
Log file: $LOG_FILE
Last modified: $(date -d @"$file_ts" -Is 2>/dev/null || echo "$file_ts")
EOF
)
      send_alert "nginx access log stale" "$body"
      return 1
    fi
  fi

  echo "[$(date -Is)] health check OK"
  return 0
}

check_health
