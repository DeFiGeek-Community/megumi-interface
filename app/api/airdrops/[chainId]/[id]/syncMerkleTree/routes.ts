import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GetCodeReturnType, type PublicClient } from "viem";
import { MAirdrop, prisma } from "@/prisma";
import { authOptions } from "@/app/api/auth/authOptions";
import {
  convertAirdropWithUint8ArrayToHexString,
  getAirdropAddressFromUUID,
  getErrorMessage,
  MerkleTreeData,
  processMerkleTree,
  validateMerkleTree,
} from "@/app/lib/utils";
import { getViemProvider, requireOwner, respondError } from "@/app/utils/apiHelper";
import { s3Client, GetObjectCommand, GetObjectCommandOutput } from "@/app/lib/aws";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import { AirdropNotFoundError } from "@/app/types/errors";

// TODO
// 1. Check if contrcat is deployed
// 2. If deployed, get merkletree file
// 3. Validate merkletree file
// 4. Sync merkletree file
export async function POST(req: Request, { params }: { params: { chainId: string; id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const airdrop = await MAirdrop.getAirdropById(params.id);
  if (!airdrop) {
    return respondError(new AirdropNotFoundError());
  }
  const { error } = await requireOwner(airdrop, session.user.address);

  if (error) {
    return respondError(error);
  }

  const formattedAirdrop = convertAirdropWithUint8ArrayToHexString(airdrop);

  // Check if contract is already registered
  let contractAddress =
    formattedAirdrop.contractAddress ||
    getAirdropAddressFromUUID({
      templateAddress: CONTRACT_ADDRESSES[parseInt(params.chainId)][formattedAirdrop.templateName],
      uuid: `0x${airdrop.id.replaceAll("-", "")}`, // TODO Util
      deployer: formattedAirdrop.owner,
      chainId: parseInt(params.chainId),
    });

  // Check if contract is deployed
  const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;

  // TODO
  // Extract to util
  // loop X times and wait for the contract to be deployed
  const MAX_RETRY = 10;
  const INTERVAL = 1000;
  let bytecode: GetCodeReturnType | null;
  for (let i = 0; i < MAX_RETRY; i++) {
    bytecode = await provider.getCode({
      address: contractAddress,
    });
    if (bytecode) break;
    await new Promise((resolve) => setTimeout(resolve, INTERVAL));
  }
  if (!bytecode) {
    return NextResponse.json({ error: "Airdrop contract is not deployed yet" }, { status: 422 });
  }

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

  const str = await response.Body?.transformToString();
  if (!str) {
    return NextResponse.json({ error: "Merkletree file not found" }, { status: 422 });
  }

  let merkletree;
  try {
    merkletree = JSON.parse(str) as MerkleTreeData;
  } catch (e: unknown) {
    const error = getErrorMessage(e);
    return NextResponse.json({ error }, { status: 422 });
  }
  const { valid, error: invalidError } = validateMerkleTree(merkletree);

  if (!valid) {
    return respondError(invalidError);
  }

  // TODO
  // Check if merkletree file is already synced

  try {
    // TODO Condider removing await and return 200 and let the process run in the background
    await processMerkleTree(prisma, merkletree, params.id);
    return NextResponse.json({ result: "ok" });
  } catch (e: unknown) {
    return respondError(e);
  }
}

// TODO Get sync status
export async function GET(req: Request, { params }: { params: { chainId: string; id: string } }) {
  //   try {
  //     const airdrop = await prisma.airdrop.findUnique({
  //       where: { id: params.id },
  //     });
  //     if (!airdrop) {
  //       return NextResponse.json({ error: "Airdrop not found" }, { status: 404 });
  //     }
  //     const formattedAirdrop = convertAirdropWithUint8ArrayToHexString(airdrop);
  //     return NextResponse.json(formattedAirdrop);
  //   } catch (error: unknown) {
  //     return respondError(error);
  //   }
}
