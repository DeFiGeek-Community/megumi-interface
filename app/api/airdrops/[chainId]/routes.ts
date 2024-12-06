import { NextResponse } from "next/server";
import { getContract, GetContractReturnType, type PublicClient } from "viem";
import { PrismaClient, type Airdrop } from "@prisma/client";
import { getServerSession, Session } from "next-auth";
import { getViemProvider } from "@/app/lib/api";
import { authOptions } from "../../auth/authOptions";
import { isSupportedChain } from "@/app/lib/chain";
import MerkleAirdropBase from "@/app/lib/constants/abis/MerkleAirdropBase.json";

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
  owner?: string;
  tokenAddress?: string;
  tokenLogo?: string;
};
// <--

const prisma = new PrismaClient();

const validateAirdropData = async (
  session: Session,
  airdrop: AirdropFormType,
  airdropContract: AirdropContractType | undefined,
): Promise<{ isValid: boolean; errors: AirdropValidationType }> => {
  const errors: AirdropValidationType = {};
  // TODO
  // templateNameの存在チェック

  // contractAddressある場合は存在、ownerチェック
  // 基本的にCreate時はcontractAddressは無い想定
  if (airdropContract) {
    try {
      const contractOwner = await airdropContract.read.owner();
      if (
        contractOwner !== session.user.address
        // TODO Take Safe into account
        // ↓ From Yamawake
        // (!session.user.siwe.resources && contractOwner === session.siwe.address) ||
        // (session.siwe.resources && contractOwner === session.siwe.resources[0])
      ) {
        errors["owner"] = "You are not the owner of this contract";
      }
    } catch (error: unknown) {
      errors["owner"] = error instanceof Error ? `${error.name} ${error.message}` : `${error}`;
      console.log(`[ERROR] ${errors["owner"]}`);
    }
  }
  // TODO tokenAddressある場合は存在チェック
  // TODO tokenLogoのURL存在チェック
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

    const airdropContract = contractAddress
      ? getContract({
          address: contractAddress,
          abi: MerkleAirdropBase,
          client: provider,
        })
      : undefined;

    const { isValid, errors } = await validateAirdropData(
      session,
      {
        contractAddress,
        templateName,
        owner,
        tokenAddress,
        tokenLogo,
      },
      airdropContract,
    );

    if (!isValid) {
      return NextResponse.json({ error: errors }, { status: 422 });
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
