/*
  Warnings:

  - A unique constraint covering the columns `[accessToken]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN "accessToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_accessToken_key" ON "Company"("accessToken");
