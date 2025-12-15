# MySimsar Score v1 (Heuristic)

## Inputs & Weights
- Verification status: +25 if verified.
- Profile completeness: 0–15 (fields filled, photo, docs, specializations).
- Volume & rating: avg_rating *10 (cap 50) + log(total_reviews + 1) *5.
- Recency: last 90d review count scaled 0–10.
- Sentiment quality: sentiment_avg scaled 0–10.
- Activity: last_active recency + response-time proxy 0–10.
- Penalties: complaints_count (-5 each, cap -20); risk_flags (-10 per major flag).

## Tiers
- Platinum: 85+
- Gold: 70–84
- Silver: 55–69
- Bronze: else

## Execution & Triggers
- Cron: every 2–3 hours recalculates all verified simsars.
- Event hooks: on new/updated review, complaint status change, verification status change, profile completeness change, activity ping.
- Writes to mysimsar_metrics and pushes updates to OpenSearch.

## Risk Flags (examples)
- Repeated complaints, spam/review fraud signals, abrupt sentiment swings, excessive self-traffic anomalies.

## Governance
- Admin override allowed only in extreme cases; every override logged in audit_logs with actor, reason, diff before/after.

