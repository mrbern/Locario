-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "accessToken" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'pilot',
    "mainCategory" TEXT NOT NULL DEFAULT 'Allgemein',
    "subCategory" TEXT NOT NULL DEFAULT 'Allgemein',
    "subCategories" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "adress" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "searchTerms" TEXT NOT NULL DEFAULT '[]',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "message" TEXT NOT NULL,
    "sourceQuery" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInquiry" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "organizerName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "city" TEXT NOT NULL,
    "locationName" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "searchTerms" TEXT NOT NULL DEFAULT '[]',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "website" TEXT,
    "ticketUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "highlightUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventInquiry" (
    "id" TEXT NOT NULL,
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
    "eventDate" TIMESTAMP(3),
    "description" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_accessToken_key" ON "Company"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Advertisement_companyId_key" ON "Advertisement"("companyId");

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
