import { NextResponse } from "next/server";
import { PrismaClient, type Airdrop } from "@prisma/client";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";

const prisma = new PrismaClient();

// Create new airdrop
export async function POST(request: Request) {
  // TODO handle auth in middleware.ts
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      contractAddress,
      templateName,
      owner,
      tokenAddress,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      tokenLogo,
    } = body;

    const airdrop = await prisma.airdrop.create({
      data: {
        contractAddress: contractAddress ? Buffer.from(contractAddress, "hex") : null,
        templateName: Buffer.from(templateName, "hex"),
        owner: Buffer.from(owner, "hex"),
        tokenAddress: Buffer.from(tokenAddress, "hex"),
        tokenName,
        tokenSymbol,
        tokenDecimals,
        tokenLogo,
      } as Airdrop,
    });

    return NextResponse.json(airdrop, { status: 201 });
  } catch (error) {
    console.error("Error creating airdrop:", error);
    return NextResponse.json({ error: "Failed to create airdrop" }, { status: 500 });
  }
}

// Get all airdrops
export async function GET() {
  try {
    const airdrops = await prisma.airdrop.findMany();
    const formattedAirdrops = airdrops.map((airdrop) => ({
      ...airdrop,
      contractAddress: airdrop.contractAddress ? airdrop.contractAddress.toString("hex") : null,
      templateName: airdrop.templateName.toString("hex"),
      owner: airdrop.owner.toString("hex"),
      tokenAddress: airdrop.tokenAddress.toString("hex"),
    }));

    return NextResponse.json(formattedAirdrops);
  } catch (error) {
    console.error("Error fetching airdrops:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops" }, { status: 500 });
  }
}
