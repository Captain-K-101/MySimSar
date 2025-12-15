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
  reraCertificateUrl: z.string().url().optional().or(z.literal("")),
  licenseNumber: z.string().optional(),
  licenseDocUrl: z.string().url().optional().or(z.literal("")),
  emiratesId: z.string().optional(),
  emiratesIdUrl: z.string().url().optional().or(z.literal("")),
  experienceYears: z.number().optional(),
  specialties: z.array(z.string()).optional(),
  areasOfOperation: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  whatsappNumber: z.string().optional(),
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(simsar: any): { score: number; complete: boolean; missing: string[] } {
  const requiredFields = [
    { field: 'name', label: 'Full Name' },
    { field: 'photoUrl', label: 'Profile Photo' },
    { field: 'reraId', label: 'RERA ID' },
    { field: 'reraCertificateUrl', label: 'RERA Certificate' },
    { field: 'licenseNumber', label: 'License Number' },
    { field: 'licenseDocUrl', label: 'License Document' },
    { field: 'experienceYears', label: 'Experience Years' },
    { field: 'whatsappNumber', label: 'WhatsApp Number' },
  ];
  
  const optionalFields = [
    { field: 'bio', label: 'Bio' },
    { field: 'emiratesId', label: 'Emirates ID' },
    { field: 'emiratesIdUrl', label: 'Emirates ID Document' },
    { field: 'specialties', label: 'Specialties', isArray: true },
    { field: 'areasOfOperation', label: 'Areas of Operation', isArray: true },
    { field: 'languages', label: 'Languages', isArray: true },
  ];
  
  const missing: string[] = [];
  let requiredFilled = 0;
  let optionalFilled = 0;
  
  for (const { field, label, isArray } of requiredFields as any[]) {
    const value = simsar[field];
    if (isArray) {
      const arr = JSON.parse(value || '[]');
      if (arr.length > 0) requiredFilled++;
      else missing.push(label);
    } else if (value && value !== '') {
      requiredFilled++;
    } else {
      missing.push(label);
    }
  }
  
  for (const { field, label, isArray } of optionalFields as any[]) {
    const value = simsar[field];
    if (isArray) {
      const arr = JSON.parse(value || '[]');
      if (arr.length > 0) optionalFilled++;
    } else if (value && value !== '') {
      optionalFilled++;
    }
  }
  
  const requiredScore = (requiredFilled / requiredFields.length) * 70;
  const optionalScore = (optionalFilled / optionalFields.length) * 30;
  const score = Math.round(requiredScore + optionalScore);
  const complete = missing.length === 0;
  
  return { score, complete, missing };
}

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

  const { 
    languages, 
    specialties, 
    areasOfOperation, 
    photoUrl, 
    reraCertificateUrl,
    licenseDocUrl,
    emiratesIdUrl,
    ...rest 
  } = parse.data;
  
  // First update with provided fields
  let updated = await prisma.simsar.update({
    where: { id: simsar.id },
    data: {
      ...rest,
      ...(photoUrl !== undefined ? { photoUrl: photoUrl || null } : {}),
      ...(reraCertificateUrl !== undefined ? { reraCertificateUrl: reraCertificateUrl || null } : {}),
      ...(licenseDocUrl !== undefined ? { licenseDocUrl: licenseDocUrl || null } : {}),
      ...(emiratesIdUrl !== undefined ? { emiratesIdUrl: emiratesIdUrl || null } : {}),
      ...(languages ? { languages: JSON.stringify(languages) } : {}),
      ...(specialties ? { specialties: JSON.stringify(specialties) } : {}),
      ...(areasOfOperation ? { areasOfOperation: JSON.stringify(areasOfOperation) } : {}),
    },
  });
  
  // Calculate profile completeness and update
  const completeness = calculateProfileCompleteness(updated);
  updated = await prisma.simsar.update({
    where: { id: simsar.id },
    data: {
      profileCompletenessScore: completeness.score,
      profileComplete: completeness.complete,
    },
  });

  return res.json({
    ...updated,
    languages: JSON.parse(updated.languages || "[]"),
    specialties: JSON.parse(updated.specialties || "[]"),
    areasOfOperation: JSON.parse(updated.areasOfOperation || "[]"),
    completeness,
  });
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
      verificationRequests: {
        orderBy: { submittedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Profile not found" });
  }

  const avgRating = simsar.reviews.length > 0 
    ? simsar.reviews.reduce((sum, r) => sum + r.rating, 0) / simsar.reviews.length 
    : 0;

  const completeness = calculateProfileCompleteness(simsar);
  const latestVerificationRequest = simsar.verificationRequests[0] || null;

  return res.json({
    ...simsar,
    languages: JSON.parse(simsar.languages || "[]"),
    specialties: JSON.parse(simsar.specialties || "[]"),
    areasOfOperation: JSON.parse(simsar.areasOfOperation || "[]"),
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: simsar.reviews.length,
    completeness,
    latestVerificationRequest,
  });
});

