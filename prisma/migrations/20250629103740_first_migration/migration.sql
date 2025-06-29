-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" BOOLEAN,
    "emailVerifiedAt" TIMESTAMP(3),
    "kycverified" BOOLEAN DEFAULT false,
    "kycverifiedAt" TIMESTAMP(3),
    "image" TEXT DEFAULT 'default.png',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "phoneNo" TEXT,
    "name" TEXT,
    "userName" TEXT,
    "roles" TEXT DEFAULT 'user',
    "isBlocked" BOOLEAN DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kyc" (
    "id" TEXT NOT NULL,
    "FullName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "IDNO" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Reviewed_at" TIMESTAMP(3),
    "documentURL1" TEXT NOT NULL,
    "documentURL2" TEXT NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userWallet" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT,
    "walletAddress2" TEXT,
    "walletAddress3" TEXT,
    "walletAddress4" TEXT,
    "walletAddress5" TEXT,
    "walletAddress6" TEXT,
    "walletAddress7" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "userWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "mnemonic" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encrypted_key" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "coin" TEXT NOT NULL,
    "type" TEXT,
    "price" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "minQty" INTEGER NOT NULL,
    "maxQty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adsTransaction" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "coin" TEXT NOT NULL,
    "receipt" TEXT NOT NULL,
    "type" TEXT,
    "price" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT,
    "merchantID" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "merchantconfirm" TEXT NOT NULL DEFAULT 'pending',
    "customerconfirm" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "adsTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traderequest" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "coin" TEXT NOT NULL,
    "type" TEXT,
    "price" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "walletAddress" TEXT,
    "merchantName" TEXT NOT NULL,

    CONSTRAINT "traderequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute" (
    "id" TEXT NOT NULL,
    "tradeid" TEXT NOT NULL,
    "orderid" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "useremail" TEXT NOT NULL,
    "dispute_reason" TEXT NOT NULL,
    "admin_notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tradeprocess" (
    "id" TEXT NOT NULL,
    "tradeid" TEXT NOT NULL,
    "orderid" TEXT NOT NULL,
    "confirmseen" TEXT NOT NULL,
    "sendusdt" TEXT NOT NULL,
    "checkusdtsent" TEXT NOT NULL,
    "sendfeeusdt" TEXT NOT NULL,
    "checkusdtfeesent" TEXT NOT NULL,

    CONSTRAINT "tradeprocess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_email_key" ON "VerificationToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_userid_key" ON "Kyc"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_walletAddress_key" ON "userWallet"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_walletAddress2_key" ON "userWallet"("walletAddress2");

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_walletAddress3_key" ON "userWallet"("walletAddress3");

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_walletAddress4_key" ON "userWallet"("walletAddress4");

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_walletAddress5_key" ON "userWallet"("walletAddress5");

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_walletAddress6_key" ON "userWallet"("walletAddress6");

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_walletAddress7_key" ON "userWallet"("walletAddress7");

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_userid_key" ON "userWallet"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "adsTransaction_orderId_key" ON "adsTransaction"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "tradeprocess_tradeid_key" ON "tradeprocess"("tradeid");

-- CreateIndex
CREATE UNIQUE INDEX "tradeprocess_orderid_key" ON "tradeprocess"("orderid");

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userWallet" ADD CONSTRAINT "userWallet_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adsTransaction" ADD CONSTRAINT "adsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traderequest" ADD CONSTRAINT "traderequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute" ADD CONSTRAINT "dispute_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute" ADD CONSTRAINT "dispute_tradeid_fkey" FOREIGN KEY ("tradeid") REFERENCES "traderequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute" ADD CONSTRAINT "dispute_orderid_fkey" FOREIGN KEY ("orderid") REFERENCES "adsTransaction"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tradeprocess" ADD CONSTRAINT "tradeprocess_orderid_fkey" FOREIGN KEY ("orderid") REFERENCES "adsTransaction"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
