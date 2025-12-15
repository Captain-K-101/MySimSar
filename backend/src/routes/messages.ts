import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

const createConversationSchema = z.object({
  simsarId: z.string().min(1),
  text: z.string().min(1).max(2000),
});

const sendMessageSchema = z.object({
  text: z.string().min(1).max(2000),
});

// List conversations for current user/broker
router.get("/conversations", requireAuth(["USER", "BROKER"]), async (req, res) => {
  const isUser = req.user!.role === "USER";

  const conversations = await prisma.conversation.findMany({
    where: isUser
      ? { userId: req.user!.userId }
      : {
          simsar: {
            userId: req.user!.userId,
          },
        },
    orderBy: { lastMessageAt: "desc" },
    include: {
      user: { select: { id: true, email: true, simsar: { select: { name: true, photoUrl: true } } } },
      simsar: { select: { id: true, name: true, photoUrl: true, verificationStatus: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, text: true, senderId: true, senderRole: true, createdAt: true, readAt: true },
      },
    },
  });

  const formatted = conversations.map((c) => {
    const last = c.messages[0];
    return {
      id: c.id,
      lastMessage: last ? { text: last.text, createdAt: last.createdAt, senderId: last.senderId, senderRole: last.senderRole } : null,
      lastMessageAt: c.lastMessageAt,
      user: { id: c.user.id, email: c.user.email, name: c.user.simsar?.name, photoUrl: c.user.simsar?.photoUrl },
      simsar: { id: c.simsar.id, name: c.simsar.name, photoUrl: c.simsar.photoUrl, verificationStatus: c.simsar.verificationStatus },
    };
  });

  return res.json(formatted);
});

// Get a conversation with messages
router.get("/conversations/:id", requireAuth(["USER", "BROKER"]), async (req, res) => {
  const convo = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, email: true, simsar: { select: { name: true, photoUrl: true } } } },
      simsar: { select: { id: true, name: true, photoUrl: true, verificationStatus: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, text: true, senderId: true, senderRole: true, createdAt: true, readAt: true },
      },
    },
  });

  if (!convo) return res.status(404).json({ error: "Conversation not found" });

  const isUser = req.user!.role === "USER" && convo.userId === req.user!.userId;
  const isBroker = req.user!.role === "BROKER" && convo.simsar && convo.simsar.id === convo.simsar.id;
  if (!isUser && !isBroker) return res.status(403).json({ error: "Forbidden" });

  return res.json(convo);
});

// Create conversation + first message (user only)
router.post("/conversations", requireAuth(["USER"]), async (req, res) => {
  const parse = createConversationSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });

  const simsar = await prisma.simsar.findUnique({ where: { id: parse.data.simsarId } });
  if (!simsar || simsar.verificationStatus !== "VERIFIED") {
    return res.status(400).json({ error: "Broker not available for messaging" });
  }

  const existing = await prisma.conversation.findFirst({
    where: { userId: req.user!.userId, simsarId: simsar.id },
  });

  if (existing) {
    // Attach message to existing conversation
    const message = await prisma.message.create({
      data: {
        conversationId: existing.id,
        senderId: req.user!.userId,
        senderRole: "USER",
        text: parse.data.text,
      },
    });
    await prisma.conversation.update({
      where: { id: existing.id },
      data: { lastMessageAt: new Date() },
    });
    return res.status(201).json({ conversationId: existing.id, message });
  }

  const result = await prisma.conversation.create({
    data: {
      userId: req.user!.userId,
      simsarId: simsar.id,
      messages: {
        create: {
          senderId: req.user!.userId,
          senderRole: "USER",
          text: parse.data.text,
        },
      },
    },
    include: { messages: true },
  });

  return res.status(201).json(result);
});

// Send message in conversation
router.post("/conversations/:id/messages", requireAuth(["USER", "BROKER"]), async (req, res) => {
  const parse = sendMessageSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });

  const convo = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { simsar: { select: { userId: true } } },
  });
  if (!convo) return res.status(404).json({ error: "Conversation not found" });

  const isUser = req.user!.role === "USER" && convo.userId === req.user!.userId;
  const isBroker = req.user!.role === "BROKER" && convo.simsar.userId === req.user!.userId;
  if (!isUser && !isBroker) return res.status(403).json({ error: "Forbidden" });

  const message = await prisma.message.create({
    data: {
      conversationId: convo.id,
      senderId: req.user!.userId,
      senderRole: req.user!.role,
      text: parse.data.text,
    },
  });

  await prisma.conversation.update({
    where: { id: convo.id },
    data: { lastMessageAt: new Date() },
  });

  return res.status(201).json(message);
});

// Mark conversation as read
router.post("/conversations/:id/read", requireAuth(["USER", "BROKER"]), async (req, res) => {
  const convo = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { simsar: { select: { userId: true } } },
  });
  if (!convo) return res.status(404).json({ error: "Conversation not found" });

  const isUser = req.user!.role === "USER" && convo.userId === req.user!.userId;
  const isBroker = req.user!.role === "BROKER" && convo.simsar.userId === req.user!.userId;
  if (!isUser && !isBroker) return res.status(403).json({ error: "Forbidden" });

  await prisma.message.updateMany({
    where: { conversationId: convo.id, readAt: null, senderId: { not: req.user!.userId } },
    data: { readAt: new Date() },
  });

  return res.json({ success: true });
});

// Unread count
router.get("/unread-count", requireAuth(["USER", "BROKER"]), async (req, res) => {
  const isUser = req.user!.role === "USER";

  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: req.user!.userId },
      conversation: isUser
        ? { userId: req.user!.userId }
        : { simsar: { userId: req.user!.userId } },
    },
  });

  return res.json({ count });
});

export default router;


