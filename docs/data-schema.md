# Data Schema (PostgreSQL + OpenSearch)

## Core Tables
- users: id, email, phone, password_hash, role, status, created_at, last_login_at, twofa_enabled.
- simsars: user_id FK, name, photo_url, bio, rera_id, license_number, license_doc_url, experience_years, company_name, languages[], whatsapp_number, profile_completeness_score, verification_status, verification_score, tier_hint, created_at, updated_at.
- simsar_specializations: simsar_id FK, area_id FK, property_type, priority, created_at.
- mysimsar_metrics: simsar_id FK, mysimsar_score, tier, total_reviews, avg_rating, complaints_count, last_active_at, avg_response_time_ms, sentiment_avg, risk_flags jsonb, updated_at.
- reviews: id, simsar_id FK, customer_id FK, rating, text, sentiment_score, type, area_id, verified_flag, status, created_at, updated_at, edited_until, reported_count.
- review_replies: id, review_id FK, simsar_id FK, text, created_at.
- complaints: id, simsar_id FK, reporter_id FK, type, description, status, outcome, created_at, resolved_at.
- transaction_claims: id, user_id FK, simsar_id FK, proof_links jsonb, status, admin_notes, created_at, decided_at.
- matches: id, customer_id FK, simsar_id FK, score, status, created_at, closed_at, source.
- subscriptions: id, simsar_id FK, plan_id, start_at, end_at, status, payment_ref, features jsonb.
- areas: id, name, city, emirate, country, geo jsonb, parent_id nullable.
- audit_logs: id, actor_id, action, entity_type, entity_id, payload jsonb, created_at.

## Indexing
- Unique: users(email), users(phone).
- Performance: reviews(simsar_id, created_at desc); mysimsar_metrics(mysimsar_score desc); transaction_claims(simsar_id, status); matches(customer_id, created_at desc); areas(city, name).
- GIN: simsars(languages), simsar_specializations(property_type/area_id combos if array); risk_flags jsonb if queried.
- Partial: simsars where verification_status = 'verified' for directory/search; reviews where status = 'active'.

## OpenSearch Simsar Document
- simsar_id, name, photo, bio snippet, areas[], languages, avg_rating, total_reviews, mysimsar_score, tier, badges {verified, trending}, experience_years, company_name, last_active_at.
- Index settings: analyzers for names/areas; sortable fields for score, rating, reviews_count, experience, last_active_at; filters on verification_status and languages; geo optional if areas add coordinates.

## Data Integrity & Flags
- verification_status enum: pending, under_review, verified, rejected, need_more_docs.
- review.status enum: active, hidden, removed.
- transaction_claims.status enum: pending, approved, rejected, need_more_info.
- audit_logs to capture admin actions (who/when/what) across verification, claims, reviews, bans.

