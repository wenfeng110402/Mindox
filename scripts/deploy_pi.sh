#!/usr/bin/env bash
set -euo pipefail

# Simple deploy script for Raspberry Pi (run as deploy user, not root)
# Usage: ./deploy_pi.sh [branch]

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${1:-main}"

echo "Deploying branch ${BRANCH} to ${REPO_DIR}"

cd "$REPO_DIR"

echo "Fetching and resetting to origin/${BRANCH}..."
git fetch origin --prune
git checkout "$BRANCH"
git reset --hard "origin/${BRANCH}"

echo "Building frontend..."
cd frontend
npm ci
npm run build

echo "Installing backend deps..."
cd ../backend
npm ci

echo "Ensure environment variables are set (create .env based on .env.example if needed)"
if [ ! -f .env ]; then
  echo "Warning: .env not found in backend/. Please create it with required keys (HACKCLUB_API_KEY etc)."
fi

echo "Restarting application via pm2 (process name: mindox)"
if pm2 describe mindox > /dev/null 2>&1; then
  pm2 restart mindox --update-env
else
  pm2 start src/index.js --name mindox --update-env --cwd $(pwd) --env production
fi

echo "Deploy finished. Check logs with: pm2 logs mindox"
