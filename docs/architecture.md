# MySimsar Architecture (SPA, Trust-First)

## Client & Routing
- Single-page shell (Next.js/React) with hash routes (`/#/route`) to avoid reloads.
- Views: Landing, Directory, Broker Profile, About/FAQ/T&C modals; Auth (login/register/forgot); Broker portal (dashboard, profile edit, docs upload, verification tracker, reviews received, lead requests stub); User portal (dashboard, transaction claim/review submission); Admin (login, dashboard, verification queue, doc review, approve/reject, broker list, reported reviews, transaction verification).
- State/data: React Query + normalized cache; guarded routes by role; optimistic UI for edits; modal routing for legal/FAQ.

## API/BFF
- REST gateway with JWT (access + refresh), rate limiting, RBAC middleware, request IDs, structured logging.
- Gate review creation behind approved transaction claims; gate broker public visibility behind verification status.
- Background jobs via queue (e.g., BullMQ) for score recalcs, notifications, indexing, fraud checks.

## Services (modular within monorepo)
- Auth & Identity: signup/login, refresh, password reset, 2FA (brokers/admins), roles (user/broker/developer/admin/moderator), session revocation.
- Profile: users, simsars, developers (phase 2), profile completeness scoring, media management via pre-signed URLs.
- Simsar Verification: ingest docs (RERA, Emirates ID, passport optional, title deed optional, NOC optional), status transitions pending → under_review → verified/rejected/need_more_docs, admin notes.
- Reviews & Ratings: CRUD with edit window, reports, simsar replies, status (active/hidden/removed), verified_flag tied to claims.
- MySimsar Score: heuristic weighting, tiering, risk flags, cron + event triggers.
- Search & Discovery: OpenSearch index of simsars with filters/sorts/feeds; fallback DB query path.
- Matchmaking v1: rule-based shortlist 3–7 simsars by specialization, language, property type, score, activity, subscription guardrails.
- Notifications: email + WhatsApp/SMS (templates, retries, DLQ), audit of admin-triggered sends.
- Admin & Moderation: verification queue, review moderation, transaction claim console, bans/mutes, score override with audit.

## Data & Storage
- PostgreSQL primary; Redis for cache/rate-limit/queues/sessions; S3-compatible storage for docs/assets; OpenSearch for simsars; future warehouse hook.
- Backups encrypted; signed URLs for uploads; private buckets for documents.

## Observability & Security
- Sentry for errors, metrics (p95 latency, error rate, queue depth, job success), health checks.
- Request IDs propagated; structured logs.
- Security: JWT rotation, strong passwords, 2FA (brokers/admins), input validation, CORS-locked, IP/user rate limits, RBAC, audit logs for admin actions.

## Text System Diagram
- Client SPA → API Gateway/BFF → modular services (Auth, Profile, Verification, Reviews, Score, Search, Matchmaking, Notifications, Admin) → Postgres/Redis/S3/OpenSearch; background worker consumes queues for scoring, indexing, notifications, fraud checks.

