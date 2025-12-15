import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

/* ─── PUBLIC ──────────────────────────────────────────────── */

// List verified simsars (public)
router.get("/", async (req, res) => {
  const { q, location, language, specialty, sort = "score" } = req.query;
  
  const simsars = await prisma.simsar.findMany({
    where: {
      verificationStatus: "VERIFIED",
      ...(q ? { 
        OR: [
          { name: { contains: String(q) } },
          { companyName: { contains: String(q) } },
        ]
      } : {}),
    },
    include: {
      reviews: {
        where: { status: "ACTIVE" },
        select: { rating: true },
      },
      agency: {
        select: { id: true, name: true, logoUrl: true, verificationStatus: true },
      },
    },
  });

  // Transform and filter results
  const results = simsars.map((simsar) => {
    const languages = JSON.parse(simsar.languages || "[]") as string[];
    const avgRating = simsar.reviews.length > 0 
      ? simsar.reviews.reduce((sum, r) => sum + r.rating, 0) / simsar.reviews.length 
      : 0;
    
    return {
      id: simsar.id,
      name: simsar.name,
      photoUrl: simsar.photoUrl,
      companyName: simsar.companyName,
      bio: simsar.bio,
      reraId: simsar.reraId,
      experienceYears: simsar.experienceYears,
      languages,
      whatsappNumber: simsar.whatsappNumber,
      verificationStatus: simsar.verificationStatus,
      tierHint: simsar.tierHint,
      simsarType: simsar.simsarType,
      agencyId: simsar.agencyId,
      agency: simsar.agency,
      score: simsar.profileCompletenessScore,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: simsar.reviews.length,
      reviews: simsar.reviews,
    };
  });

  // Filter by language if specified
  const filtered = language 
    ? results.filter(s => s.languages.includes(String(language)))
    : results;

  // Sort results
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "reviews") return b.reviewCount - a.reviewCount;
    return b.score - a.score; // default: score
  });

  return res.json(sorted);
});

// Get single simsar profile (public)
router.get("/:id", async (req, res) => {
  const simsar = await prisma.simsar.findUnique({
    where: { id: req.params.id },
    include: {
      reviews: {
        where: { status: "ACTIVE" },
        include: {
          user: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      agency: {
        select: { 
          id: true, 
          name: true, 
          logoUrl: true, 
          bannerUrl: true,
          verificationStatus: true,
          bio: true,
        },
      },
    },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }

  const languages = JSON.parse(simsar.languages || "[]") as string[];
  const avgRating = simsar.reviews.length > 0 
    ? simsar.reviews.reduce((sum, r) => sum + r.rating, 0) / simsar.reviews.length 
    : 0;

  return res.json({
    id: simsar.id,
    name: simsar.name,
    photoUrl: simsar.photoUrl,
    companyName: simsar.companyName,
    bio: simsar.bio,
    reraId: simsar.reraId,
    experienceYears: simsar.experienceYears,
    languages,
    whatsappNumber: simsar.whatsappNumber,
    verificationStatus: simsar.verificationStatus,
    tierHint: simsar.tierHint,
    simsarType: simsar.simsarType,
    agencyId: simsar.agencyId,
    agency: simsar.agency,
    score: simsar.profileCompletenessScore,
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: simsar.reviews.length,
    reviews: simsar.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      verified: r.verifiedFlag,
      createdAt: r.createdAt,
      author: r.user.email.split("@")[0],
    })),
  });
});

/* ─── PROTECTED (BROKER) ──────────────────────────────────── */

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  companyName: z.string().optional(),
  bio: z.string().optional(),
  reraId: z.string().optional(),
  licenseNumber: z.string().optional(),
  experienceYears: z.number().optional(),
  languages: z.array(z.string()).optional(),
  whatsappNumber: z.string().optional(),
});

// Update own profile (broker only)
router.put("/:id", requireAuth(["BROKER"]), async (req, res) => {
  const parse = updateProfileSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const simsar = await prisma.simsar.findUnique({ where: { id: req.params.id } });
  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }
  if (simsar.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { languages, photoUrl, ...rest } = parse.data;
  const updated = await prisma.simsar.update({
    where: { id: simsar.id },
    data: {
      ...rest,
      ...(photoUrl !== undefined ? { photoUrl: photoUrl || null } : {}),
      ...(languages ? { languages: JSON.stringify(languages) } : {}),
    },
  });

  return res.json(updated);
});

