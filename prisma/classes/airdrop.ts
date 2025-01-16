import { prisma, type Airdrop } from "@/prisma";

export class MAirdrop implements Airdrop {
  id!: string;
  chainId!: number;
  title!: string;
  contractAddress!: Uint8Array | null;
  templateName!: Uint8Array;
  owner!: Uint8Array;
  tokenAddress!: Uint8Array;
  tokenName!: string;
  tokenSymbol!: string;
  tokenDecimals!: number;
  tokenLogo!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Airdrop) {
    Object.assign(this, data);
  }

  getFormattedCreatedAt(): string {
    return this.createdAt.toISOString();
  }

  isTokenLogoAvailable(): boolean {
    return this.tokenLogo !== null && this.tokenLogo !== "";
  }

  static async getAirdropById(airdropId: string): Promise<Airdrop | null> {
    const airdrop = await prisma.airdrop.findUnique({
      where: { id: airdropId },
    });

    return airdrop ? new MAirdrop(airdrop) : null;
  }
}
