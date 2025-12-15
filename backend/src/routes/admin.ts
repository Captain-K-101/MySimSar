import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All admin routes require ADMIN role
router.use(requireAuth(["ADMIN"]));

/* ─── VERIFICATION REQUESTS ───────────────────────────────── */

// List pending verifications
router.get("/verifications", async (req, res) => {
  const requests = await prisma.verificationRequest.findMany({
    where: { status: "PENDING" },
    include: {
      simsar: {
        include: { user: { select: { email: true } } },
      },
    },
    orderBy: { submittedAt: "asc" },
  });
  return res.json(requests);
});

const verificationDecisionSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "NEED_MORE_DOCS"]),
  notes: z.string().optional(),
});

// Decide on verification request
router.post("/verifications/:id/decision", async (req, res) => {
  const parse = verificationDecisionSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const request = await prisma.verificationRequest.findUnique({
    where: { id: req.params.id },
    include: { simsar: true },
  });
  if (!request) {
    return res.status(404).json({ error: "Verification request not found" });
  }

  await prisma.verificationRequest.update({
    where: { id: request.id },
    data: { 
      status: parse.data.status, 
      adminNotes: parse.data.notes ?? null, 
      decidedAt: new Date() 
    },
  });

  await prisma.simsar.update({
    where: { id: request.simsarId },
    data: { verificationStatus: parse.data.status },
  });

  return res.json({ success: true, status: parse.data.status });
});

/* ─── TRANSACTION CLAIMS ──────────────────────────────────── */

// List pending claims
router.get("/claims", async (req, res) => {
  const claims = await prisma.transactionClaim.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { email: true } },
      simsar: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return res.json(claims);
});

const claimDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "NEED_MORE_INFO"]),
  notes: z.string().optional(),
});

// Decide on transaction claim
router.post("/claims/:id/decision", async (req, res) => {
  const parse = claimDecisionSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const claim = await prisma.transactionClaim.findUnique({ where: { id: req.params.id } });
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }

  await prisma.transactionClaim.update({
    where: { id: claim.id },
    data: { 
      status: parse.data.status, 
      adminNotes: parse.data.notes ?? null, 
      decidedAt: new Date() 
    },
  });

  return res.json({ success: true, status: parse.data.status });
});

/* ─── USERS MANAGEMENT ────────────────────────────────────── */

// List all users
router.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      simsar: {
        select: {
          id: true,
          name: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(users);
});

// Ban/unban user
router.post("/users/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["active", "banned", "suspended"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { status },
  });

  return res.json({ success: true, user: { id: user.id, status: user.status } });
});

/* ─── SIMSARS MANAGEMENT ──────────────────────────────────── */

// List all simsars
router.get("/simsars", async (req, res) => {
  const simsars = await prisma.simsar.findMany({
    include: {
      user: { select: { email: true, status: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    simsars.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.user.email,
      userStatus: s.user.status,
      verificationStatus: s.verificationStatus,
      tier: s.tierHint,
      reviewCount: s.reviews.length,
      avgRating: s.reviews.length > 0 
        ? Math.round(s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length * 10) / 10 
        : 0,
    }))
  );
});

/* ─── REVIEWS MANAGEMENT ──────────────────────────────────── */

// List reported/all reviews
router.get("/reviews", async (req, res) => {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { email: true } },
      simsar: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(reviews);
});

// Moderate review
router.post("/reviews/:id/moderate", async (req, res) => {
  const { status } = req.body;
  if (!["ACTIVE", "HIDDEN", "REMOVED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { status },
  });

  return res.json({ success: true, review: { id: review.id, status: review.status } });
});

/* ─── DASHBOARD STATS ─────────────────────────────────────── */

router.get("/stats", async (req, res) => {
  const [
    totalUsers,
    totalBrokers,
    verifiedBrokers,
    pendingVerifications,
    pendingClaims,
    totalReviews,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.simsar.count(),
    prisma.simsar.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.verificationRequest.count({ where: { status: "PENDING" } }),
    prisma.transactionClaim.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "ACTIVE" } }),
  ]);

  return res.json({
    totalUsers,
    totalBrokers,
    verifiedBrokers,
    pendingVerifications,
    pendingClaims,
    totalReviews,
  });
});

export default router;
