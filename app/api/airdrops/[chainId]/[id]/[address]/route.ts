import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { hexStringToUint8Array, respondError } from "@/app/utils/apiHelper";
import { getViemProvider } from "@/app/utils/shared";
import * as AirdropUtils from "@/app/utils/airdrop";
import { getContract, PublicClient } from "viem";
import { TemplateNames } from "@/app/lib/constants/templates";

// Get airdrop claimer map
export async function GET(
  req: Request,
  { params }: { params: { chainId: string; id: string; address: `0x${string}` } },
) {
  try {
    const claimParams = await prisma.airdropClaimerMap.findFirst({
      where: {
        airdropId: params.id,
        claimer: {
          address: hexStringToUint8Array(params.address),
        },
      },
      include: {
        airdrop: true,
        claimer: true,
      },
    });
    if (!claimParams) {
      return NextResponse.json({ error: "Airdrop not found" }, { status: 404 });
    }
    const formattedClaimParams = AirdropUtils.airdropClaimerMaptoHexString(claimParams);
    return NextResponse.json(formattedClaimParams);
  } catch (error: unknown) {
    return respondError(error);
  }
}

// Update claim status
export async function PATCH(
  req: Request,
  { params }: { params: { chainId: string; id: string; address: `0x${string}` } },
) {
  try {
    const airdropClaimerMap = await prisma.airdropClaimerMap.findFirst({
      where: {
        airdropId: params.id,
        claimer: {
          address: hexStringToUint8Array(params.address),
        },
      },
      include: {
        airdrop: true,
        claimer: true,
      },
    });

    if (!airdropClaimerMap) {
      return NextResponse.json({ error: "AirdropClaimerMap not found" }, { status: 404 });
    }
    const formattedAirdrop = AirdropUtils.toHexString(airdropClaimerMap.airdrop);
    const formattedClaimParams = AirdropUtils.airdropClaimerMaptoHexString(airdropClaimerMap);
    if (!formattedAirdrop.contractAddress) {
      return NextResponse.json({ error: "Contract is not registered" }, { status: 422 });
    }
    if (formattedClaimParams.isClaimed) {
      return NextResponse.json({ error: "Already claimed" }, { status: 422 });
    }

    const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;

    const abi = await AirdropUtils.getABIFromAirdropAddress(
      formattedAirdrop.contractAddress,
      provider,
    );

    if (!abi) {
      return NextResponse.json({ error: "ABI not found. Invalid template type" }, { status: 422 });
    }

    const contract = getContract({
      address: formattedAirdrop.contractAddress,
      abi: abi,
      client: provider,
    });

    let isClaimed = false;
    if (formattedAirdrop.templateName === TemplateNames.Standard) {
      isClaimed = (await contract.read.isClaimed([formattedClaimParams.index])) as boolean;
    } else if (formattedAirdrop.templateName === TemplateNames.LinearVesting) {
      const claimedAmount = (await contract.read.claimedAmount([
        formattedClaimParams.index,
      ])) as bigint;
      isClaimed = claimedAmount >= BigInt(formattedClaimParams.amount);
    }

    if (isClaimed) {
      const result = await prisma.airdropClaimerMap.update({
        where: {
          airdropClaimerId: {
            airdropId: formattedClaimParams.airdropId,
            claimerId: formattedClaimParams.claimerId,
          },
        },
        data: {
          isClaimed,
        },
      });
    }

    return NextResponse.json(formattedClaimParams);
  } catch (error: unknown) {
    return respondError(error);
  }
}
