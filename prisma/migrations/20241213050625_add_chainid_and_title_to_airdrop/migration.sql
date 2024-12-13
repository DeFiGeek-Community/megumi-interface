/*
  Warnings:

  - A unique constraint covering the columns `[contractAddress,chainId]` on the table `Airdrop` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Airdrop_contractAddress_key";

-- AlterTable
ALTER TABLE "Airdrop" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Airdrop_contractAddress_chainId_key" ON "Airdrop"("contractAddress", "chainId");
