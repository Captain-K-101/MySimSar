import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.recruitmentOffer.deleteMany();
  await prisma.agencyReview.deleteMany();
  await prisma.agencyJoinRequest.deleteMany();
  await prisma.agencyInvite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.transactionClaim.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.simsar.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ Cleared existing data\n");

  // Hash password
  const passwordHash = await bcrypt.hash("password123", 10);

  // Create test user
  console.log("Creating test users...");
  const testUser = await prisma.user.create({
    data: {
      email: "user@test.com",
      phone: "+971501234567",
      passwordHash,
      role: "USER",
      status: "active",
    },
  });
  console.log(`  ✓ Created user: user@test.com / password123`);

  // Create admin user
  await prisma.user.create({
    data: {
      email: "admin@test.com",
      phone: "+971509999999",
      passwordHash,
      role: "ADMIN",
      status: "active",
    },
  });
  console.log(`  ✓ Created admin: admin@test.com / password123`);

  // ─── INDIVIDUAL BROKERS ─────────────────────────────────────
  console.log("\nCreating individual broker accounts...");

  const broker1 = await prisma.user.create({
    data: {
      email: "broker@test.com",
      phone: "+971502222222",
      passwordHash,
      role: "BROKER",
      status: "active",
      simsar: {
        create: {
          name: "Sarah Al-Rashid",
          photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
          bio: "With over 8 years of experience in Dubai's luxury real estate market, I specialize in helping clients find their dream homes in premium locations.",
          reraId: "BRN-12345",
          licenseNumber: "DXB-2019-12345",
          experienceYears: 8,
          companyName: "Emaar Properties",
          languages: JSON.stringify(["English", "Arabic"]),
          whatsappNumber: "+971502222222",
          verificationStatus: "VERIFIED",
          profileCompletenessScore: 95,
          tierHint: "Platinum",
          simsarType: "INDIVIDUAL",
        },
      },
    },
    include: { simsar: true },
  });
  console.log(`  ✓ Created individual broker: broker@test.com / password123 (Sarah Al-Rashid)`);

  const broker2 = await prisma.user.create({
    data: {
      email: "ahmed@test.com",
      phone: "+971503333333",
      passwordHash,
      role: "BROKER",
      status: "active",
      simsar: {
        create: {
          name: "Ahmed Hassan",
          photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
          bio: "12 years in Dubai luxury real estate. Expert in Downtown, DIFC, and Palm properties.",
          reraId: "BRN-67890",
          licenseNumber: "DXB-2015-67890",
          experienceYears: 12,
          companyName: "Hassan Realty",
          languages: JSON.stringify(["English", "Arabic", "French"]),
          whatsappNumber: "+971503333333",
          verificationStatus: "VERIFIED",
          profileCompletenessScore: 90,
          tierHint: "Gold",
          simsarType: "INDIVIDUAL",
        },
      },
    },
    include: { simsar: true },
  });
  console.log(`  ✓ Created individual broker: ahmed@test.com / password123 (Ahmed Hassan)`);

  // ─── AGENCY SETUP ───────────────────────────────────────────
  console.log("\nCreating agency with brokers...");

  // Create agency owner
  const agencyOwner = await prisma.user.create({
    data: {
      email: "agency@test.com",
      phone: "+971506666666",
      passwordHash,
      role: "BROKER",
      status: "active",
      simsar: {
        create: {
          name: "Khalid Al-Mansoori",
          photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
          bio: "Founder & CEO of Gulf Premier Properties. 20 years in UAE real estate.",
          reraId: "BRN-00001",
          licenseNumber: "DXB-2005-00001",
          experienceYears: 20,
          companyName: "Gulf Premier Properties",
          languages: JSON.stringify(["English", "Arabic"]),
          whatsappNumber: "+971506666666",
          verificationStatus: "VERIFIED",
          profileCompletenessScore: 100,
          tierHint: "Platinum",
          simsarType: "INDIVIDUAL",
        },
      },
    },
  });
  console.log(`  ✓ Created agency owner: agency@test.com / password123 (Khalid Al-Mansoori)`);

  // Create the agency
  const agency = await prisma.agency.create({
    data: {
      ownerId: agencyOwner.id,
      name: "Gulf Premier Properties",
      slug: "gulf-premier-properties",
      logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop",
      bannerUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=400&fit=crop",
      bio: "Gulf Premier Properties is a leading real estate agency in the UAE, specializing in luxury residential and commercial properties across Dubai and Abu Dhabi. With over 50 successful transactions annually and a team of expert brokers, we deliver exceptional service to buyers, sellers, and investors.",
      reraLicenseNumber: "RERA-AGY-12345",
      website: "https://gulfpremierproperties.ae",
      email: "info@gulfpremierproperties.ae",
      phone: "+97145551234",
      verificationStatus: "VERIFIED",
    },
  });
  console.log(`  ✓ Created agency: Gulf Premier Properties`);

  // Create agency brokers
  const agencyBroker1 = await prisma.user.create({
    data: {
      email: "fatima@test.com",
      phone: "+971507777777",
      passwordHash,
      role: "BROKER",
      status: "active",
      simsar: {
        create: {
          name: "Fatima Al-Zahra",
          photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
          bio: "Luxury property specialist with focus on Palm Jumeirah and Emirates Hills.",
          reraId: "BRN-33333",
          licenseNumber: "DXB-2018-33333",
          experienceYears: 6,
          languages: JSON.stringify(["English", "Arabic", "Hindi"]),
          whatsappNumber: "+971507777777",
          verificationStatus: "VERIFIED",
          profileCompletenessScore: 85,
          tierHint: "Gold",
          simsarType: "AGENCY_BROKER",
          agencyId: agency.id,
        },
      },
    },
    include: { simsar: true },
  });
  console.log(`  ✓ Created agency broker: fatima@test.com / password123 (Fatima Al-Zahra @ Gulf Premier)`);

  const agencyBroker2 = await prisma.user.create({
    data: {
      email: "raj@test.com",
      phone: "+971508888888",
      passwordHash,
      role: "BROKER",
      status: "active",
      simsar: {
        create: {
          name: "Raj Patel",
          photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
          bio: "Investment property expert. Helped clients build portfolios worth over AED 100M.",
          reraId: "BRN-44444",
          licenseNumber: "DXB-2017-44444",
          experienceYears: 7,
          languages: JSON.stringify(["English", "Hindi", "Gujarati"]),
          whatsappNumber: "+971508888888",
          verificationStatus: "VERIFIED",
          profileCompletenessScore: 80,
          tierHint: "Gold",
          simsarType: "AGENCY_BROKER",
          agencyId: agency.id,
        },
      },
    },
    include: { simsar: true },
  });
  console.log(`  ✓ Created agency broker: raj@test.com / password123 (Raj Patel @ Gulf Premier)`);

  const agencyBroker3 = await prisma.user.create({
    data: {
      email: "lisa@test.com",
      phone: "+971509000000",
      passwordHash,
      role: "BROKER",
      status: "active",
      simsar: {
        create: {
          name: "Lisa Chen",
          photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
          bio: "Specialist in off-plan properties and new developments. Mandarin speaker.",
          reraId: "BRN-55555",
          licenseNumber: "DXB-2019-55555",
          experienceYears: 5,
          languages: JSON.stringify(["English", "Mandarin", "Cantonese"]),
          whatsappNumber: "+971509000000",
          verificationStatus: "VERIFIED",
          profileCompletenessScore: 78,
          tierHint: "Silver",
          simsarType: "AGENCY_BROKER",
          agencyId: agency.id,
        },
      },
    },
    include: { simsar: true },
  });
  console.log(`  ✓ Created agency broker: lisa@test.com / password123 (Lisa Chen @ Gulf Premier)`);

  // ─── CREATE REVIEWS ─────────────────────────────────────────
  console.log("\nCreating sample reviews...");
  
  // Reviews for individual brokers
  if (broker1.simsar) {
    await prisma.review.createMany({
      data: [
        {
          simsarId: broker1.simsar.id,
          userId: testUser.id,
          rating: 5,
          text: "Sarah was incredibly helpful throughout our apartment search. She understood our requirements perfectly and showed us properties that matched exactly what we were looking for. Highly recommend!",
          sentimentScore: 0.95,
          verifiedFlag: true,
          status: "ACTIVE",
        },
        {
          simsarId: broker1.simsar.id,
          userId: testUser.id,
          rating: 5,
          text: "Professional, knowledgeable, and always available. Sarah made our first property investment in Dubai a smooth experience.",
          sentimentScore: 0.92,
          verifiedFlag: true,
          status: "ACTIVE",
        },
      ],
    });
    console.log(`  ✓ Created 2 reviews for Sarah Al-Rashid`);
  }

  if (broker2.simsar) {
    await prisma.review.create({
      data: {
        simsarId: broker2.simsar.id,
        userId: testUser.id,
        rating: 5,
        text: "Ahmed's knowledge of the Downtown market is exceptional. Found us the perfect investment property.",
        sentimentScore: 0.90,
        verifiedFlag: true,
        status: "ACTIVE",
      },
    });
    console.log(`  ✓ Created 1 review for Ahmed Hassan`);
  }

  // Reviews for agency brokers
  if (agencyBroker1.simsar) {
    await prisma.review.createMany({
      data: [
        {
          simsarId: agencyBroker1.simsar.id,
          userId: testUser.id,
          rating: 5,
          text: "Fatima helped us find our dream villa on the Palm. Her expertise in luxury properties is unmatched!",
          sentimentScore: 0.94,
          verifiedFlag: true,
          status: "ACTIVE",
        },
        {
          simsarId: agencyBroker1.simsar.id,
          userId: testUser.id,
          rating: 4,
          text: "Very professional service. Would recommend for high-end properties.",
          sentimentScore: 0.85,
          verifiedFlag: true,
          status: "ACTIVE",
        },
      ],
    });
    console.log(`  ✓ Created 2 reviews for Fatima Al-Zahra`);
  }

  if (agencyBroker2.simsar) {
    await prisma.review.createMany({
      data: [
        {
          simsarId: agencyBroker2.simsar.id,
          userId: testUser.id,
          rating: 5,
          text: "Raj is an investment wizard! He helped me build a portfolio of 3 properties with excellent ROI potential.",
          sentimentScore: 0.93,
          verifiedFlag: true,
          status: "ACTIVE",
        },
        {
          simsarId: agencyBroker2.simsar.id,
          userId: testUser.id,
          rating: 5,
          text: "Excellent market knowledge and very patient with all my questions.",
          sentimentScore: 0.91,
          verifiedFlag: true,
          status: "ACTIVE",
        },
        {
          simsarId: agencyBroker2.simsar.id,
          userId: testUser.id,
          rating: 4,
          text: "Great experience overall. Would use his services again.",
          sentimentScore: 0.82,
          verifiedFlag: true,
          status: "ACTIVE",
        },
      ],
    });
    console.log(`  ✓ Created 3 reviews for Raj Patel`);
  }

  if (agencyBroker3.simsar) {
    await prisma.review.create({
      data: {
        simsarId: agencyBroker3.simsar.id,
        userId: testUser.id,
        rating: 4,
        text: "Lisa's knowledge of off-plan projects is impressive. Helped us secure a great deal in a new development.",
        sentimentScore: 0.88,
        verifiedFlag: true,
        status: "ACTIVE",
      },
    });
    console.log(`  ✓ Created 1 review for Lisa Chen`);
  }

  // Agency-level reviews
  await prisma.agencyReview.createMany({
    data: [
      {
        agencyId: agency.id,
        userId: testUser.id,
        rating: 5,
        text: "Gulf Premier Properties is hands down the best agency I've worked with. Their team is professional, responsive, and truly cares about finding the right property for you.",
      },
      {
        agencyId: agency.id,
        userId: testUser.id,
        rating: 5,
        text: "Incredible service from start to finish. Every broker we worked with was knowledgeable and helpful.",
      },
      {
        agencyId: agency.id,
        userId: testUser.id,
        rating: 4,
        text: "Good agency with a solid team. Would recommend for luxury property searches.",
      },
    ],
  });
  console.log(`  ✓ Created 3 agency reviews for Gulf Premier Properties`);

  // ─── RECRUITMENT OFFERS & JOIN REQUESTS ───────────────────────
  console.log("\nCreating recruitment offers and join requests...");

  // Agency sends recruitment offer to Ahmed (individual broker)
  if (broker2.simsar) {
    await prisma.recruitmentOffer.create({
      data: {
        agencyId: agency.id,
        simsarId: broker2.simsar.id,
        message: "Hi Ahmed! We've been impressed by your track record in Downtown and DIFC. Gulf Premier Properties would love to have you on our team. Join us and access our premium listings, marketing support, and client network!",
        status: "PENDING",
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });
    console.log(`  ✓ Created recruitment offer from Gulf Premier to Ahmed Hassan`);
  }

  // Sarah (individual broker) requests to join the agency
  if (broker1.simsar) {
    await prisma.agencyJoinRequest.create({
      data: {
        agencyId: agency.id,
        simsarId: broker1.simsar.id,
        message: "I'm interested in joining Gulf Premier Properties. I believe my experience in Emaar and luxury market expertise would be a great addition to your team.",
        status: "PENDING",
      },
    });
    console.log(`  ✓ Created join request from Sarah Al-Rashid to Gulf Premier`);
  }

  console.log("\n✅ Seeding complete!\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  TEST CREDENTIALS");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  USERS:");
  console.log("    User:   user@test.com       / password123");
  console.log("    Admin:  admin@test.com      / password123");
  console.log("");
  console.log("  INDIVIDUAL BROKERS:");
  console.log("    broker@test.com             / password123  (Sarah Al-Rashid)");
  console.log("    ahmed@test.com              / password123  (Ahmed Hassan)");
  console.log("");
  console.log("  AGENCY OWNER:");
  console.log("    agency@test.com             / password123  (Khalid Al-Mansoori @ Gulf Premier)");
  console.log("");
  console.log("  AGENCY BROKERS (Gulf Premier Properties):");
  console.log("    fatima@test.com             / password123  (Fatima Al-Zahra)");
  console.log("    raj@test.com                / password123  (Raj Patel)");
  console.log("    lisa@test.com               / password123  (Lisa Chen)");
  console.log("═══════════════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