// Get my simsar profile (broker)
router.get("/me/profile", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
    include: {
      reviews: {
        where: { status: "ACTIVE" },
        select: { rating: true },
      },
      agency: {
        select: { id: true, name: true, logoUrl: true },
      },
    },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Profile not found" });
  }

  const avgRating = simsar.reviews.length > 0 
    ? simsar.reviews.reduce((sum, r) => sum + r.rating, 0) / simsar.reviews.length 
    : 0;

  return res.json({
    ...simsar,
    languages: JSON.parse(simsar.languages || "[]"),
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: simsar.reviews.length,
  });
});

/* ─── OFFERS & REQUESTS (for individual brokers) ───────────── */

// Get pending recruitment offers for current broker
router.get("/me/offers", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Profile not found" });
  }

  // Individual brokers only
  if (simsar.agencyId) {
    return res.json([]);
  }

  const offers = await prisma.recruitmentOffer.findMany({
    where: { simsarId: simsar.id },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          bannerUrl: true,
          bio: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Auto-expire old offers
  const now = new Date();
  const expiredOffers = offers.filter(
    (o) => o.status === "PENDING" && new Date(o.expiresAt) < now
  );

  if (expiredOffers.length > 0) {
    await prisma.recruitmentOffer.updateMany({
      where: { id: { in: expiredOffers.map((o) => o.id) } },
      data: { status: "EXPIRED" },
    });
  }

  return res.json(
    offers.map((o) => ({
      ...o,
      status: new Date(o.expiresAt) < now && o.status === "PENDING" ? "EXPIRED" : o.status,
    }))
  );
});

// Get pending join requests sent by current broker
router.get("/me/requests", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Profile not found" });
  }

  // Individual brokers only
  if (simsar.agencyId) {
    return res.json([]);
  }

  const requests = await prisma.agencyJoinRequest.findMany({
    where: { simsarId: simsar.id },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          bannerUrl: true,
          bio: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(requests);
});

// Withdraw a pending join request
router.delete("/me/requests/:requestId", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Profile not found" });
  }

  const request = await prisma.agencyJoinRequest.findUnique({
    where: { id: req.params.requestId },
  });

  if (!request || request.simsarId !== simsar.id) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.status !== "PENDING") {
    return res.status(400).json({ error: "Request is no longer pending" });
  }

  await prisma.agencyJoinRequest.delete({
    where: { id: request.id },
  });

  return res.json({ success: true, message: "Request withdrawn" });
});

/* ─── VERIFICATION ────────────────────────────────────────── */

const verificationSchema = z.object({
  documents: z.record(z.string(), z.string()),
});

// Submit verification request (broker only)
router.post("/:id/verification", requireAuth(["BROKER"]), async (req, res) => {
  const parse = verificationSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const simsar = await prisma.simsar.findUnique({ where: { id: req.params.id } });
  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }
  if (simsar.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const verificationRequest = await prisma.verificationRequest.create({
    data: {
      simsarId: simsar.id,
      documents: JSON.stringify(parse.data.documents),
      status: "PENDING",
    },
  });

  await prisma.simsar.update({
    where: { id: simsar.id },
    data: { verificationStatus: "UNDER_REVIEW" },
  });

  return res.status(201).json(verificationRequest);
});

/* ─── TRANSACTION CLAIMS ──────────────────────────────────── */

const claimSchema = z.object({
  proofLinks: z.record(z.string(), z.string()).optional().default({}),
});

// Submit transaction claim (user only)
router.post("/:id/claims", requireAuth(["USER"]), async (req, res) => {
  const parse = claimSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const simsar = await prisma.simsar.findUnique({ where: { id: req.params.id } });
  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }
  if (simsar.verificationStatus !== "VERIFIED") {
    return res.status(400).json({ error: "Cannot claim transaction with unverified simsar" });
  }

  const claim = await prisma.transactionClaim.create({
    data: {
      userId: req.user!.userId,
      simsarId: simsar.id,
      proofLinks: JSON.stringify(parse.data.proofLinks),
      status: "PENDING",
    },
  });

  return res.status(201).json(claim);
});

/* ─── REVIEWS ─────────────────────────────────────────────── */

const reviewSchema = z.object({
  claimId: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string().min(10),
});

