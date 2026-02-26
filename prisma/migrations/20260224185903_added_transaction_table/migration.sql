-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nairaAmount" TEXT NOT NULL,
    "cryptoAmount" TEXT NOT NULL,
    "cryptoType" TEXT NOT NULL,
    "PaymentReference" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_PaymentReference_key" ON "Transaction"("PaymentReference");
