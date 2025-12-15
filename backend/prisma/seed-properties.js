"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SAMPLE_PROPERTIES = [
    {
        type: "sale",
        propertyType: "apartment",
        title: "Luxury 2BR Apartment in Dubai Marina",
        description: "Stunning 2-bedroom apartment with breathtaking marina views. Modern finishes throughout, including Italian marble flooring, high-end kitchen appliances, and floor-to-ceiling windows. Building amenities include infinity pool, gym, and 24/7 concierge.",
        location: "Dubai Marina",
        building: "Marina Gate Tower 1",
        address: "Marina Gate, Dubai Marina, Dubai",
        price: "AED 2,500,000",
        bedrooms: 2,
        bathrooms: 3,
        area: "1,450 sq ft",
        furnishing: "Furnished",
        completionYear: 2020,
        permitNumber: "DLD-12345",
        amenities: ["Pool", "Gym", "Concierge", "Parking", "Security"],
        features: ["Balcony", "Marina View", "Walk-in Closet", "Smart Home"],
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        status: "available",
        featured: true,
    },
    {
        type: "sale",
        propertyType: "villa",
        title: "5BR Garden Villa with Private Pool",
        description: "Spacious family villa in a prestigious community. Features include a private pool, landscaped garden, maid's room, and driver's quarters. Close to international schools and shopping malls.",
        location: "Arabian Ranches",
        building: "Saheel Community",
        price: "AED 6,800,000",
        bedrooms: 5,
        bathrooms: 6,
        area: "5,200 sq ft",
        furnishing: "Unfurnished",
        completionYear: 2015,
        amenities: ["Private Pool", "Garden", "Parking", "Security", "Community Center"],
        features: ["Maid's Room", "Driver's Room", "Study", "Family Room", "BBQ Area"],
        images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1600607687644-c7f34b5063c7?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop",
        ],
        status: "available",
        featured: true,
    },
    {
        type: "rental",
        propertyType: "apartment",
        title: "Downtown Studio with Burj Khalifa View",
        description: "Modern studio apartment with stunning views of Burj Khalifa. Perfect for professionals seeking a central location. Walking distance to Dubai Mall and Metro station.",
        location: "Downtown Dubai",
        building: "Boulevard Point",
        price: "AED 85,000",
        bedrooms: 0,
        bathrooms: 1,
        area: "550 sq ft",
        furnishing: "Furnished",
        completionYear: 2018,
        amenities: ["Pool", "Gym", "Concierge", "Parking"],
        features: ["Burj Khalifa View", "Built-in Wardrobes", "Balcony"],
        images: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        ],
        status: "available",
        featured: false,
    },
    {
        type: "rental",
        propertyType: "villa",
        title: "Beach-Front 4BR Villa on Palm Jumeirah",
        description: "Exclusive beachfront villa with direct beach access. Features include private infinity pool, home cinema, and staff quarters. Available for short or long-term lease.",
        location: "Palm Jumeirah",
        building: "Frond O",
        price: "AED 650,000",
        bedrooms: 4,
        bathrooms: 5,
        area: "6,800 sq ft",
        furnishing: "Furnished",
        completionYear: 2012,
        amenities: ["Private Pool", "Beach Access", "Gym", "Security", "Garden"],
        features: ["Home Cinema", "Staff Quarters", "Private Beach", "Rooftop Terrace"],
        images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1600607687644-c7f34b5063c7?w=800&h=600&fit=crop",
        ],
        status: "available",
        featured: true,
    },
    {
        type: "off-plan",
        propertyType: "apartment",
        title: "1BR Off-Plan in Dubai Creek Harbour",
        description: "Invest in the future of Dubai. Premium 1-bedroom apartment in the iconic Dubai Creek Tower development. Expected completion Q4 2026. Attractive payment plan available.",
        location: "Dubai Creek Harbour",
        building: "Creek Rise",
        price: "AED 1,200,000",
        bedrooms: 1,
        bathrooms: 1,
        area: "750 sq ft",
        completionYear: 2026,
        paymentPlan: "60/40 Payment Plan",
        amenities: ["Pool", "Gym", "Kids Play Area", "Jogging Track", "Retail Outlets"],
        features: ["Creek View", "Smart Home", "Balcony", "High Ceilings"],
        images: [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        status: "available",
        featured: false,
    },
    {
        type: "sale",
        propertyType: "penthouse",
        title: "Sky-High Penthouse in JBR",
        description: "Ultra-luxury penthouse spanning the top two floors with 360-degree views of the Arabian Gulf and Dubai skyline. Features include private elevator, rooftop terrace, and infinity pool.",
        location: "JBR",
        building: "1/JBR",
        price: "AED 25,000,000",
        bedrooms: 4,
        bathrooms: 5,
        area: "8,500 sq ft",
        furnishing: "Semi-Furnished",
        completionYear: 2022,
        amenities: ["Private Pool", "Private Elevator", "Gym", "Spa", "Concierge"],
        features: ["Sea View", "Sky View", "Rooftop Terrace", "Home Automation", "Wine Cellar"],
        images: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
        ],
        status: "available",
        featured: true,
    },
    {
        type: "sale",
        propertyType: "townhouse",
        title: "3BR Townhouse in Jumeirah Village Circle",
        description: "Affordable family townhouse in JVC. Spacious layout with private garden and covered parking. Community offers schools, supermarkets, and parks within walking distance.",
        location: "JVC",
        building: "Nakheel Townhouses",
        price: "AED 1,800,000",
        bedrooms: 3,
        bathrooms: 4,
        area: "2,100 sq ft",
        furnishing: "Unfurnished",
        completionYear: 2019,
        amenities: ["Garden", "Parking", "Community Pool", "Playground"],
        features: ["Private Garden", "Storage Room", "Maid's Room"],
        images: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        status: "available",
        featured: false,
    },
    {
        type: "rental",
        propertyType: "office",
        title: "Premium Office Space in DIFC",
        description: "Class A office space in the heart of Dubai's financial district. Fully fitted with modern meeting rooms, reception area, and pantry. Close to DIFC Gate and Metro.",
        location: "DIFC",
        building: "Index Tower",
        price: "AED 350,000",
        bedrooms: 0,
        bathrooms: 2,
        area: "2,500 sq ft",
        furnishing: "Furnished",
        completionYear: 2010,
        amenities: ["Parking", "Security", "Meeting Rooms", "Concierge"],
        features: ["Fitted Office", "Reception", "Pantry", "DIFC View"],
        images: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        ],
        status: "available",
        featured: false,
    },
];
function parseNumericPrice(price) {
    const cleaned = price.replace(/[^0-9]/g, "");
    return parseInt(cleaned) || 0;
}
function parseNumericArea(area) {
    const cleaned = area.replace(/[^0-9]/g, "");
    return parseInt(cleaned) || 0;
}
async function main() {
    console.log("Seeding properties...");
    // Get all verified simsars
    const simsars = await prisma.simsar.findMany({
        where: { verificationStatus: "VERIFIED" },
        take: 10,
    });
    if (simsars.length === 0) {
        console.log("No verified simsars found. Creating sample properties for all simsars...");
        const allSimsars = await prisma.simsar.findMany({ take: 10 });
        if (allSimsars.length === 0) {
            console.log("No simsars found at all. Please create broker accounts first.");
            return;
        }
        simsars.push(...allSimsars);
    }
    // Check existing properties count
    const existingCount = await prisma.portfolioItem.count();
    console.log(`Found ${existingCount} existing properties.`);
    // Distribute properties among simsars
    for (let i = 0; i < SAMPLE_PROPERTIES.length; i++) {
        const property = SAMPLE_PROPERTIES[i];
        const simsar = simsars[i % simsars.length];
        const referenceNumber = `MS-${String(existingCount + i + 1).padStart(5, "0")}`;
        const priceNumeric = parseNumericPrice(property.price);
        const areaNumeric = parseNumericArea(property.area);
        try {
            const created = await prisma.portfolioItem.create({
                data: {
                    simsarId: simsar.id,
                    referenceNumber,
                    type: property.type,
                    propertyType: property.propertyType,
                    title: property.title,
                    description: property.description,
                    location: property.location,
                    building: property.building || null,
                    address: property.address || null,
                    price: property.price,
                    priceNumeric,
                    paymentPlan: property.paymentPlan || null,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    area: property.area,
                    areaNumeric,
                    furnishing: property.furnishing || null,
                    completionYear: property.completionYear || null,
                    permitNumber: property.permitNumber || null,
                    amenities: JSON.stringify(property.amenities || []),
                    features: JSON.stringify(property.features || []),
                    images: JSON.stringify(property.images),
                    status: property.status,
                    featured: property.featured || false,
                },
            });
            console.log(`Created: ${created.title} (${created.referenceNumber}) -> ${simsar.name}`);
        }
        catch (error) {
            if (error.code === "P2002") {
                console.log(`Skipping duplicate: ${property.title}`);
            }
            else {
                throw error;
            }
        }
    }
    console.log("Done seeding properties!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-properties.js.map