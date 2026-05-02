#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const remote = process.env.DEPLOY_SSH_HOST || "sotsiaalai";
const appDir = process.env.DEPLOY_APP_DIR || "/home/ubuntu/apps/sotsiaalai";
const branch = process.env.DEPLOY_BRANCH || "main";
const frontendEnv = process.env.DEPLOY_FRONTEND_ENV || "/etc/sotsiaalai/frontend.env";
const discardTracked = args.has("--discard-tracked");
const skipBuild = args.has("--skip-build");

function fail(message, code = 1) {
  console.error(`[deploy:server] ${message}`);
  process.exit(code);
}

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

const remoteScript = `
set -euo pipefail

APP_DIR=${shellEscape(appDir)}
BRANCH=${shellEscape(branch)}
FRONTEND_ENV=${shellEscape(frontendEnv)}
DISCARD_TRACKED=${discardTracked ? "1" : "0"}
SKIP_BUILD=${skipBuild ? "1" : "0"}

cd "$APP_DIR"

current_branch="$(git branch --show-current)"
if [ "$current_branch" != "$BRANCH" ]; then
  echo "[deploy:server] Wrong branch: $current_branch, expected $BRANCH" >&2
  exit 2
fi

git config pull.ff only
git fetch origin "$BRANCH"

if ! git diff --quiet --ignore-submodules -- || ! git diff --cached --quiet --ignore-submodules --; then
  echo "[deploy:server] Server has tracked local changes:" >&2
  git status --short >&2

  if [ "$DISCARD_TRACKED" != "1" ]; then
    echo "[deploy:server] Pull stopped before changing anything." >&2
    echo "[deploy:server] Re-run with --discard-tracked to save a patch backup and reset tracked files." >&2
    exit 3
  fi

  backup_dir="$APP_DIR/deploy-backups"
  mkdir -p "$backup_dir"
  backup_file="$backup_dir/tracked-changes-$(date -u +%Y%m%dT%H%M%SZ).patch"
  git diff --binary > "$backup_file"
  git diff --cached --binary >> "$backup_file"
  echo "[deploy:server] Saved tracked changes to $backup_file" >&2
  git reset --hard HEAD
fi

local_rev="$(git rev-parse HEAD)"
remote_rev="$(git rev-parse "origin/$BRANCH")"
base_rev="$(git merge-base HEAD "origin/$BRANCH")"

if [ "$local_rev" = "$remote_rev" ]; then
  echo "[deploy:server] Already up to date at $(git rev-parse --short HEAD)"
elif [ "$local_rev" = "$base_rev" ]; then
  git merge --ff-only "origin/$BRANCH"
else
  echo "[deploy:server] Server branch has diverged from origin/$BRANCH." >&2
  echo "[deploy:server] local=$local_rev remote=$remote_rev base=$base_rev" >&2
  exit 4
fi

frontend_was_active="0"
if systemctl is-active --quiet sotsiaalai-frontend.service; then
  frontend_was_active="1"
fi

if [ "$SKIP_BUILD" != "1" ]; then
  if [ "$frontend_was_active" = "1" ]; then
    echo "[deploy:server] Stopping frontend before in-place build"
    sudo systemctl stop sotsiaalai-frontend.service
  fi

  if [ -f "$FRONTEND_ENV" ]; then
    set -a
    . "$FRONTEND_ENV"
    set +a
  fi

  if npm run build; then
    :
  else
    build_status="$?"
    if [ "$frontend_was_active" = "1" ]; then
      echo "[deploy:server] Build failed; restarting previous frontend state" >&2
      sudo systemctl start sotsiaalai-frontend.service || true
    fi
    exit "$build_status"
  fi
fi

if systemctl list-unit-files sotsiaalai-rag.service >/dev/null 2>&1; then
  sudo systemctl restart sotsiaalai-rag.service
fi
if systemctl list-unit-files sotsiaalai-research-worker.service >/dev/null 2>&1; then
  sudo systemctl restart sotsiaalai-research-worker.service
fi
sudo systemctl restart sotsiaalai-frontend.service

if systemctl list-unit-files sotsiaalai-rag.service >/dev/null 2>&1; then
  systemctl is-active sotsiaalai-rag.service
fi
if systemctl list-unit-files sotsiaalai-research-worker.service >/dev/null 2>&1; then
  systemctl is-active sotsiaalai-research-worker.service
fi
systemctl is-active sotsiaalai-frontend.service

echo "[deploy:server] Deployed $(git rev-parse --short HEAD)"
git status --short
`;

const result = spawnSync("ssh", [remote, "bash -s"], {
  input: remoteScript,
  stdio: ["pipe", "inherit", "inherit"],
  encoding: "utf8"
});

if (result.error) {
  fail(result.error.message);
}

process.exit(result.status ?? 0);
