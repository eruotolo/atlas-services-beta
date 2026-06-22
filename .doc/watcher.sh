#!/usr/bin/env bash
# Watcher de continuación automática del plan.
# Vigila .doc/plan-status.json cada 60s; si el heartbeat está stale (> STALE_SECONDS)
# lanza Claude Code en modo headless para reanudar desde el último ítem pendiente.

set -u

ROOT="$(cd "$(dirname "${0}")" && pwd)/.."
STATUS_FILE="${ROOT}/.doc/plan-status.json"
PLAN_FILE="${ROOT}/.doc/plan-config-admin-profile-login.md"
STALE_SECONDS=120
POLL_SECONDS=60

if ! command -v claude >/dev/null 2>&1; then
  echo "[watcher] 'claude' CLI no encontrado en PATH. Instala Claude Code y vuelve a lanzar." >&2
  exit 1
fi

now_epoch() {
  date +%s
}

ts_to_epoch() {
  local ts="${1:-}"
  # ISO 8601 -> epoch (macOS date compatible)
  date -j -f "%Y-%m-%dT%H:%M:%SZ" "${ts}" +%s 2>/dev/null || \
  date -d "${ts}" +%s 2>/dev/null || \
  echo 0
}

handoff() {
  echo "[watcher] $(date '+%H:%M:%S') — heartbeat stale detectado. Lanzando Claude Code…"
  claude -p "Continúa el plan ${PLAN_FILE}: lee ${STATUS_FILE}, reanuda desde el último ítem pendiente del checklist, actualiza ${STATUS_FILE} (campo ts en ISO 8601 Z) tras cada ítem, aplica typecheck → lint → build tras cada cambio. No commitear sin autorización." 2>&1 | sed 's/^/[claude] /'
  echo "[watcher] Claude Code finalizó turno. Reanudando vigilancia…"
}

while true; do
  if [[ ! -f "${STATUS_FILE}" ]]; then
    echo "[watcher] $(date '+%H:%M:%S') — falta ${STATUS_FILE}; esperando…"
    sleep "${POLL_SECONDS}"
    continue
  fi

  ts=$(grep -o '"ts"[[:space:]]*:[[:space:]]*"[^"]*"' "${STATUS_FILE}" | sed 's/.*"ts"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  if [[ -z "${ts}" ]]; then
    echo "[watcher] $(date '+%H:%M:%S') — ts ilegible; esperando…"
    sleep "${POLL_SECONDS}"
    continue
  fi

  ts_epoch=$(ts_to_epoch "${ts}")
  elapsed=$(( $(now_epoch) - ts_epoch ))

  if (( elapsed > STALE_SECONDS )); then
    echo "[watcher] $(date '+%H:%M:%S') — stale ${elapsed}s > ${STALE_SECONDS}s."
    handoff
  else
    echo "[watcher] $(date '+%H:%M:%S') — ok (${elapsed}s)"
  fi

  sleep "${POLL_SECONDS}"
done
