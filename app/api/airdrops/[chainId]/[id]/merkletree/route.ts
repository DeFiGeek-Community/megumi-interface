import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/app/utils/shared";
import { s3Client, GetObjectCommand, GetObjectCommandOutput } from "@/app/lib/aws";
import { generateMerkleTreeFromSnapshot } from "@/app/utils/merkleTree/snapshot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { AirdropNotFoundError } from "@/app/types/errors";
import { requireOwner, respondError } from "@/app/utils/apiHelper";
import * as AirdropUtils from "@/app/utils/airdrop";

// Get an merkle tree by ID
export async function GET(req: Request, { params }: { params: { chainId: string; id: string } }) {
  // Get merkletree file
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: AirdropUtils.getMerkleTreeKey(params.chainId, params.id),
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

// Generate a merkle tree
export async function POST(
  req: NextRequest,
  { params }: { params: { chainId: string; id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const airdrop = await AirdropUtils.getAirdropById(params.id);
  if (!airdrop) {
    return respondError(new AirdropNotFoundError());
  }
  const { error } = await requireOwner(airdrop, session.user.address);

  if (error) {
    return respondError(error);
  }

  const body = await req.json();
  const { snapshotTokenAddress, untilBlock, totalAirdropAmount, ignoreAddresses, minAmount } = body;

  const merkleTree = await generateMerkleTreeFromSnapshot(
    parseInt(params.chainId),
    snapshotTokenAddress,
    parseInt(untilBlock),
    BigInt(totalAirdropAmount),
    ignoreAddresses,
    minAmount ? BigInt(minAmount) : BigInt(0),
  );

  return NextResponse.json(merkleTree);
}
