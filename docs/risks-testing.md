# Risks, Mitigations, Testing & Observability

## Key Risks & Mitigations
- Fake reviews/spam: transaction-claim gating, rate limits, captcha on review, abuse/profanity filter, device/IP signals, admin moderation queue.
- Document fraud: manual review, expiry/consistency checks, file type/size limits, watermarking in viewer, audit logs.
- Search quality: telemetry for query → click, manual boosts, fallback DB path if OpenSearch lags.
- Privacy/security: least-privilege RBAC, signed URLs, private buckets, encrypted secrets/backups, admin audit logging.
- Availability: health checks, circuit breakers to external providers, DLQ for notifications/scoring/indexing.
- Scope creep: keep score heuristic simple; defer payments/dev features; keep phase 2 leads behind feature flag.

## Testing Strategy
- Unit: scoring, matchmaking ranking, search query builders, claim eligibility checks, role guards.
- Integration: auth flows, verification submission/decision, claim → review gating, moderation actions, notifications enqueue.
- E2E (happy paths): user journey (browse → claim → review), broker journey (register → verify), admin journey (verify broker, approve claim, moderate review).
- Regression: rate-limit and abuse surfaces (reviews, claims, auth).
- Accessibility: key routes (landing, directory, profile, auth, dashboards) meet WCAG AA; keyboard and screen reader checks.

## Observability
- Metrics: p95 latency, error rate, queue depth, job success, OpenSearch index freshness, scoring runtime, notification success/failure.
- Logging: structured with request IDs; sensitive data excluded; audit logs for admin actions.
- Alerts: auth failure spikes, queue backlog, scoring job failures, OpenSearch lag, elevated review/report volume.

## Environments
- Staging with seed data (brokers, claims, reviews) mirroring UAE locales/areas; sandbox keys for email/SMS.
- Feature flags: lead requests (phase 2), score override UI, experimental boosts.

