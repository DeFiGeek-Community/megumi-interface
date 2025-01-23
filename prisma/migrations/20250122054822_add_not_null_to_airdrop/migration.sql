/*
  Warnings:

  - Made the column `tokenAddress` on table `Airdrop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenName` on table `Airdrop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenSymbol` on table `Airdrop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenDecimals` on table `Airdrop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Airdrop" ALTER COLUMN "tokenAddress" SET NOT NULL,
ALTER COLUMN "tokenName" SET NOT NULL,
ALTER COLUMN "tokenSymbol" SET NOT NULL,
ALTER COLUMN "tokenDecimals" SET NOT NULL;