// Submit review (user only, requires approved claim)
router.post("/:id/reviews", requireAuth(["USER"]), async (req, res) => {
  const parse = reviewSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const simsar = await prisma.simsar.findUnique({ where: { id: req.params.id } });
  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }

  const claim = await prisma.transactionClaim.findUnique({
    where: { id: parse.data.claimId },
  });
  
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }
  if (claim.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Claim does not belong to you" });
  }
  if (claim.status !== "APPROVED") {
    return res.status(400).json({ error: "Claim not yet approved" });
  }

  // Check if review already exists for this claim
  const existingReview = await prisma.review.findUnique({
    where: { transactionId: claim.id },
  });
  if (existingReview) {
    return res.status(400).json({ error: "Review already submitted for this claim" });
  }

  const review = await prisma.review.create({
    data: {
      simsarId: simsar.id,
      userId: req.user!.userId,
      transactionId: claim.id,
      rating: parse.data.rating,
      text: parse.data.text,
      verifiedFlag: true,
      status: "ACTIVE",
    },
  });

  return res.status(201).json(review);
});

// Get reviews for a simsar (public)
router.get("/:id/reviews", async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: {
      simsarId: req.params.id,
      status: "ACTIVE",
    },
    include: {
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      verified: r.verifiedFlag,
      createdAt: r.createdAt,
      author: r.user.email.split("@")[0],
    }))
  );
});

/* ─── PORTFOLIO ──────────────────────────────────────────────── */

// Get portfolio items for a simsar (public)
router.get("/:id/portfolio", async (req, res) => {
  const items = await prisma.portfolioItem.findMany({
    where: { simsarId: req.params.id },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      location: item.location,
      price: item.price,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      area: item.area,
      images: JSON.parse(item.images || "[]"),
      status: item.status,
      description: item.description,
      date: item.createdAt.toISOString(),
    }))
  );
});

const portfolioSchema = z.object({
  type: z.enum(["sale", "rental", "off-plan"]),
  title: z.string().min(1),
  location: z.string().min(1),
  price: z.string().min(1),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  status: z.enum(["sold", "rented", "available"]),
  description: z.string().optional(),
});

// Add portfolio item (broker only)
router.post("/:id/portfolio", requireAuth(["BROKER"]), async (req, res) => {
  const parse = portfolioSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const simsar = await prisma.simsar.findUnique({ where: { id: req.params.id } });
  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }
  if (simsar.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const item = await prisma.portfolioItem.create({
    data: {
      simsarId: simsar.id,
      type: parse.data.type,
      title: parse.data.title,
      location: parse.data.location,
      price: parse.data.price,
      bedrooms: parse.data.bedrooms,
      bathrooms: parse.data.bathrooms,
      area: parse.data.area,
      images: JSON.stringify(parse.data.images),
      status: parse.data.status,
      description: parse.data.description || null,
    },
  });

  return res.status(201).json({
    id: item.id,
    type: item.type,
    title: item.title,
    location: item.location,
    price: item.price,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area: item.area,
    images: JSON.parse(item.images),
    status: item.status,
    description: item.description,
    date: item.createdAt.toISOString(),
  });
});

// Update portfolio item (broker only)
router.put("/:id/portfolio/:itemId", requireAuth(["BROKER"]), async (req, res) => {
  const parse = portfolioSchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const simsar = await prisma.simsar.findUnique({ where: { id: req.params.id } });
  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }
  if (simsar.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const existingItem = await prisma.portfolioItem.findUnique({
    where: { id: req.params.itemId },
  });
  if (!existingItem || existingItem.simsarId !== simsar.id) {
    return res.status(404).json({ error: "Portfolio item not found" });
  }

  const { images, ...rest } = parse.data;
  const item = await prisma.portfolioItem.update({
    where: { id: req.params.itemId },
    data: {
      ...rest,
      ...(images ? { images: JSON.stringify(images) } : {}),
    },
  });

  return res.json({
    id: item.id,
    type: item.type,
    title: item.title,
    location: item.location,
    price: item.price,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area: item.area,
    images: JSON.parse(item.images),
    status: item.status,
    description: item.description,
    date: item.createdAt.toISOString(),
  });
});

// Delete portfolio item (broker only)
router.delete("/:id/portfolio/:itemId", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({ where: { id: req.params.id } });
  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }
  if (simsar.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const existingItem = await prisma.portfolioItem.findUnique({
    where: { id: req.params.itemId },
  });
  if (!existingItem || existingItem.simsarId !== simsar.id) {
    return res.status(404).json({ error: "Portfolio item not found" });
  }

  await prisma.portfolioItem.delete({
    where: { id: req.params.itemId },
  });

  return res.json({ success: true, message: "Portfolio item deleted" });
});

export default router;
