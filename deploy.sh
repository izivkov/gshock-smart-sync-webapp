#!/bin/bash
# G-Shock Smart Sync Webapp - deploy the Vite build to the server.
# Does not touch nginx.
set -euo pipefail

SERVER_USER="${SERVER_USER:-ivo}"
SERVER_HOST="${SERVER_HOST:-192.168.1.100}"
SERVER_PATH="${SERVER_PATH:-/home/${SERVER_USER}/gshock-smart-sync}"
APP_PORT="${APP_PORT:-3002}"
REMOTE="${SERVER_USER}@${SERVER_HOST}"

echo "Building..."
npm ci
npm run build
[ -f dist/index.html ] || { echo "Build produced no dist/index.html" >&2; exit 1; }

echo "Uploading to ${REMOTE}:${SERVER_PATH}..."
ssh "$REMOTE" "mkdir -p '${SERVER_PATH}'"
rsync -az dist/ "${REMOTE}:${SERVER_PATH}/"

echo "Checking the site..."
ssh "$REMOTE" "curl -fsS -o /dev/null http://localhost:${APP_PORT}/ && curl -fsS -o /dev/null http://localhost:${APP_PORT}/index.html"

echo "Deployed."
