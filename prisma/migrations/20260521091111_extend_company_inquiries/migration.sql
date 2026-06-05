-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanyInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT NOT NULL,
    "desiredPlan" TEXT NOT NULL DEFAULT 'starter',
    "mainCategory" TEXT NOT NULL DEFAULT 'Allgemein',
    "subCategory" TEXT NOT NULL DEFAULT 'Allgemein',
    "subCategories" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL DEFAULT 'Allgemein',
    "description" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "searchTerms" TEXT NOT NULL DEFAULT '[]',
    "adTitle" TEXT,
    "adDescription" TEXT,
    "adCta" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CompanyInquiry" ("city", "companyName", "contactName", "createdAt", "desiredPlan", "email", "id", "message", "phone", "status", "updatedAt", "website") SELECT "city", "companyName", "contactName", "createdAt", "desiredPlan", "email", "id", "message", "phone", "status", "updatedAt", "website" FROM "CompanyInquiry";
DROP TABLE "CompanyInquiry";
ALTER TABLE "new_CompanyInquiry" RENAME TO "CompanyInquiry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
