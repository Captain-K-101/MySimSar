# API Surface (REST, Role-Guarded)

## Auth
- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- POST /auth/password/reset
- POST /auth/2fa/setup
- POST /auth/2fa/verify

## Profiles
- GET /me
- PUT /me
- GET /simsars/:id (public or self/admin)
- PUT /simsars/:id (self/admin)
- GET /simsars/:id/reviews
- PUT /simsars/:id/photo (pre-signed URL flow)

## Verification
- POST /simsars/:id/verification (submit docs)
- GET /admin/verifications (pending list)
- POST /admin/verifications/:id/decision (approve/reject/need_more_docs + notes)

## Transaction Claims (Anti-Spoofing)
- POST /simsars/:id/claims (user submits claim/proofs)
- GET /admin/claims (filter status=pending)
- POST /admin/claims/:id/decision (approve/reject/need_more_info + notes)

## Reviews & Moderation
- POST /simsars/:id/reviews (allowed only if claim approved)
- PATCH /reviews/:id (within edit window)
- POST /reviews/:id/report
- POST /reviews/:id/reply (broker)
- GET /reviews/:id (detail)
- Admin moderation: POST /admin/reviews/:id/moderate (actions: hide/remove/restore/mark_spam)

## Search & Discovery
- GET /search/simsars?area=&language=&verified=&score_min=&rating_min=&sort=
- Feeds: GET /search/top, /search/rising, /search/new

## Matchmaking v1
- POST /matchmaking (input form → shortlist)
- GET /matches/:id
- PATCH /matches/:id/status

## Notifications
- POST /internal/notifications/send (queued by key + channel)
- Webhook endpoints for delivery receipts if provider supports

## Admin & Governance
- GET /admin/brokers (filters)
- PATCH /admin/brokers/:id/status (ban/mute/reactivate)
- POST /admin/score-overrides (rare; audited)
- POST /admin/admins (add admin)
- GET /admin/audit-logs (filters: actor, action, entity, date)

## Common Behaviors
- Auth via Bearer access token; refresh token rotation; 2FA required for brokers/admins if enabled.
- Role enforcement per route (user, broker, admin).
- Rate limits per IP/user; stricter on auth, claims, reviews.
- Pagination: cursor-based for lists (directory, reviews, claims).

