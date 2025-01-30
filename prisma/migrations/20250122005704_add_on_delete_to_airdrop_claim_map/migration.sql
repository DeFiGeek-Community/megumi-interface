-- DropForeignKey
ALTER TABLE "AirdropClaimerMap" DROP CONSTRAINT "AirdropClaimerMap_airdropId_fkey";

-- DropForeignKey
ALTER TABLE "AirdropClaimerMap" DROP CONSTRAINT "AirdropClaimerMap_claimerId_fkey";

-- AddForeignKey
ALTER TABLE "AirdropClaimerMap" ADD CONSTRAINT "AirdropClaimerMap_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "Airdrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirdropClaimerMap" ADD CONSTRAINT "AirdropClaimerMap_claimerId_fkey" FOREIGN KEY ("claimerId") REFERENCES "Claimer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
