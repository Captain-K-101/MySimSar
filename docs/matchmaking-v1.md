# Matchmaking v1 (Find My Simsar)

## Inputs
- Intent: buy/rent/invest; timeline; budget range (optional).
- Areas of interest; property type (apartment/villa/townhouse/commercial, off-plan/secondary).
- Language preferences.
- Optional: prefer verified-only.

## Filters
- Simsars with matching specialization (area + property type).
- Language match.
- Verified if requested or required by policy.
- Active subscription guardrails (boost but do not fully gate).
- Exclude muted/banned simsars.

## Ranking
- Primary: MySimsar Score (desc).
- Secondary: activity recency.
- Tertiary: reviews volume and rating.
- Subscription boost: small, capped to avoid crowd-out.
- Jitter: slight randomization to reduce bias.

## Output
- Return 3–7 simsars with score, tier, badges, contact CTA.
- Persist match record (customer_id, simsar_id, shortlist score, created_at, source=form).
- Notify simsars and customer via notifications service.

## Fairness & Limits
- Cap repeated exposure of the same simsar to same user within short window.
- Respect bans/mutes; respect geography/type constraints strictly.

