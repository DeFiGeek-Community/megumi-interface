import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { hexStringToUint8Array, respondError } from "@/app/utils/apiHelper";
import * as AirdropUtils from "@/app/utils/airdrop";

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
