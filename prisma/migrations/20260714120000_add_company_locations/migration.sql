ALTER TABLE "Company" ADD COLUMN "parentCompanyId" TEXT;
ALTER TABLE "Company" ADD COLUMN "locationName" TEXT;

CREATE INDEX "Company_parentCompanyId_idx" ON "Company"("parentCompanyId");

ALTER TABLE "Company"
ADD CONSTRAINT "Company_parentCompanyId_fkey"
FOREIGN KEY ("parentCompanyId")
REFERENCES "Company"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;