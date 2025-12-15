import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

/* ─── HELPER FUNCTIONS ────────────────────────────────────── */

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).substring(2, 6);
}

/* ─── PUBLIC ROUTES ───────────────────────────────────────── */

// List all verified agencies
router.get("/", async (req, res) => {
  const agencies = await prisma.agency.findMany({
    where: { verificationStatus: "VERIFIED" },
    include: {
      brokers: {
        include: {
          reviews: { where: { status: "ACTIVE" }, select: { rating: true } },
        },
      },
      reviews: { select: { rating: true } },
    },
  });

  const results = agencies.map((agency) => {
    // Calculate aggregate stats from broker reviews
    const allBrokerReviews = agency.brokers.flatMap((b) => b.reviews);
    const brokerAvgRating = allBrokerReviews.length > 0
      ? allBrokerReviews.reduce((sum, r) => sum + r.rating, 0) / allBrokerReviews.length
      : 0;

    // Agency direct reviews
    const agencyAvgRating = agency.reviews.length > 0
      ? agency.reviews.reduce((sum, r) => sum + r.rating, 0) / agency.reviews.length
      : 0;

    return {
      id: agency.id,
      name: agency.name,
      slug: agency.slug,
      logoUrl: agency.logoUrl,
      bannerUrl: agency.bannerUrl,
      bio: agency.bio,
      verificationStatus: agency.verificationStatus,
      brokerCount: agency.brokers.length,
      agencyRating: Math.round(agencyAvgRating * 10) / 10,
      agencyReviewCount: agency.reviews.length,
      brokerAvgRating: Math.round(brokerAvgRating * 10) / 10,
      totalBrokerReviews: allBrokerReviews.length,
    };
  });

  return res.json(results);
});

// Get single agency with brokers
router.get("/:id", async (req, res) => {
  const agency = await prisma.agency.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { email: true } },
      brokers: {
        include: {
          reviews: { where: { status: "ACTIVE" }, select: { rating: true } },
        },
      },
      reviews: {
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  // Calculate stats
  const allBrokerReviews = agency.brokers.flatMap((b) => b.reviews);
  const brokerAvgRating = allBrokerReviews.length > 0
    ? allBrokerReviews.reduce((sum, r) => sum + r.rating, 0) / allBrokerReviews.length
    : 0;

  const agencyAvgRating = agency.reviews.length > 0
    ? agency.reviews.reduce((sum, r) => sum + r.rating, 0) / agency.reviews.length
    : 0;

  return res.json({
    id: agency.id,
    name: agency.name,
    slug: agency.slug,
    logoUrl: agency.logoUrl,
    bannerUrl: agency.bannerUrl,
    bio: agency.bio,
    reraLicenseNumber: agency.reraLicenseNumber,
    website: agency.website,
    email: agency.email,
    phone: agency.phone,
    verificationStatus: agency.verificationStatus,
    createdAt: agency.createdAt,
    ownerId: agency.ownerId,
    brokerCount: agency.brokers.length,
    agencyRating: Math.round(agencyAvgRating * 10) / 10,
    agencyReviewCount: agency.reviews.length,
    brokerAvgRating: Math.round(brokerAvgRating * 10) / 10,
    totalBrokerReviews: allBrokerReviews.length,
    brokers: agency.brokers.map((b) => {
      const avgRating = b.reviews.length > 0
        ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
        : 0;
      return {
        id: b.id,
        name: b.name,
        photoUrl: b.photoUrl,
        bio: b.bio,
        experienceYears: b.experienceYears,
        languages: JSON.parse(b.languages || "[]"),
        verificationStatus: b.verificationStatus,
        tierHint: b.tierHint,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: b.reviews.length,
      };
    }),
    reviews: agency.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
      author: r.user.email.split("@")[0],
    })),
  });
});

// Get agency by slug
router.get("/slug/:slug", async (req, res) => {
  const agency = await prisma.agency.findUnique({
    where: { slug: req.params.slug },
  });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  // Redirect to ID-based endpoint
  return res.redirect(`/agencies/${agency.id}`);
});

/* ─── PROTECTED ROUTES (BROKER) ───────────────────────────── */

const createAgencySchema = z.object({
  name: z.string().min(2),
  bio: z.string().optional(),
  reraLicenseNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
});

