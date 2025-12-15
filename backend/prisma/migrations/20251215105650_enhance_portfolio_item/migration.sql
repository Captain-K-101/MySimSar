/*
  Warnings:

  - Added the required column `referenceNumber` to the `PortfolioItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PortfolioItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simsarId" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL DEFAULT 'apartment',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "building" TEXT,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "price" TEXT NOT NULL,
    "priceNumeric" INTEGER NOT NULL DEFAULT 0,
    "paymentPlan" TEXT,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "areaNumeric" INTEGER NOT NULL DEFAULT 0,
    "furnishing" TEXT,
    "completionYear" INTEGER,
    "permitNumber" TEXT,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "features" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL DEFAULT '[]',
    "videoUrl" TEXT,
    "floorPlanUrl" TEXT,
    "status" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortfolioItem_simsarId_fkey" FOREIGN KEY ("simsarId") REFERENCES "Simsar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PortfolioItem" ("area", "bathrooms", "bedrooms", "createdAt", "description", "id", "images", "location", "price", "simsarId", "status", "title", "type", "updatedAt") SELECT "area", "bathrooms", "bedrooms", "createdAt", "description", "id", "images", "location", "price", "simsarId", "status", "title", "type", "updatedAt" FROM "PortfolioItem";
DROP TABLE "PortfolioItem";
ALTER TABLE "new_PortfolioItem" RENAME TO "PortfolioItem";
CREATE UNIQUE INDEX "PortfolioItem_referenceNumber_key" ON "PortfolioItem"("referenceNumber");
CREATE INDEX "PortfolioItem_simsarId_idx" ON "PortfolioItem"("simsarId");
CREATE INDEX "PortfolioItem_location_propertyType_status_idx" ON "PortfolioItem"("location", "propertyType", "status");
CREATE INDEX "PortfolioItem_priceNumeric_idx" ON "PortfolioItem"("priceNumeric");
CREATE INDEX "PortfolioItem_bedrooms_idx" ON "PortfolioItem"("bedrooms");
CREATE INDEX "PortfolioItem_status_idx" ON "PortfolioItem"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
