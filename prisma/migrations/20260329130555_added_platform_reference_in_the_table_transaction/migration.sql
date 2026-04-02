/*
  Warnings:

  - A unique constraint covering the columns `[PlatformReference]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "PlatformReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_PlatformReference_key" ON "Transaction"("PlatformReference");
