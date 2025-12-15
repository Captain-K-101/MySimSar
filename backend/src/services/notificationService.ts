// Placeholder notification service for messaging events.
// In production, integrate with SES/SendGrid and WhatsApp/SMS providers.

interface MessageNotificationPayload {
  recipientEmail?: string | null;
  recipientWhatsapp?: string | null;
  senderName?: string;
  snippet: string;
}

export async function notifyNewMessage(payload: MessageNotificationPayload) {
  // TODO: integrate email/WhatsApp providers.
  // For now, this is a no-op to keep the flow non-blocking.
  // You can plug in queue-based delivery here.
  return { queued: true, payload };
}