// Create new agency
router.post("/", requireAuth(["BROKER"]), async (req, res) => {
  const parse = createAgencySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  // Check if user already owns an agency
  const existingAgency = await prisma.agency.findUnique({
    where: { ownerId: req.user!.userId },
  });

  if (existingAgency) {
    return res.status(409).json({ error: "You already own an agency" });
  }

  const slug = generateSlug(parse.data.name);

  const agency = await prisma.agency.create({
    data: {
      ownerId: req.user!.userId,
      name: parse.data.name,
      slug,
      bio: parse.data.bio || null,
      reraLicenseNumber: parse.data.reraLicenseNumber || null,
      website: parse.data.website || null,
      email: parse.data.email || null,
      phone: parse.data.phone || null,
      logoUrl: parse.data.logoUrl || null,
      bannerUrl: parse.data.bannerUrl || null,
    },
  });

  return res.status(201).json(agency);
});

const updateAgencySchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  reraLicenseNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
});

// Update agency (owner only)
router.put("/:id", requireAuth(["BROKER"]), async (req, res) => {
  const parse = updateAgencySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Not authorized to update this agency" });
  }

  const updated = await prisma.agency.update({
    where: { id: agency.id },
    data: {
      ...parse.data,
      logoUrl: parse.data.logoUrl || null,
      bannerUrl: parse.data.bannerUrl || null,
      website: parse.data.website || null,
      email: parse.data.email || null,
    },
  });

  return res.json(updated);
});

/* ─── BROKER MANAGEMENT ───────────────────────────────────── */

// List brokers in agency
router.get("/:id/brokers", async (req, res) => {
  const agency = await prisma.agency.findUnique({
    where: { id: req.params.id },
    include: {
      brokers: {
        include: {
          reviews: { where: { status: "ACTIVE" }, select: { rating: true } },
        },
      },
    },
  });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  const brokers = agency.brokers.map((b) => {
    const avgRating = b.reviews.length > 0
      ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
      : 0;
    return {
      id: b.id,
      name: b.name,
      photoUrl: b.photoUrl,
      bio: b.bio,
      experienceYears: b.experienceYears,
      languages: JSON.parse(b.languages || "[]"),
      whatsappNumber: b.whatsappNumber,
      verificationStatus: b.verificationStatus,
      tierHint: b.tierHint,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: b.reviews.length,
    };
  });

  return res.json(brokers);
});

const createBrokerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.number().optional(),
  languages: z.array(z.string()).optional(),
  message: z.string().optional(), // Optional message for recruitment offer
});

// Create broker account (agency owner) - with smart handling
router.post("/:id/brokers", requireAuth(["BROKER"]), async (req, res) => {
  const parse = createBrokerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can add brokers" });
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: parse.data.email },
    include: { simsar: true },
  });

  if (existingUser) {
    // Case 1: User is not a broker (just a USER role)
    if (existingUser.role === "USER") {
      return res.status(400).json({
        error: "Cannot add: this email is registered as a client account, not a broker",
      });
    }

    // Case 2: User is a broker
    if (existingUser.simsar) {
      // Case 2a: Already in an agency
      if (existingUser.simsar.agencyId) {
        return res.status(400).json({
          error: "This broker is already part of an agency",
        });
      }

      // Case 2b: Individual broker - auto-convert to recruitment offer
      // First check if there's already a pending offer or if broker has pending request to this agency
      const existingOffer = await prisma.recruitmentOffer.findFirst({
        where: {
          agencyId: agency.id,
          simsarId: existingUser.simsar.id,
          status: "PENDING",
        },
      });

      if (existingOffer) {
        return res.status(409).json({
          error: "A recruitment offer is already pending for this broker",
        });
      }

      // Check if broker has a pending join request to this agency
      const existingRequest = await prisma.agencyJoinRequest.findFirst({
        where: {
          agencyId: agency.id,
          simsarId: existingUser.simsar.id,
          status: "PENDING",
        },
      });

      if (existingRequest) {
        // Smart matching: Auto-approve the join request
        await prisma.$transaction([
          prisma.simsar.update({
            where: { id: existingUser.simsar.id },
            data: {
              agencyId: agency.id,
              simsarType: "AGENCY_BROKER",
              previousCompanyName: existingUser.simsar.companyName,
            },
          }),
          prisma.agencyJoinRequest.update({
            where: { id: existingRequest.id },
            data: { status: "APPROVED", decidedAt: new Date() },
          }),
        ]);

        return res.status(200).json({
          converted: true,
          autoApproved: true,
          message: "Broker had a pending join request which was auto-approved",
          broker: existingUser.simsar,
        });
      }

      // Create recruitment offer instead
      const offer = await prisma.recruitmentOffer.create({
        data: {
          agencyId: agency.id,
          simsarId: existingUser.simsar.id,
          message: parse.data.message || `${agency.name} would like you to join their team`,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      });

      return res.status(201).json({
        converted: true,
        offerId: offer.id,
        message: "Email belongs to an existing broker. A recruitment offer has been sent instead.",
        broker: {
          id: existingUser.simsar.id,
          name: existingUser.simsar.name,
          email: existingUser.email,
        },
      });
    }

    return res.status(400).json({ error: "User exists but has no broker profile" });
  }

  // Email doesn't exist - create new broker account
  // Generate temporary password (8 chars alphanumeric + special char)
  const tempPassword = Math.random().toString(36).substring(2, 8) + "A1!";
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Create user and simsar in transaction
  const result = await prisma.user.create({
    data: {
      email: parse.data.email,
      phone: parse.data.phone || null,
      passwordHash,
      role: "BROKER",
      mustChangePassword: true, // Force password change on first login
      simsar: {
        create: {
          name: parse.data.name,
          bio: parse.data.bio || null,
          experienceYears: parse.data.experienceYears || null,
          languages: JSON.stringify(parse.data.languages || []),
          simsarType: "AGENCY_BROKER",
          agencyId: agency.id,
        },
      },
    },
    include: { simsar: true },
  });

  return res.status(201).json({
    broker: result.simsar,
    credentials: {
      email: parse.data.email,
      temporaryPassword: tempPassword,
      mustChangePassword: true,
    },
  });
});

