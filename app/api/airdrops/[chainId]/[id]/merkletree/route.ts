import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GetCodeReturnType, type PublicClient } from "viem";
import { prisma } from "@/prisma";
import { authOptions } from "@/app/api/auth/authOptions";
import { getErrorMessage } from "@/app/utils/shared";
import { getViemProvider, requireOwner, respondError } from "@/app/utils/apiHelper";
import { s3Client, GetObjectCommand, GetObjectCommandOutput } from "@/app/lib/aws";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import { AirdropNotFoundError } from "@/app/types/errors";
import { MerkleTreeData } from "@/app/types/airdrop";
import * as AirdropUtils from "@/app/utils/airdrop";
import { uuidToHex } from "@/app/utils/shared";

// Get an airdrop by ID
export async function GET(req: Request, { params }: { params: { chainId: string; id: string } }) {
  // Get merkletree file
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // TODO getMerkletreeKey(chainId, uuid)
    Key: `${params.chainId}/${params.id}-merkletree.json`,
  });

  let response: GetObjectCommandOutput | null;
  try {
    response = await s3Client.send(command);
  } catch (e: unknown) {
    const error = getErrorMessage(e);
    return NextResponse.json({ error }, { status: 422 });
  }

  try {
    const bodyStream = response.Body;
    const chunks: Uint8Array[] = [];
    for await (const chunk of bodyStream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="merkletree.json"',
      },
    });
  } catch (e: unknown) {
    const error = getErrorMessage(e);
    return NextResponse.json({ error }, { status: 422 });
  }
}
