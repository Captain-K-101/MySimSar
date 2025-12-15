import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Generate unique reference number
async function generateReferenceNumber(): Promise<string> {
  const count = await prisma.portfolioItem.count();
  const num = count + 1;
  return `MS-${String(num).padStart(5, '0')}`;
}

// Parse numeric price from string (e.g., "AED 1,200,000" -> 1200000)
function parseNumericPrice(price: string): number {
  const cleaned = price.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

// Parse numeric area from string (e.g., "1,200 sq ft" -> 1200)
function parseNumericArea(area: string): number {
  const cleaned = area.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

/* ─── PUBLIC ENDPOINTS ──────────────────────────────────────── */

// List all properties with filters
router.get("/", async (req, res) => {
  const {
    type,
    propertyType,
    location,
    minPrice,
    maxPrice,
    bedrooms,
    minArea,
    maxArea,
    furnishing,
    status = "available",
    sort = "newest",
    featured,
    brokerId,
    limit = "20",
    offset = "0",
  } = req.query;

  // Build where clause
  const where: any = {
    status: status as string,
  };

  if (type) where.type = type as string;
  if (propertyType) where.propertyType = propertyType as string;
  if (location) where.location = { contains: location as string };
  if (furnishing) where.furnishing = furnishing as string;
  if (featured === "true") where.featured = true;
  if (brokerId) where.simsarId = brokerId as string;

  // Numeric filters
  if (minPrice || maxPrice) {
    where.priceNumeric = {};
    if (minPrice) where.priceNumeric.gte = parseInt(minPrice as string);
    if (maxPrice) where.priceNumeric.lte = parseInt(maxPrice as string);
  }

  if (bedrooms) {
    const beds = parseInt(bedrooms as string);
    if (beds >= 5) {
      where.bedrooms = { gte: 5 };
    } else {
      where.bedrooms = beds;
    }
  }

  if (minArea || maxArea) {
    where.areaNumeric = {};
    if (minArea) where.areaNumeric.gte = parseInt(minArea as string);
    if (maxArea) where.areaNumeric.lte = parseInt(maxArea as string);
  }

  // Sorting
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { priceNumeric: "asc" };
  else if (sort === "price_desc") orderBy = { priceNumeric: "desc" };
  else if (sort === "popular") orderBy = { viewCount: "desc" };
  else if (sort === "area_desc") orderBy = { areaNumeric: "desc" };

  // Get total count for pagination
  const total = await prisma.portfolioItem.count({ where });

  // Fetch properties with broker info
  const properties = await prisma.portfolioItem.findMany({
    where,
    include: {
      simsar: {
        select: {
          id: true,
          name: true,
          photoUrl: true,
          whatsappNumber: true,
          verificationStatus: true,
          agency: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
      },
    },
    orderBy,
    take: parseInt(limit as string),
    skip: parseInt(offset as string),
  });

  // Transform response
  const results = properties.map((p) => ({
    id: p.id,
    referenceNumber: p.referenceNumber,
    type: p.type,
    propertyType: p.propertyType,
    title: p.title,
    location: p.location,
    building: p.building,
    price: p.price,
    priceNumeric: p.priceNumeric,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    areaNumeric: p.areaNumeric,
    furnishing: p.furnishing,
    images: JSON.parse(p.images || "[]"),
    status: p.status,
    featured: p.featured,
    viewCount: p.viewCount,
    createdAt: p.createdAt,
    broker: {
      id: p.simsar.id,
      name: p.simsar.name,
      photoUrl: p.simsar.photoUrl,
      whatsappNumber: p.simsar.whatsappNumber,
      verified: p.simsar.verificationStatus === "VERIFIED",
      agency: p.simsar.agency,
    },
  }));

  return res.json({
    properties: results,
    total,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    hasMore: parseInt(offset as string) + results.length < total,
  });
});

// Get single property with full details
router.get("/:id", async (req, res) => {
  const property = await prisma.portfolioItem.findUnique({
    where: { id: req.params.id },
    include: {
      simsar: {
        include: {
          reviews: {
            where: { status: "ACTIVE" },
            select: { rating: true },
          },
          agency: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              verificationStatus: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  // Increment view count
  await prisma.portfolioItem.update({
    where: { id: property.id },
    data: { viewCount: { increment: 1 } },
  });

  // Calculate broker rating
  const avgRating = property.simsar.reviews.length > 0
    ? property.simsar.reviews.reduce((sum, r) => sum + r.rating, 0) / property.simsar.reviews.length
    : 0;

  return res.json({
    id: property.id,
    referenceNumber: property.referenceNumber,
    type: property.type,
    propertyType: property.propertyType,
    title: property.title,
    description: property.description,
    location: property.location,
    building: property.building,
    address: property.address,
    latitude: property.latitude,
    longitude: property.longitude,
    price: property.price,
    priceNumeric: property.priceNumeric,
    paymentPlan: property.paymentPlan,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    areaNumeric: property.areaNumeric,
    furnishing: property.furnishing,
    completionYear: property.completionYear,
    permitNumber: property.permitNumber,
    amenities: JSON.parse(property.amenities || "[]"),
    features: JSON.parse(property.features || "[]"),
    images: JSON.parse(property.images || "[]"),
    videoUrl: property.videoUrl,
    floorPlanUrl: property.floorPlanUrl,
    status: property.status,
    featured: property.featured,
    viewCount: property.viewCount + 1,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    broker: {
      id: property.simsar.id,
      name: property.simsar.name,
      photoUrl: property.simsar.photoUrl,
      whatsappNumber: property.simsar.whatsappNumber,
      verified: property.simsar.verificationStatus === "VERIFIED",
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: property.simsar.reviews.length,
      agency: property.simsar.agency,
    },
  });
});

// Get similar properties (same location, property type, similar specs)
router.get("/:id/similar", async (req, res) => {
  const property = await prisma.portfolioItem.findUnique({
    where: { id: req.params.id },
  });

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  const priceRange = {
    min: Math.floor(property.priceNumeric * 0.8),
    max: Math.ceil(property.priceNumeric * 1.2),
  };

  const bedroomRange = {
    min: Math.max(0, property.bedrooms - 1),
    max: property.bedrooms + 1,
  };

  // Find similar properties from different brokers
  const similarProperties = await prisma.portfolioItem.findMany({
    where: {
      id: { not: property.id },
      simsarId: { not: property.simsarId }, // Different broker
      status: "available",
      location: property.location,
      propertyType: property.propertyType,
      priceNumeric: {
        gte: priceRange.min,
        lte: priceRange.max,
      },
      bedrooms: {
        gte: bedroomRange.min,
        lte: bedroomRange.max,
      },
    },
    include: {
      simsar: {
        select: {
          id: true,
          name: true,
          photoUrl: true,
          whatsappNumber: true,
          verificationStatus: true,
        },
      },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // If not enough results, relax criteria
  if (similarProperties.length < 3) {
    const moreProperties = await prisma.portfolioItem.findMany({
      where: {
        id: { 
          not: property.id,
          notIn: similarProperties.map(p => p.id),
        },
        status: "available",
        OR: [
          { location: property.location },
          { propertyType: property.propertyType },
        ],
      },
      include: {
        simsar: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            whatsappNumber: true,
            verificationStatus: true,
          },
        },
      },
      take: 6 - similarProperties.length,
      orderBy: { createdAt: "desc" },
    });
    similarProperties.push(...moreProperties);
  }

  const results = similarProperties.map((p) => ({
    id: p.id,
    referenceNumber: p.referenceNumber,
    type: p.type,
    propertyType: p.propertyType,
    title: p.title,
    location: p.location,
    price: p.price,
    priceNumeric: p.priceNumeric,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    images: JSON.parse(p.images || "[]"),
    status: p.status,
    broker: {
      id: p.simsar.id,
      name: p.simsar.name,
      photoUrl: p.simsar.photoUrl,
      verified: p.simsar.verificationStatus === "VERIFIED",
    },
  }));

  return res.json(results);
});

// Get other brokers with properties in the same area
router.get("/:id/other-brokers", async (req, res) => {
  const property = await prisma.portfolioItem.findUnique({
    where: { id: req.params.id },
  });

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  // Find brokers with properties in the same location
  const brokersWithProperties = await prisma.portfolioItem.groupBy({
    by: ['simsarId'],
    where: {
      simsarId: { not: property.simsarId },
      location: property.location,
      status: "available",
    },
    _count: { id: true },
  });

  const brokerIds = brokersWithProperties.map(b => b.simsarId);

  const brokers = await prisma.simsar.findMany({
    where: {
      id: { in: brokerIds },
    },
    include: {
      reviews: {
        where: { status: "ACTIVE" },
        select: { rating: true },
      },
      agency: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
    },
    take: 5,
  });

  const results = brokers.map((broker) => {
    const avgRating = broker.reviews.length > 0
      ? broker.reviews.reduce((sum, r) => sum + r.rating, 0) / broker.reviews.length
      : 0;
    const propertyCount = brokersWithProperties.find(b => b.simsarId === broker.id)?._count.id || 0;

    return {
      id: broker.id,
      name: broker.name,
      photoUrl: broker.photoUrl,
      whatsappNumber: broker.whatsappNumber,
      verified: broker.verificationStatus === "VERIFIED",
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: broker.reviews.length,
      propertiesInArea: propertyCount,
      agency: broker.agency,
    };
  });

  return res.json(results);
});

/* ─── PROTECTED ENDPOINTS (BROKER) ──────────────────────────── */

const createPropertySchema = z.object({
  type: z.enum(["sale", "rental", "off-plan"]),
  propertyType: z.enum(["apartment", "villa", "townhouse", "penthouse", "land", "office", "studio"]).default("apartment"),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  building: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
  status: z.enum(["available", "sold", "rented", "reserved"]).default("available"),
});

// Create property
router.post("/", requireAuth(["BROKER"]), async (req, res) => {
  const parse = createPropertySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Broker profile not found" });
  }

  const referenceNumber = await generateReferenceNumber();
  const priceNumeric = parseNumericPrice(parse.data.price);
  const areaNumeric = parseNumericArea(parse.data.area);

  const property = await prisma.portfolioItem.create({
    data: {
      simsarId: simsar.id,
      referenceNumber,
      type: parse.data.type,
      propertyType: parse.data.propertyType,
      title: parse.data.title,
      description: parse.data.description || null,
      location: parse.data.location,
      building: parse.data.building || null,
      address: parse.data.address || null,
      latitude: parse.data.latitude || null,
      longitude: parse.data.longitude || null,
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
    ...property,
    amenities: JSON.parse(property.amenities),
    features: JSON.parse(property.features),
    images: JSON.parse(property.images),
  });
});

// Update property
router.put("/:id", requireAuth(["BROKER"]), async (req, res) => {
  const parse = createPropertySchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Broker profile not found" });
  }

  const existingProperty = await prisma.portfolioItem.findUnique({
    where: { id: req.params.id },
  });

  if (!existingProperty) {
    return res.status(404).json({ error: "Property not found" });
  }

  if (existingProperty.simsarId !== simsar.id) {
    return res.status(403).json({ error: "You can only update your own properties" });
  }

  const { amenities, features, images, price, area, ...rest } = parse.data;

  const updateData: any = { ...rest };

  if (amenities) updateData.amenities = JSON.stringify(amenities);
  if (features) updateData.features = JSON.stringify(features);
  if (images) updateData.images = JSON.stringify(images);
  if (price) {
    updateData.price = price;
    updateData.priceNumeric = parseNumericPrice(price);
  }
  if (area) {
    updateData.area = area;
    updateData.areaNumeric = parseNumericArea(area);
  }

  const property = await prisma.portfolioItem.update({
    where: { id: req.params.id },
    data: updateData,
  });

  return res.json({
    ...property,
    amenities: JSON.parse(property.amenities),
    features: JSON.parse(property.features),
    images: JSON.parse(property.images),
  });
});

// Delete property
router.delete("/:id", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Broker profile not found" });
  }

  const existingProperty = await prisma.portfolioItem.findUnique({
    where: { id: req.params.id },
  });

  if (!existingProperty) {
    return res.status(404).json({ error: "Property not found" });
  }

  if (existingProperty.simsarId !== simsar.id) {
    return res.status(403).json({ error: "You can only delete your own properties" });
  }

  await prisma.portfolioItem.delete({
    where: { id: req.params.id },
  });

  return res.json({ success: true, message: "Property deleted" });
});

// Get broker's own properties
router.get("/my/listings", requireAuth(["BROKER"]), async (req, res) => {
  const simsar = await prisma.simsar.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!simsar) {
    return res.status(404).json({ error: "Broker profile not found" });
  }

  const properties = await prisma.portfolioItem.findMany({
    where: { simsarId: simsar.id },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    properties.map((p) => ({
      ...p,
      amenities: JSON.parse(p.amenities || "[]"),
      features: JSON.parse(p.features || "[]"),
      images: JSON.parse(p.images || "[]"),
    }))
  );
});

/* ─── STATS ─────────────────────────────────────────────────── */

// Get property stats (for homepage)
router.get("/stats/overview", async (_req, res) => {
  const [totalProperties, totalForSale, totalForRent, totalOffPlan] = await Promise.all([
    prisma.portfolioItem.count({ where: { status: "available" } }),
    prisma.portfolioItem.count({ where: { status: "available", type: "sale" } }),
    prisma.portfolioItem.count({ where: { status: "available", type: "rental" } }),
    prisma.portfolioItem.count({ where: { status: "available", type: "off-plan" } }),
  ]);

  // Get popular locations
  const locationGroups = await prisma.portfolioItem.groupBy({
    by: ['location'],
    where: { status: "available" },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  return res.json({
    totalProperties,
    totalForSale,
    totalForRent,
    totalOffPlan,
    popularLocations: locationGroups.map(l => ({
      name: l.location,
      count: l._count.id,
    })),
  });
});

// Get featured properties (for homepage)
router.get("/featured/list", async (_req, res) => {
  const properties = await prisma.portfolioItem.findMany({
    where: {
      status: "available",
      featured: true,
    },
    include: {
      simsar: {
        select: {
          id: true,
          name: true,
          photoUrl: true,
          verificationStatus: true,
        },
      },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // If not enough featured, get popular ones
  if (properties.length < 6) {
    const moreProperties = await prisma.portfolioItem.findMany({
      where: {
        status: "available",
        id: { notIn: properties.map(p => p.id) },
      },
      include: {
        simsar: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            verificationStatus: true,
          },
        },
      },
      take: 6 - properties.length,
      orderBy: { viewCount: "desc" },
    });
    properties.push(...moreProperties);
  }

  return res.json(
    properties.map((p) => ({
      id: p.id,
      referenceNumber: p.referenceNumber,
      type: p.type,
      propertyType: p.propertyType,
      title: p.title,
      location: p.location,
      price: p.price,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      images: JSON.parse(p.images || "[]"),
      broker: {
        id: p.simsar.id,
        name: p.simsar.name,
        photoUrl: p.simsar.photoUrl,
        verified: p.simsar.verificationStatus === "VERIFIED",
      },
    }))
  );
});

export default router;

