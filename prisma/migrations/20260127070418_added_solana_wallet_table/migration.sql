-- CreateTable
CREATE TABLE "solanaWallets" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "mnemonic" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encrypted_key" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "solanaWallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solanaWallets_address_key" ON "solanaWallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "solanaWallets_userId_key" ON "solanaWallets"("userId");

-- AddForeignKey
ALTER TABLE "solanaWallets" ADD CONSTRAINT "solanaWallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