// Get profile completeness status
router.get("/me/completeness", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Profile not found" });
  }

  const completeness = calculateProfileCompleteness(simsar);
  
  return res.json({
    ...completeness,
    verificationStatus: simsar.verificationStatus,
    verificationNotes: simsar.verificationNotes,
    canSubmitVerification: completeness.complete && simsar.verificationStatus !== "UNDER_REVIEW",
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
  // Profile fields to update
  name: z.string().min(1),
  photoUrl: z.string().url(),
  reraId: z.string().min(1),
  reraCertificateUrl: z.string().url(),
  licenseNumber: z.string().min(1),
  licenseDocUrl: z.string().url(),
  experienceYears: z.number().min(0),
  whatsappNumber: z.string().min(1),
  // Optional fields
  bio: z.string().optional(),
  emiratesId: z.string().optional(),
  emiratesIdUrl: z.string().url().optional().or(z.literal("")),
  specialties: z.array(z.string()).optional(),
  areasOfOperation: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
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

  // Check if there's already a pending verification request
  if (simsar.verificationStatus === "UNDER_REVIEW") {
    return res.status(400).json({ error: "You already have a pending verification request" });
  }

  const { specialties, areasOfOperation, languages, emiratesIdUrl, ...profileData } = parse.data;

  // Update profile with verification data
  const updatedSimsar = await prisma.simsar.update({
    where: { id: simsar.id },
    data: {
      ...profileData,
      emiratesIdUrl: emiratesIdUrl || null,
      ...(specialties ? { specialties: JSON.stringify(specialties) } : {}),
      ...(areasOfOperation ? { areasOfOperation: JSON.stringify(areasOfOperation) } : {}),
      ...(languages ? { languages: JSON.stringify(languages) } : {}),
      profileComplete: true,
      profileCompletenessScore: 100,
    },
  });

  // Create documents object for admin review
  const documents = {
    reraCertificateUrl: parse.data.reraCertificateUrl,
    licenseDocUrl: parse.data.licenseDocUrl,
    ...(parse.data.emiratesIdUrl ? { emiratesIdUrl: parse.data.emiratesIdUrl } : {}),
    photoUrl: parse.data.photoUrl,
  };

  // Create verification request
  const verificationRequest = await prisma.verificationRequest.create({
    data: {
      simsarId: simsar.id,
      documents: JSON.stringify(documents),
      status: "PENDING",
    },
  });

  // Update simsar verification status
  await prisma.simsar.update({
    where: { id: simsar.id },
    data: { 
      verificationStatus: "UNDER_REVIEW",
      verificationNotes: null,
    },
  });

  return res.status(201).json({
    verificationRequest,
    message: "Verification request submitted successfully. Our team will review your documents within 24-48 hours.",
  });
});

// Get verification status and history
router.get("/:id/verification-status", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({ 
    where: { id: req.params.id },
    include: {
      verificationRequests: {
        orderBy: { submittedAt: "desc" },
      },
    },
  });
  
  if (!simsar) {
    return res.status(404).json({ error: "Simsar not found" });
  }
  if (simsar.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return res.json({
    status: simsar.verificationStatus,
    notes: simsar.verificationNotes,
    history: simsar.verificationRequests.map((r) => ({
      id: r.id,
      status: r.status,
      submittedAt: r.submittedAt,
      decidedAt: r.decidedAt,
      adminNotes: r.adminNotes,
    })),
  });
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
      referenceNumber: item.referenceNumber,
      type: item.type,
      propertyType: item.propertyType,
      title: item.title,
      description: item.description,
      location: item.location,
      building: item.building,
      price: item.price,
      priceNumeric: item.priceNumeric,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      area: item.area,
      areaNumeric: item.areaNumeric,
      furnishing: item.furnishing,
      amenities: JSON.parse(item.amenities || "[]"),
      features: JSON.parse(item.features || "[]"),
      images: JSON.parse(item.images || "[]"),
      status: item.status,
      featured: item.featured,
      viewCount: item.viewCount,
      createdAt: item.createdAt,
    }))
  );
});

