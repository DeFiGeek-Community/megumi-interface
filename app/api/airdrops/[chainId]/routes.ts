import { NextResponse, NextRequest } from "next/server";
import { erc20Abi, getContract, type PublicClient } from "viem";
import type { Airdrop } from "@prisma/client";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { getViemProvider } from "@/app/lib/api";
import { authOptions } from "../../auth/authOptions";
import { isSupportedChain } from "@/app/lib/chain";
import {
  convertAirdropWithUint8ArrayToHexString,
  getTokenInfo,
  hexStringToUint8Array,
  validateAirdropData,
} from "@/app/lib/utils";

// Create new airdrop
export async function POST(request: NextRequest, { params }: { params: { chainId: string } }) {
  const requestedChainId = parseInt(params.chainId);
  if (!isSupportedChain(requestedChainId)) {
    return NextResponse.json({ error: "URL Not Found" }, { status: 404 });
  }

  // TODO handle auth in middleware.ts
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { chainId, title, contractAddress, templateName, owner, tokenAddress, tokenLogo } = body;

    const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;

    const { isValid, errors } = await validateAirdropData(
      session,
      {
        chainId,
        title,
        contractAddress,
        templateName,
        owner,
        tokenAddress,
        tokenLogo,
      },
      provider,
    );

    if (!isValid) {
      return NextResponse.json({ error: errors }, { status: 422 });
    }

    // Fetch token information from the contract address
    let tokenName;
    let tokenSymbol;
    let tokenDecimals;

    try {
      const token = await getTokenInfo(tokenAddress, provider);
      tokenName = token.tokenName;
      tokenSymbol = token.tokenSymbol;
      tokenDecimals = token.tokenDecimals;
    } catch (error: unknown) {
      console.error(error);
      return NextResponse.json({ error: String(error) }, { status: 422 });
    }

    const airdrop = await prisma.airdrop.create({
      data: {
        chainId,
        title,
        contractAddress: contractAddress ? hexStringToUint8Array(contractAddress) : null,
        templateName: hexStringToUint8Array(templateName),
        owner: hexStringToUint8Array(owner),
        tokenAddress: hexStringToUint8Array(tokenAddress),
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
export async function GET(req: NextRequest, { params }: { params: { chainId: string } }) {
  try {
    const defaultPage = 1;
    const defaultLimit = 10;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || String(defaultPage)) || defaultPage;
    const limit = parseInt(searchParams.get("limit") || String(defaultLimit)) || defaultLimit;
    const skip = (page - 1) * limit;

    const totalCount = await prisma.airdrop.count();
    const airdrops = await prisma.airdrop.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    const formattedAirdrops = airdrops.map((airdrop: Airdrop) =>
      convertAirdropWithUint8ArrayToHexString(airdrop),
    );

    return NextResponse.json({
      airdrops: formattedAirdrops,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching airdrops:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops" }, { status: 500 });
  }
}
