/*
  Warnings:

  - You are about to drop the `userWallet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "userWallet" DROP CONSTRAINT "userWallet_userid_fkey";

-- DropTable
DROP TABLE "userWallet";

-- CreateTable
CREATE TABLE "accountDetails" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "BankName" TEXT NOT NULL,
    "accountNumber" TEXT,
    "bankCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "accountDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accountDetails_accountNumber_key" ON "accountDetails"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "accountDetails_bankCode_key" ON "accountDetails"("bankCode");

-- CreateIndex
CREATE UNIQUE INDEX "accountDetails_userid_key" ON "accountDetails"("userid");

-- AddForeignKey
ALTER TABLE "accountDetails" ADD CONSTRAINT "accountDetails_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
