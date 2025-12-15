-- AlterTable
ALTER TABLE "Agency" ADD COLUMN "officeAddress" TEXT;
ALTER TABLE "Agency" ADD COLUMN "officePhotosUrl" TEXT;
ALTER TABLE "Agency" ADD COLUMN "reraLicenseUrl" TEXT;
ALTER TABLE "Agency" ADD COLUMN "tradeLicenseUrl" TEXT;
ALTER TABLE "Agency" ADD COLUMN "verificationNotes" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Simsar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "companyName" TEXT,
    "previousCompanyName" TEXT,
    "bio" TEXT,
    "reraId" TEXT,
    "reraCertificateUrl" TEXT,
    "licenseNumber" TEXT,
    "licenseDocUrl" TEXT,
    "emiratesId" TEXT,
    "emiratesIdUrl" TEXT,
    "experienceYears" INTEGER,
    "specialties" TEXT NOT NULL DEFAULT '[]',
    "areasOfOperation" TEXT NOT NULL DEFAULT '[]',
    "languages" TEXT NOT NULL DEFAULT '[]',
    "whatsappNumber" TEXT,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "profileCompletenessScore" INTEGER NOT NULL DEFAULT 0,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationScore" REAL DEFAULT 0,
    "verificationNotes" TEXT,
    "tierHint" TEXT,
    "simsarType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "agencyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Simsar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Simsar_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Simsar" ("agencyId", "bio", "companyName", "createdAt", "experienceYears", "id", "languages", "licenseDocUrl", "licenseNumber", "name", "photoUrl", "previousCompanyName", "profileCompletenessScore", "reraId", "simsarType", "tierHint", "updatedAt", "userId", "verificationScore", "verificationStatus", "whatsappNumber") SELECT "agencyId", "bio", "companyName", "createdAt", "experienceYears", "id", "languages", "licenseDocUrl", "licenseNumber", "name", "photoUrl", "previousCompanyName", "profileCompletenessScore", "reraId", "simsarType", "tierHint", "updatedAt", "userId", "verificationScore", "verificationStatus", "whatsappNumber" FROM "Simsar";
DROP TABLE "Simsar";
ALTER TABLE "new_Simsar" RENAME TO "Simsar";
CREATE UNIQUE INDEX "Simsar_userId_key" ON "Simsar"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