// Remove broker from agency
router.delete("/:id/brokers/:brokerId", requireAuth(["BROKER"]), async (req, res) => {
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can remove brokers" });
  }

  const simsar = await prisma.simsar.findUnique({ where: { id: req.params.brokerId } });

  if (!simsar || simsar.agencyId !== agency.id) {
    return res.status(404).json({ error: "Broker not found in this agency" });
  }

  // Remove from agency (convert to individual), restore previous company name if available
  await prisma.simsar.update({
    where: { id: simsar.id },
    data: {
      agencyId: null,
      simsarType: "INDIVIDUAL",
      companyName: simsar.previousCompanyName || simsar.companyName,
      previousCompanyName: null,
    },
  });

  return res.json({ success: true, message: "Broker removed and converted to individual" });
});

/* ─── INVITE SYSTEM ───────────────────────────────────────── */

const inviteSchema = z.object({
  email: z.string().email(),
});

// Invite broker to agency
router.post("/:id/invite", requireAuth(["BROKER"]), async (req, res) => {
  const parse = inviteSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can invite brokers" });
  }

  // Check for pending invite
  const existingInvite = await prisma.agencyInvite.findFirst({
    where: {
      agencyId: agency.id,
      email: parse.data.email,
      status: "PENDING",
    },
  });

  if (existingInvite) {
    return res.status(409).json({ error: "Invite already sent to this email" });
  }

  const invite = await prisma.agencyInvite.create({
    data: {
      agencyId: agency.id,
      email: parse.data.email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return res.status(201).json({
    invite,
    inviteUrl: `/agencies/invites/${invite.code}/accept`, // In production, full URL
  });
});

// List pending invites
router.get("/:id/invites", requireAuth(["BROKER"]), async (req, res) => {
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can view invites" });
  }

  const invites = await prisma.agencyInvite.findMany({
    where: { agencyId: agency.id },
    orderBy: { invitedAt: "desc" },
  });

  return res.json(invites);
});

// Accept invite
router.post("/invites/:code/accept", requireAuth(["BROKER"]), async (req, res) => {
  const invite = await prisma.agencyInvite.findUnique({
    where: { code: req.params.code },
    include: { agency: true },
  });

  if (!invite) {
    return res.status(404).json({ error: "Invite not found" });
  }

  if (invite.status !== "PENDING") {
    return res.status(400).json({ error: "Invite is no longer valid" });
  }

  if (new Date() > invite.expiresAt) {
    await prisma.agencyInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return res.status(400).json({ error: "Invite has expired" });
  }

  // Get user's simsar
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(400).json({ error: "You must have a broker profile to accept" });
  }

  if (simsar.agencyId) {
    return res.status(400).json({ error: "You are already part of an agency" });
  }

  // Update simsar and invite
  await prisma.$transaction([
    prisma.simsar.update({
      where: { id: simsar.id },
      data: {
        agencyId: invite.agencyId,
        simsarType: "AGENCY_BROKER",
      },
    }),
    prisma.agencyInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  return res.json({ success: true, agencyId: invite.agencyId });
});

/* ─── JOIN REQUEST SYSTEM ─────────────────────────────────── */

const joinRequestSchema = z.object({
  message: z.string().optional(),
});

// Request to join agency
router.post("/:id/join-request", requireAuth(["BROKER"]), async (req, res) => {
  const parse = joinRequestSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  // Check if user is an agency owner
  const ownedAgency = await prisma.agency.findUnique({
    where: { ownerId: req.user!.userId },
  });

  if (ownedAgency) {
    return res.status(400).json({ error: "Agency owners cannot join other agencies" });
  }

  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(400).json({ error: "You must have a broker profile" });
  }

  if (simsar.agencyId) {
    return res.status(400).json({ error: "You are already part of an agency" });
  }

  // Check for existing pending request to this agency
  const existingRequest = await prisma.agencyJoinRequest.findFirst({
    where: {
      agencyId: agency.id,
      simsarId: simsar.id,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    return res.status(409).json({ error: "You already have a pending request to this agency" });
  }

  // Smart matching: Check if agency has a pending recruitment offer for this broker
  const existingOffer = await prisma.recruitmentOffer.findFirst({
    where: {
      agencyId: agency.id,
      simsarId: simsar.id,
      status: "PENDING",
    },
  });

  if (existingOffer) {
    // Auto-accept the recruitment offer
    await prisma.$transaction([
      prisma.simsar.update({
        where: { id: simsar.id },
        data: {
          agencyId: agency.id,
          simsarType: "AGENCY_BROKER",
          previousCompanyName: simsar.companyName,
        },
      }),
      prisma.recruitmentOffer.update({
        where: { id: existingOffer.id },
        data: { status: "ACCEPTED", decidedAt: new Date() },
      }),
    ]);

    return res.status(200).json({
      autoAccepted: true,
      message: "Agency had already sent you an offer. You have been added to the agency.",
      agencyId: agency.id,
      agencyName: agency.name,
    });
  }

  // Create the join request
  const request = await prisma.agencyJoinRequest.create({
    data: {
      agencyId: agency.id,
      simsarId: simsar.id,
      message: parse.data.message || null,
    },
  });

  return res.status(201).json(request);
});

// List join requests (owner)
router.get("/:id/join-requests", requireAuth(["BROKER"]), async (req, res) => {
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can view requests" });
  }

  const requests = await prisma.agencyJoinRequest.findMany({
    where: { agencyId: agency.id, status: "PENDING" },
    include: {
      simsar: {
        select: {
          id: true,
          name: true,
          photoUrl: true,
          experienceYears: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(requests);
});

const decideJoinRequestSchema = z.object({
  approved: z.boolean(),
});

// Approve/reject join request
router.post("/:id/join-requests/:requestId/decide", requireAuth(["BROKER"]), async (req, res) => {
  const parse = decideJoinRequestSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can decide requests" });
  }

  const request = await prisma.agencyJoinRequest.findUnique({
    where: { id: req.params.requestId },
  });

  if (!request || request.agencyId !== agency.id) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.status !== "PENDING") {
    return res.status(400).json({ error: "Request already processed" });
  }

  if (parse.data.approved) {
    // Get simsar to save previous company name
    const simsar = await prisma.simsar.findUnique({
      where: { id: request.simsarId },
    });

    await prisma.$transaction([
      prisma.simsar.update({
        where: { id: request.simsarId },
        data: {
          agencyId: agency.id,
          simsarType: "AGENCY_BROKER",
          previousCompanyName: simsar?.companyName || null,
        },
      }),
      prisma.agencyJoinRequest.update({
        where: { id: request.id },
        data: { status: "APPROVED", decidedAt: new Date() },
      }),
    ]);
  } else {
    await prisma.agencyJoinRequest.update({
      where: { id: request.id },
      data: { status: "REJECTED", decidedAt: new Date() },
    });
  }

  return res.json({ success: true, approved: parse.data.approved });
});

/* ─── RECRUITMENT OFFER SYSTEM ────────────────────────────── */

const recruitmentOfferSchema = z.object({
  message: z.string().optional(),
});

// Send recruitment offer to existing broker
router.post("/:id/recruit/:simsarId", requireAuth(["BROKER"]), async (req, res) => {
  const parse = recruitmentOfferSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can send recruitment offers" });
  }

  const simsar = await prisma.simsar.findUnique({
    where: { id: req.params.simsarId },
    include: { user: { select: { email: true } } },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Broker not found" });
  }

  if (simsar.agencyId) {
    return res.status(400).json({ error: "This broker is already part of an agency" });
  }

  // Check if broker is an agency owner
  const brokerOwnedAgency = await prisma.agency.findUnique({
    where: { ownerId: simsar.userId },
  });

  if (brokerOwnedAgency) {
    return res.status(400).json({ error: "Cannot recruit an agency owner" });
  }

  // Check for existing pending offer
  const existingOffer = await prisma.recruitmentOffer.findFirst({
    where: {
      agencyId: agency.id,
      simsarId: simsar.id,
      status: "PENDING",
    },
  });

  if (existingOffer) {
    return res.status(409).json({ error: "A recruitment offer is already pending" });
  }

  // Check for pending join request from this broker (smart matching)
  const pendingRequest = await prisma.agencyJoinRequest.findFirst({
    where: {
      agencyId: agency.id,
      simsarId: simsar.id,
      status: "PENDING",
    },
  });

  if (pendingRequest) {
    // Auto-approve the join request
    await prisma.$transaction([
      prisma.simsar.update({
        where: { id: simsar.id },
        data: {
          agencyId: agency.id,
          simsarType: "AGENCY_BROKER",
          previousCompanyName: simsar.companyName,
        },
      }),
      prisma.agencyJoinRequest.update({
        where: { id: pendingRequest.id },
        data: { status: "APPROVED", decidedAt: new Date() },
      }),
    ]);

    return res.status(200).json({
      autoApproved: true,
      message: "Broker had already requested to join. They have been added to your agency.",
      broker: {
        id: simsar.id,
        name: simsar.name,
        email: simsar.user.email,
      },
    });
  }

  // Create recruitment offer
  const offer = await prisma.recruitmentOffer.create({
    data: {
      agencyId: agency.id,
      simsarId: simsar.id,
      message: parse.data.message || `${agency.name} would like you to join their team`,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
  });

  return res.status(201).json({
    offer,
    broker: {
      id: simsar.id,
      name: simsar.name,
      email: simsar.user.email,
    },
  });
});

// Withdraw recruitment offer
router.delete("/:id/recruit/:offerId", requireAuth(["BROKER"]), async (req, res) => {
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can withdraw offers" });
  }

  const offer = await prisma.recruitmentOffer.findUnique({
    where: { id: req.params.offerId },
  });

  if (!offer || offer.agencyId !== agency.id) {
    return res.status(404).json({ error: "Offer not found" });
  }

  if (offer.status !== "PENDING") {
    return res.status(400).json({ error: "Offer is no longer pending" });
  }

  await prisma.recruitmentOffer.delete({
    where: { id: offer.id },
  });

  return res.json({ success: true, message: "Offer withdrawn" });
});

// List recruitment offers sent by agency
router.get("/:id/recruitment-offers", requireAuth(["BROKER"]), async (req, res) => {
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  if (agency.ownerId !== req.user!.userId) {
    return res.status(403).json({ error: "Only agency owner can view recruitment offers" });
  }

  const offers = await prisma.recruitmentOffer.findMany({
    where: { agencyId: agency.id },
    include: {
      simsar: {
        select: {
          id: true,
          name: true,
          photoUrl: true,
          experienceYears: true,
          verificationStatus: true,
          companyName: true,
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

// Broker responds to recruitment offer (accept/decline)
router.post("/offers/:offerId/respond", requireAuth(["BROKER"]), async (req, res) => {
  const { accept } = req.body as { accept: boolean };

  if (typeof accept !== "boolean") {
    return res.status(400).json({ error: "accept must be a boolean" });
  }

  const offer = await prisma.recruitmentOffer.findUnique({
    where: { id: req.params.offerId },
    include: { agency: true },
  });

  if (!offer) {
    return res.status(404).json({ error: "Offer not found" });
  }

  // Check if the offer belongs to the current user's simsar
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar || simsar.id !== offer.simsarId) {
    return res.status(403).json({ error: "This offer is not for you" });
  }

  if (offer.status !== "PENDING") {
    return res.status(400).json({ error: "Offer is no longer valid" });
  }

  if (new Date() > offer.expiresAt) {
    await prisma.recruitmentOffer.update({
      where: { id: offer.id },
      data: { status: "EXPIRED" },
    });
    return res.status(400).json({ error: "Offer has expired" });
  }

  if (simsar.agencyId) {
    return res.status(400).json({ error: "You are already part of an agency" });
  }

  if (accept) {
    // Accept the offer - join the agency
    await prisma.$transaction([
      prisma.simsar.update({
        where: { id: simsar.id },
        data: {
          agencyId: offer.agencyId,
          simsarType: "AGENCY_BROKER",
          previousCompanyName: simsar.companyName,
        },
      }),
      prisma.recruitmentOffer.update({
        where: { id: offer.id },
        data: { status: "ACCEPTED", decidedAt: new Date() },
      }),
      // Also reject any pending join requests from this broker to other agencies
      prisma.agencyJoinRequest.updateMany({
        where: {
          simsarId: simsar.id,
          status: "PENDING",
        },
        data: { status: "REJECTED", decidedAt: new Date() },
      }),
      // Also decline any other pending offers
      prisma.recruitmentOffer.updateMany({
        where: {
          simsarId: simsar.id,
          status: "PENDING",
          id: { not: offer.id },
        },
        data: { status: "DECLINED", decidedAt: new Date() },
      }),
    ]);

    return res.json({
      success: true,
      accepted: true,
      agencyId: offer.agencyId,
      agencyName: offer.agency.name,
      message: `You have joined ${offer.agency.name}`,
    });
  } else {
    // Decline the offer
    await prisma.recruitmentOffer.update({
      where: { id: offer.id },
      data: { status: "DECLINED", decidedAt: new Date() },
    });

    return res.json({
      success: true,
      accepted: false,
      message: "Offer declined",
    });
  }
});

/* ─── AGENCY REVIEWS ──────────────────────────────────────── */

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(10),
});

// Submit agency review
router.post("/:id/reviews", requireAuth(["USER", "BROKER"]), async (req, res) => {
  const parse = reviewSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });

  if (!agency) {
    return res.status(404).json({ error: "Agency not found" });
  }

  const review = await prisma.agencyReview.create({
    data: {
      agencyId: agency.id,
      userId: req.user!.userId,
      rating: parse.data.rating,
      text: parse.data.text,
    },
  });

  return res.status(201).json(review);
});

// Get agency reviews
router.get("/:id/reviews", async (req, res) => {
  const reviews = await prisma.agencyReview.findMany({
    where: { agencyId: req.params.id },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
      author: r.user.email.split("@")[0],
    }))
  );
});

/* ─── MY AGENCY ───────────────────────────────────────────── */

// Get current user's agency (if owner)
router.get("/my/agency", requireAuth(["BROKER"]), async (req, res) => {
  const agency = await prisma.agency.findUnique({
    where: { ownerId: req.user!.userId },
    include: {
      brokers: {
        include: {
          reviews: { where: { status: "ACTIVE" }, select: { rating: true } },
        },
      },
      invites: { where: { status: "PENDING" } },
      joinRequests: {
        where: { status: "PENDING" },
        include: {
          simsar: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
              experienceYears: true,
              verificationStatus: true,
              companyName: true,
            },
          },
        },
      },
      recruitmentOffers: {
        where: { status: "PENDING" },
        include: {
          simsar: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
              experienceYears: true,
              verificationStatus: true,
              companyName: true,
            },
          },
        },
      },
    },
  });

  if (!agency) {
    return res.json(null);
  }

  // Auto-expire old offers
  const now = new Date();
  const expiredOffers = agency.recruitmentOffers.filter(
    (o) => new Date(o.expiresAt) < now
  );
  if (expiredOffers.length > 0) {
    await prisma.recruitmentOffer.updateMany({
      where: { id: { in: expiredOffers.map((o) => o.id) } },
      data: { status: "EXPIRED" },
    });
  }

  const pendingOffers = agency.recruitmentOffers.filter(
    (o) => new Date(o.expiresAt) >= now
  );

  return res.json({
    ...agency,
    brokerCount: agency.brokers.length,
    pendingInvites: agency.invites.length,
    pendingRequests: agency.joinRequests.length,
    pendingOffers: pendingOffers.length,
    recruitmentOffers: pendingOffers,
  });
});

export default router;

