-- AlterTable
ALTER TABLE "Company" ADD COLUMN "adress" TEXT;
ALTER TABLE "Company" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Company" ADD COLUMN "latitude" REAL;
ALTER TABLE "Company" ADD COLUMN "longitude" REAL;

-- AlterTable
ALTER TABLE "CompanyInquiry" ADD COLUMN "address" TEXT;

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "organizerName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "city" TEXT NOT NULL,
    "locationName" TEXT,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "searchTerms" TEXT NOT NULL DEFAULT '[]',
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "website" TEXT,
    "ticketUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "highlightUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EventInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventTitle" TEXT NOT NULL,
    "organizerName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT NOT NULL,
    "desiredPlan" TEXT NOT NULL DEFAULT 'highlight',
    "category" TEXT NOT NULL DEFAULT 'Sonstiges',
    "locationName" TEXT,
    "address" TEXT,
    "eventDate" DATETIME,
    "description" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
