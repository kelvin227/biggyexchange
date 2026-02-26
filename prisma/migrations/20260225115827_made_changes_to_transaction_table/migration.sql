-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "PaymentReference" DROP NOT NULL,
ALTER COLUMN "txHash" DROP NOT NULL;
