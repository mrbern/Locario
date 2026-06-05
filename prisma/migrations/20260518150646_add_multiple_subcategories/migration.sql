-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mainCategory" TEXT NOT NULL DEFAULT 'Allgemein',
    "subCategory" TEXT NOT NULL DEFAULT 'Allgemein',
    "subCategories" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "searchTerms" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("category", "city", "createdAt", "description", "email", "id", "mainCategory", "name", "phone", "searchTerms", "subCategory", "tags", "updatedAt", "website") SELECT "category", "city", "createdAt", "description", "email", "id", "mainCategory", "name", "phone", "searchTerms", "subCategory", "tags", "updatedAt", "website" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
