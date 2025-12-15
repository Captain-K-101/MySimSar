# Deployment Environment Variables

## Backend (`/backend`)

Copy `backend/env.sample` to `.env` and set:

- `DATABASE_URL` — production database connection string
- `JWT_SECRET` — **required** secure random string (e.g. `openssl rand -hex 64`)
- `PORT` — API port (default `4000`)
- `NODE_ENV` — `production` in prod

Example:
```
DATABASE_URL="postgresql://user:pass@host:5432/mysimsar?schema=public"
JWT_SECRET="paste-64-char-random-string-here"
PORT=4000
NODE_ENV=production
```

## Frontend (`/frontend`)

Create a `.env` file with:
```
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"   # points to backend
NEXT_PUBLIC_SITE_URL="https://app.yourdomain.com"
```

Optional (analytics / uploads placeholders):
```
# NEXT_PUBLIC_POSTHOG_KEY=""
# NEXT_PUBLIC_POSTHOG_HOST="https://us.posthog.com"
# NEXT_PUBLIC_UPLOAD_BUCKET_URL=""
```

## Deployment Steps (summary)
1) `cp backend/env.sample backend/.env` and edit values.
2) Create `frontend/.env` with the vars above.
3) Build backend: `cd backend && npm ci && npm run build`.
4) Build frontend: `cd frontend && npm ci && npm run build`.
5) Run backend: `NODE_ENV=production node dist/server.js` (or your process manager).
6) Run frontend: `NODE_ENV=production npm start` (after build).

## Bare VM Helper Script (HTTP, no domain)
- Script: `deploy/bare-vm-setup.sh`
- Requirements: Ubuntu, root/sudo.
- Example:
  ```
  sudo bash deploy/bare-vm-setup.sh \
    --repo-url https://github.com/yourorg/MySimsar.git \
    --app-dir /var/www/mysimsar \
    --api-url http://<IP>/api \
    --site-url http://<IP>
  ```
- What it does:
  - Installs Node 18, nginx, PM2
  - Creates `frontend/.env` with provided URLs (backend `.env` copied from sample if missing)
  - Builds backend/frontend
  - Starts via PM2 using `deploy/pm2.config.js`
  - Installs nginx reverse proxy for `/api` → 4000 and everything else → 3000

## Notes
- All hardcoded fallbacks (e.g., `http://localhost:4000`) are only used when env vars are missing; set `NEXT_PUBLIC_API_URL` in production.
- Ensure HTTPS URLs for production.

