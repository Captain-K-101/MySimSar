# Notifications

## Channels
- Email (SES/SendGrid)
- WhatsApp/SMS (Twilio/360dialog)
- Future: in-app/push

## Events
- Lead/match created (to simsar + confirmation to user)
- Review received (to simsar)
- Score/tier change (to simsar)
- Verification submitted/approved/rejected/need_more_docs (to broker)
- Transaction claim decision (to user)
- Subscription expiring (to broker)
- Admin warning/ban/mute (to affected account)
- Password/security alerts (2FA change, password reset)

## Delivery Model
- Enqueue notification jobs with template key + locale + channel.
- Retries with backoff; DLQ for failures; provider webhooks for receipts if available.
- Audit admin-triggered sends in audit_logs.

## Templates & Branding
- Use branding palette/typography cues in email; concise, action-forward copy.
- Localize for English/Arabic as needed; keep verified badges and score/tier chips consistent with UI tokens.

