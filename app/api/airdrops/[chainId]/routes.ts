import { NextResponse } from "next/server";
import { erc20Abi, getContract, GetContractReturnType, type PublicClient } from "viem";
import { PrismaClient, type Airdrop } from "@prisma/client";
import { getServerSession, Session } from "next-auth";
import { getViemProvider } from "@/app/lib/api";
import { authOptions } from "../../auth/authOptions";
import { isSupportedChain } from "@/app/lib/chain";
import MerkleAirdropBase from "@/app/lib/constants/abis/MerkleAirdropBase.json";
import { isSupportedTemplate, uint8ObjectToHexString } from "@/app/lib/utils";

// Type definition -->
type AirdropFormType = {
  contractAddress: `0x${string}`;
  templateName: `0x${string}`;
  owner: `0x${string}`;
  tokenAddress: `0x${string}`;
  tokenLogo: string;
};
type AirdropContractType = GetContractReturnType<typeof MerkleAirdropBase, PublicClient, any>;
type AirdropValidationType = {
  templateName?: string;
  contractAddress?: string;
  tokenAddress?: string;
  tokenLogo?: string;
};
// <--

const prisma = new PrismaClient();

const validateAirdropData = async (
  session: Session,
  airdrop: AirdropFormType,
  provider: PublicClient,
): Promise<{ isValid: boolean; errors: AirdropValidationType }> => {
  const errors: AirdropValidationType = {};
  // Validates templateName
  if (!isSupportedTemplate(airdrop.templateName)) {
    errors["templateName"] = "Invalid templateName";
  }

  // Validates owner if contractAddress is set
  // Basically contractAddress is supposed not to be set on creation
  if (airdrop.contractAddress) {
    try {
      const airdropContract = getContract({
        address: airdrop.contractAddress,
        abi: MerkleAirdropBase,
        client: provider,
      });
      const contractOwner = await airdropContract.read.owner();
      if (
        contractOwner !== session.user.address
        // TODO Take Safe into account
        // ↓ From Yamawake
        // (!session.user.siwe.resources && contractOwner === session.siwe.address) ||
        // (session.siwe.resources && contractOwner === session.siwe.resources[0])
      ) {
        errors["contractAddress"] = "You are not the owner of this contract";
      }
    } catch (error: unknown) {
      errors["contractAddress"] =
        error instanceof Error ? `${error.name} ${error.message}` : `${error}`;
      console.log(`[ERROR] ${errors["contractAddress"]}`);
    }
  }
  // Validates token
  if (!airdrop.tokenAddress) {
    errors["tokenAddress"] = "Token address is required";
  }

  // Validate Token logo URL
  if (airdrop.tokenLogo) {
    try {
      new URL(airdrop.tokenLogo);
    } catch (e: unknown) {
      errors["tokenLogo"] = e instanceof Error ? e.message : "Invalid URL";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// Create new airdrop
export async function POST(request: Request, { params }: { params: { chainId: string } }) {
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
    const { contractAddress, templateName, owner, tokenAddress, tokenLogo } = body;

    const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;

    const { isValid, errors } = await validateAirdropData(
      session,
      {
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
      const token = getContract({
        address: tokenAddress,
        abi: erc20Abi,
        client: provider,
      });
      tokenName = await token.read.name();
      tokenSymbol = await token.read.symbol();
      tokenDecimals = await token.read.decimals();
    } catch (error: unknown) {
      console.error(error);
      return NextResponse.json({ error: String(error) }, { status: 422 });
    }

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
    // TODO paging
    const airdrops = await prisma.airdrop.findMany();
    const formattedAirdrops = airdrops.map((airdrop: Airdrop) => ({
      ...airdrop,
      contractAddress: airdrop.contractAddress
        ? uint8ObjectToHexString(airdrop.contractAddress)
        : null,
      templateName: uint8ObjectToHexString(airdrop.templateName),
      owner: uint8ObjectToHexString(airdrop.owner),
      tokenAddress: uint8ObjectToHexString(airdrop.tokenAddress),
    }));

    return NextResponse.json(formattedAirdrops);
  } catch (error) {
    console.error("Error fetching airdrops:", error);
    return NextResponse.json({ error: "Failed to fetch airdrops" }, { status: 500 });
  }
}
