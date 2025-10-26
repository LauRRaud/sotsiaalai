#!/usr/bin/env bash
set -euo pipefail

# Simple deploy script for SotsiaalAI
# - Pulls latest code from origin/<BRANCH>
# - Reinstalls Node deps if package files changed
# - Runs Prisma migrate + generate
# - Builds Next.js app
# - Reinstalls rag-service Python deps if requirements changed
# - Restarts systemd services (rag first, then frontend)

BRANCH=${BRANCH:-main}
FRONTEND_SERVICE=${FRONTEND_SERVICE:-sotsiaalai-frontend.service}
RAG_SERVICE=${RAG_SERVICE:-rag.service}

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "[deploy] Repo: $ROOT_DIR (branch=$BRANCH)"

PREV_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "")
echo "[deploy] Previous HEAD: ${PREV_HEAD}"

echo "[deploy] Fetching origin/$BRANCH"
git fetch --quiet origin "$BRANCH"
git checkout -q "$BRANCH"
git reset --hard "origin/$BRANCH"

NEW_HEAD=$(git rev-parse HEAD)
echo "[deploy] New HEAD: ${NEW_HEAD}"

CHANGED_FILES=$(git diff --name-only "${PREV_HEAD:-$NEW_HEAD}" "$NEW_HEAD" || true)
echo "[deploy] Changed files since previous HEAD:" && echo "$CHANGED_FILES" | sed 's/^/  - /'

if echo "$CHANGED_FILES" | grep -qE '^(package\.json|package-lock\.json)$'; then
  echo "[deploy] package files changed → npm ci"
  npm ci
else
  echo "[deploy] package files unchanged"
fi

echo "[deploy] Prisma migrations (deploy)"
npx prisma migrate deploy
echo "[deploy] Prisma generate"
npx prisma generate

echo "[deploy] Building Next.js"
npm run build

if echo "$CHANGED_FILES" | grep -q '^rag-service/requirements.txt$'; then
  echo "[deploy] rag-service requirements changed → install"
  if [ -d rag-service/.venv ]; then
    # Use project venv if present
    source rag-service/.venv/bin/activate
    pip install -r rag-service/requirements.txt
    deactivate || true
  else
    # Fallback to system python environment
    pip install -r rag-service/requirements.txt
  fi
else
  echo "[deploy] rag-service requirements unchanged"
fi

echo "[deploy] Restarting services (rag → frontend)"
sudo systemctl restart "$RAG_SERVICE"
sudo systemctl status "$RAG_SERVICE" --no-pager || true
sudo systemctl restart "$FRONTEND_SERVICE"
sudo systemctl status "$FRONTEND_SERVICE" --no-pager || true

echo "[deploy] Done."