// Helper to parse numeric values
function parseNumericPrice(price: string): number {
  const cleaned = price.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

function parseNumericArea(area: string): number {
  const cleaned = area.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

async function generateReferenceNumber(): Promise<string> {
  const count = await prisma.portfolioItem.count();
  const num = count + 1;
  return `MS-${String(num).padStart(5, '0')}`;
}

const portfolioSchema = z.object({
  type: z.enum(["sale", "rental", "off-plan"]),
  propertyType: z.enum(["apartment", "villa", "townhouse", "penthouse", "land", "office", "studio"]).default("apartment"),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  building: z.string().optional(),
  address: z.string().optional(),
  price: z.string().min(1),
  paymentPlan: z.string().optional(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area: z.string().min(1),
  furnishing: z.enum(["Furnished", "Unfurnished", "Semi-Furnished"]).optional(),
  completionYear: z.number().int().optional(),
  permitNumber: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string().url()).min(1),
  videoUrl: z.string().url().optional(),
  floorPlanUrl: z.string().url().optional(),
  status: z.enum(["sold", "rented", "available", "reserved"]),
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

  const referenceNumber = await generateReferenceNumber();
  const priceNumeric = parseNumericPrice(parse.data.price);
  const areaNumeric = parseNumericArea(parse.data.area);

  const item = await prisma.portfolioItem.create({
    data: {
      simsarId: simsar.id,
      referenceNumber,
      type: parse.data.type,
      propertyType: parse.data.propertyType || "apartment",
      title: parse.data.title,
      description: parse.data.description || null,
      location: parse.data.location,
      building: parse.data.building || null,
      address: parse.data.address || null,
      price: parse.data.price,
      priceNumeric,
      paymentPlan: parse.data.paymentPlan || null,
      bedrooms: parse.data.bedrooms,
      bathrooms: parse.data.bathrooms,
      area: parse.data.area,
      areaNumeric,
      furnishing: parse.data.furnishing || null,
      completionYear: parse.data.completionYear || null,
      permitNumber: parse.data.permitNumber || null,
      amenities: JSON.stringify(parse.data.amenities || []),
      features: JSON.stringify(parse.data.features || []),
      images: JSON.stringify(parse.data.images),
      videoUrl: parse.data.videoUrl || null,
      floorPlanUrl: parse.data.floorPlanUrl || null,
      status: parse.data.status,
    },
  });

  return res.status(201).json({
    id: item.id,
    referenceNumber: item.referenceNumber,
    type: item.type,
    propertyType: item.propertyType,
    title: item.title,
    description: item.description,
    location: item.location,
    building: item.building,
    price: item.price,
    priceNumeric: item.priceNumeric,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area: item.area,
    areaNumeric: item.areaNumeric,
    furnishing: item.furnishing,
    amenities: JSON.parse(item.amenities),
    features: JSON.parse(item.features),
    images: JSON.parse(item.images),
    status: item.status,
    createdAt: item.createdAt,
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

  const { images, amenities, features, price, area, ...rest } = parse.data;
  
  const updateData: any = { ...rest };
  if (images) updateData.images = JSON.stringify(images);
  if (amenities) updateData.amenities = JSON.stringify(amenities);
  if (features) updateData.features = JSON.stringify(features);
  if (price) {
    updateData.price = price;
    updateData.priceNumeric = parseNumericPrice(price);
  }
  if (area) {
    updateData.area = area;
    updateData.areaNumeric = parseNumericArea(area);
  }

  const item = await prisma.portfolioItem.update({
    where: { id: req.params.itemId },
    data: updateData,
  });

  return res.json({
    id: item.id,
    referenceNumber: item.referenceNumber,
    type: item.type,
    propertyType: item.propertyType,
    title: item.title,
    description: item.description,
    location: item.location,
    building: item.building,
    price: item.price,
    priceNumeric: item.priceNumeric,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area: item.area,
    areaNumeric: item.areaNumeric,
    furnishing: item.furnishing,
    amenities: JSON.parse(item.amenities),
    features: JSON.parse(item.features),
    images: JSON.parse(item.images),
    status: item.status,
    createdAt: item.createdAt,
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
