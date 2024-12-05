import { NextResponse } from "next/server";
import { PrismaClient, type Airdrop } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";

const prisma = new PrismaClient();

type AirdropFormType = {
  contractAddress: `0x${string}`;
  templateName: `0x${string}`;
  owner: `0x${string}`;
  tokenAddress: `0x${string}`;
  tokenLogo: string;
};

const validateAirdropData = (airdrop: AirdropFormType) => {
  // TODO
  // templateNameの存在チェック
  // contractAddressある場合は存在、ownerチェック
  // tokenAddressある場合は存在チェック
  // tokenLogoのURL存在チェック
  return true;
};

// Create new airdrop
export async function POST(request: Request) {
  // TODO handle auth in middleware.ts
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contractAddress, templateName, owner, tokenAddress, tokenLogo } = body;

    const isValid = validateAirdropData({
      contractAddress,
      templateName,
      owner,
      tokenAddress,
      tokenLogo,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Unprocessable Entity" }, { status: 422 });
    }

    // TODO
    // tokenName, tokenSymbol, tokenDecimalsはtokenAddressから取得
    const tokenName = "Test Token";
    const tokenSymbol = "TTK";
    const tokenDecimals = 18;

    const airdrop = await prisma.airdrop.create({
      data: {
        contractAddress: contractAddress
          ? Uint8Array.from(Buffer.from(contractAddress.slice(2), "hex"))
          : null,
        templateName: Uint8Array.from(Buffer.from(templateName.slice(2), "hex")),
        owner: Uint8Array.from(Buffer.from(owner.slice(2), "hex")),
        tokenAddress: Uint8Array.from(Buffer.from(tokenAddress.slice(2), "hex")),
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
    const formattedAirdrops = airdrops.map((airdrop: Airdrop) => ({
      ...airdrop,
      contractAddress: airdrop.contractAddress,
      templateName: airdrop.templateName,
      owner: airdrop.owner,
      tokenAddress: airdrop.tokenAddress,
    }));

    return NextResponse.json(formattedAirdrops);
  } catch (error) {
    console.error("Error fetching airdrops:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops" }, { status: 500 });
  }
}
