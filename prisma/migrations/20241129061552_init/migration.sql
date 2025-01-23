-- CreateTable
CREATE TABLE "Airdrop" (
    "id" TEXT NOT NULL,
    "contractAddress" BYTEA,
    "templateName" BYTEA NOT NULL,
    "owner" BYTEA NOT NULL,
    "tokenAddress" BYTEA NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenDecimals" INTEGER NOT NULL,
    "tokenLogo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Airdrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claimer" (
    "id" TEXT NOT NULL,
    "address" BYTEA NOT NULL,

    CONSTRAINT "Claimer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirdropClaimerMap" (
    "id" TEXT NOT NULL,
    "airdropId" TEXT NOT NULL,
    "claimerId" TEXT NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "proofs" BYTEA[],
    "index" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,

    CONSTRAINT "AirdropClaimerMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Airdrop_contractAddress_key" ON "Airdrop"("contractAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Claimer_address_key" ON "Claimer"("address");

-- CreateIndex
CREATE INDEX "AirdropClaimerMap_airdropId_idx" ON "AirdropClaimerMap"("airdropId");

-- CreateIndex
CREATE INDEX "AirdropClaimerMap_claimerId_idx" ON "AirdropClaimerMap"("claimerId");

-- AddForeignKey
ALTER TABLE "AirdropClaimerMap" ADD CONSTRAINT "AirdropClaimerMap_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "Airdrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirdropClaimerMap" ADD CONSTRAINT "AirdropClaimerMap_claimerId_fkey" FOREIGN KEY ("claimerId") REFERENCES "Claimer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
