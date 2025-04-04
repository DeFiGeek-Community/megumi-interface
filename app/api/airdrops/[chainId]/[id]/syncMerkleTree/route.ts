import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GetCodeReturnType, type PublicClient } from "viem";
import { prisma } from "@/prisma";
import { authOptions } from "@/app/api/auth/authOptions";
import {
  getErrorMessage,
  getTemplateKeyByHex,
  getTokenInfo,
  getViemProvider,
} from "@/app/utils/shared";
import { hexStringToUint8Array, requireOwner, respondError } from "@/app/utils/apiHelper";
import { s3Client, GetObjectCommand, GetObjectCommandOutput } from "@/app/lib/aws";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import { AirdropNotFoundError } from "@/app/types/errors";
import { MerkleTreeData } from "@/app/types/airdrop";
import * as AirdropUtils from "@/app/utils/airdrop";
import { uuidToHex } from "@/app/utils/shared";

// 1. Check if merkletree file is registered and synced
// 2. Get merkle tree file from S3
// 3. Validate merkletree file
// 4. Check if contract is registered
// 5. If not, check if contract is deployed
// 6. If contract is deployed, check if merkle root is identical
// 7. If contract is valid, register the contract address
// 8. Sync merkletree file
export async function POST(req: Request, { params }: { params: { chainId: string; id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const airdrop = await AirdropUtils.getAirdropById(params.id);
  if (!airdrop) {
    return respondError(new AirdropNotFoundError());
  }
  const { error } = await requireOwner(airdrop, session.user.safeAddress || session.user.address);

  if (error) {
    return respondError(error);
  }

  const formattedAirdrop = AirdropUtils.toHexString(airdrop);

  // Check if contract is already registered
  let contractAddress =
    formattedAirdrop.contractAddress ||
    AirdropUtils.getAirdropAddressFromUUID({
      templateAddress:
        CONTRACT_ADDRESSES[parseInt(params.chainId)][
          getTemplateKeyByHex(formattedAirdrop.templateName)
        ],
      uuid: uuidToHex(airdrop.id),
      deployer: formattedAirdrop.owner,
      chainId: parseInt(params.chainId),
    });

  // 1. Check if merkletree file is registered and synced
  if (!airdrop.merkleTreeRegisteredAt) {
    return NextResponse.json({ result: "merkletree is not registered yet" });
  }

  if (
    airdrop.lastSyncedAt &&
    airdrop.lastSyncedAt.getTime() > airdrop.merkleTreeRegisteredAt.getTime()
  ) {
    return NextResponse.json({ result: "sync status is up-to-date" });
  }

  // 2. Get merkle tree file from S3
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

  // 3. Validate merkletree file
  const { error: invalidError } = AirdropUtils.validateMerkleTree(merkletree);

  if (invalidError) {
    return respondError(invalidError);
  }

  // 4. Check if contract is registered
  const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;
  if (!airdrop.contractAddress) {
    // 5. If not, check if contract is deployed
    // TODO
    // Extract to util
    // loop X times and wait for the contract to be deployed
    const body = await req.json();
    const { maxRetry } = body;
    const maxRetryInt = parseInt(maxRetry);
    const LIMIT = 10;
    const MAX_RETRY = isNaN(maxRetryInt) || maxRetryInt > LIMIT ? LIMIT : maxRetryInt;
    const INTERVAL = 1000;
    let bytecode: GetCodeReturnType | null;
    for (let i = 0; i < MAX_RETRY; i++) {
      bytecode = await provider.getCode({
        address: contractAddress,
      });
      if (bytecode) {
        // 6. If contract is deployed, check if merkle root is identical
        const merkleRoot = await AirdropUtils.getMerkleRootFromAirdropAddress(
          contractAddress,
          provider,
        );
        if (merkletree.merkleRoot.toLowerCase() !== merkleRoot.toLowerCase()) {
          return NextResponse.json({ error: "Merkle root is not identical" }, { status: 500 });
        }

        // 7. If contract is valid, register the contract address
        // Fetch token information from the contract address
        let tokenAddress;
        let tokenName;
        let tokenSymbol;
        let tokenDecimals;

        try {
          tokenAddress = await AirdropUtils.getTokenAddress(contractAddress, provider);
          const token = await getTokenInfo(tokenAddress, provider);
          tokenName = token.tokenName;
          tokenSymbol = token.tokenSymbol;
          tokenDecimals = token.tokenDecimals;
        } catch (error: unknown) {
          return respondError(error, 422);
        }

        const updatedAirdrop = await prisma.airdrop.update({
          where: { id: params.id },
          data: {
            contractAddress: hexStringToUint8Array(contractAddress),
            contractRegisteredAt: new Date(),
            tokenAddress: hexStringToUint8Array(tokenAddress),
            tokenName,
            tokenSymbol,
            tokenDecimals,
          },
        });
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, INTERVAL));
    }
    if (!bytecode) {
      return NextResponse.json({ error: "Airdrop contract is not deployed yet" }, { status: 422 });
    }
  }

  // 8. Sync merkletree file
  try {
    // TODO Condider removing await and return 200 and let the process run in the background
    await AirdropUtils.processMerkleTree(prisma, merkletree, params.id);
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
