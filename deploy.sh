#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

log() { printf "\n\033[1;34m[deploy]\033[0m %s\n" "$*"; }
fail() { printf "\n\033[1;31m[deploy] ERROR:\033[0m %s\n" "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || fail "node is required"
command -v npm >/dev/null 2>&1 || fail "npm is required"

log "Using node: $(node -v)"

# Backend setup
log "Ensuring backend env file"
if [ ! -f "${ROOT}/backend/.env" ]; then
  if [ -f "${ROOT}/backend/env.sample" ]; then
    cp "${ROOT}/backend/env.sample" "${ROOT}/backend/.env"
    log "Created backend/.env from env.sample (review secrets/DB URL)"
  else
    fail "backend/env.sample not found; cannot create backend/.env"
  fi
fi

log "Installing backend dependencies"
cd "${ROOT}/backend"
npm install

log "Generating Prisma client"
npx prisma generate

log "Building backend"
npm run build

# Frontend setup
log "Installing frontend dependencies"
cd "${ROOT}/frontend"
npm install

log "Building frontend"
npm run build

log "Deployment build complete."
printf "\nNext steps:\n"
printf "  1) Start MongoDB locally (default: mongodb://127.0.0.1:27017/mysimsar).\n"
printf "  2) From backend/: JWT_SECRET=change-me npm run dev   # or npm start after build\n"
printf "  3) From frontend/: npm run dev                        # or npm start after build\n"

