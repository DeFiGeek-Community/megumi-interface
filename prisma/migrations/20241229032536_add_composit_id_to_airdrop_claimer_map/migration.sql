/*
  Warnings:

  - The primary key for the `AirdropClaimerMap` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AirdropClaimerMap` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AirdropClaimerMap_airdropId_claimerId_key";

-- DropIndex
DROP INDEX "AirdropClaimerMap_airdropId_idx";

-- DropIndex
DROP INDEX "AirdropClaimerMap_claimerId_idx";

-- AlterTable
ALTER TABLE "AirdropClaimerMap" DROP CONSTRAINT "AirdropClaimerMap_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "AirdropClaimerMap_pkey" PRIMARY KEY ("airdropId", "claimerId");
