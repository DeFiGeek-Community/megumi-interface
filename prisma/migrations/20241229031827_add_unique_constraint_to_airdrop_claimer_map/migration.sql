/*
  Warnings:

  - A unique constraint covering the columns `[airdropId,claimerId]` on the table `AirdropClaimerMap` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AirdropClaimerMap_airdropId_claimerId_key" ON "AirdropClaimerMap"("airdropId", "claimerId");
