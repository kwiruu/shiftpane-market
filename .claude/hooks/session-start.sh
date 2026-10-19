#!/bin/bash
# Installs dependencies at the start of a Claude Code cloud session so lint, typecheck, tests and
# the build work immediately. Does nothing on local machines.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export TURBO_TELEMETRY_DISABLED=1' >> "$CLAUDE_ENV_FILE"
  echo 'export NEXT_TELEMETRY_DISABLED=1' >> "$CLAUDE_ENV_FILE"
fi

corepack enable >/dev/null 2>&1 || true
pnpm install --prefer-offline
