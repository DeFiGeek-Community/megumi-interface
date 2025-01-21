import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { PublicClient } from "viem";
import { prisma } from "@/prisma";
import { authOptions } from "@/app/api/auth/authOptions";
import { s3Client, PutObjectCommand } from "@/app/lib/aws";
import {
  AirdropNotFoundError,
  ContractAlreadyRegisteredError,
  InvalidMerkletreeError,
  UnauthorizedError,
} from "@/app/types/errors";
import { getTokenInfo } from "@/app/utils/apiHelper";
import {
  getViemProvider,
  requireOwner,
  respondError,
  hexStringToUint8Array,
  uint8ArrayToHexString,
} from "@/app/utils/apiHelper";
import * as AirdropUtils from "@/app/utils/airdrop";
import { MerkleTreeData } from "@/app/types/airdrop";

// Upload merkle tree file
export async function POST(req: Request, { params }: { params: { chainId: string; id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return respondError(new UnauthorizedError());
  }

  const airdrop = await AirdropUtils.getAirdropById(params.id);

  if (!airdrop) {
    return respondError(new AirdropNotFoundError());
  }
  const { error } = await requireOwner(airdrop, session.user.address);

  if (error) {
    return respondError(error);
  }

  const formData = await req.formData();
  const file: any = formData.get("file");
  const buffer = Buffer.from(await file?.arrayBuffer());
  const json = JSON.parse(buffer.toString("utf-8"));

  // Validate merkle tree format
  const { valid, error: formatError } = AirdropUtils.validateMerkleTree(json);
  if (!valid) {
    return respondError(formatError);
  }

  // Check if contract is already registered
  if (airdrop.contractAddress) {
    // Return error if contract is already registered
    return respondError(new ContractAlreadyRegisteredError());
    // const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;
    // const merkleRoot = await AirdropUtils.getMerkleRootFromAirdropAddress(
    //   uint8ArrayToHexString(airdrop.contractAddress),
    //   provider,
    // );
    // if (json.merkleRoot !== merkleRoot) {
    //   return respondError(new InvalidMerkletreeError("Merkle root does not match"));
    // }
  }

  const itemKey = `${params.chainId}/${params.id}-merkletree.json`;
  const command = new PutObjectCommand({
    Body: buffer,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: itemKey,
    ContentType: "application/json",
  });
  try {
    const response = await s3Client.send(command);
    const updatedAirdrop = await prisma.airdrop.update({
      where: { id: params.id },
      data: {
        merkleTreeRegisteredAt: new Date(),
        totalAirdropAmount: hexStringToUint8Array(
          `0x${BigInt(json.airdropAmount as string).toString(16)}`,
        ),
      },
    });

    if (airdrop.contractAddress) {
      // If contract is already registered, process merkle tree
      await AirdropUtils.processMerkleTree(prisma, json as MerkleTreeData, params.id);
    }
    return NextResponse.json({ result: "ok" });
  } catch (error: unknown) {
    return respondError(error);
  }
}

// Get an airdrop by ID
export async function GET(req: Request, { params }: { params: { chainId: string; id: string } }) {
  const session = await getServerSession(authOptions);
  try {
    const airdrop = await AirdropUtils.getAirdropById(params.id);

    // If airdrop is not found,
    // or the contract is not registered yet AND the user is NOT the owner, return 404
    // TODO Should be handled in the prisma query
    if (
      !airdrop ||
      (!airdrop.contractRegisteredAt &&
        session?.user.address.toLowerCase() !== uint8ArrayToHexString(airdrop.owner).toLowerCase())
    ) {
      return respondError(new AirdropNotFoundError());
    }
    const formattedAirdrop = AirdropUtils.toHexString(airdrop);

    return NextResponse.json(formattedAirdrop);
  } catch (error: unknown) {
    return respondError(error);
  }
}

// Update an airdrop by ID
export async function PATCH(req: Request, { params }: { params: { chainId: string; id: string } }) {
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

  try {
    const body = await req.json();
    const { title, contractAddress, templateName, tokenLogo } = body;

    const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;

    if (
      templateName &&
      templateName.toLowerCase() !== uint8ArrayToHexString(airdrop.templateName).toLowerCase() &&
      airdrop.contractAddress
    ) {
      // template can be changed only before the contract address is registered
      airdrop.contractAddress;
      return NextResponse.json(
        { error: "Airdrop contract is already registered" },
        { status: 422 },
      );
    }

    let updateParams;
    if (contractAddress) {
      // 1. Check if contract is already registered
      if (airdrop.contractAddress) {
        return NextResponse.json(
          { error: "Airdrop contract is already registered" },
          { status: 422 },
        );
      }
      // try {
      // 2. Check if the contract is registered in Factory
      const isRegistered = await AirdropUtils.isRegisteredAirdrop(contractAddress, provider);
      if (!isRegistered) {
        return NextResponse.json({ error: "Invalid airdrop contract address" }, { status: 422 });
      }

      // 3. Check if the user is the owner
      const isOwner = await AirdropUtils.isOwnerOf(contractAddress, session.user.address, provider);
      if (!isOwner) {
        return NextResponse.json(
          { error: "You are not the owner of this airdrop" },
          { status: 403 },
        );
      }

      // 4. Check if Template type is valid
      const isCorrectTemplate = await AirdropUtils.checkTemplateName(
        uint8ArrayToHexString(airdrop.templateName),
        contractAddress,
        provider,
      );
      if (!isCorrectTemplate) {
        return NextResponse.json({ error: "Template type does not match" }, { status: 422 });
      }

      // TODO
      // Consider if contract address can be registered without merkle tree file
      // Currently, it throws an error if merkle tree file is not uploaded
      // 5. Check if merkle tree is registered
      const merkletree = await AirdropUtils.getMerkleTreeFile(params.chainId, params.id);
      const isCorrectMerkleRoot = await AirdropUtils.validateMerkleRoot(
        merkletree,
        contractAddress,
        provider,
      );

      // If merkle tree is registered, merkle root should be identical
      if (!isCorrectMerkleRoot) {
        // If not, return 422
        return NextResponse.json(
          { error: "Contract does not match merkle root with merkle tree file" },
          { status: 422 },
        );
      }

      // 6. Fetch token address from the airdrop contract address
      const tokenAddress = await AirdropUtils.getTokenAddress(contractAddress, provider);

      // 7. Fetch token information from the token contract address
      let tokenName;
      let tokenSymbol;
      let tokenDecimals;
      const token = await getTokenInfo(tokenAddress, provider);
      tokenName = token.tokenName;
      tokenSymbol = token.tokenSymbol;
      tokenDecimals = token.tokenDecimals;

      // When contract is given, update params related to the contract
      updateParams = {
        contractAddress: hexStringToUint8Array(contractAddress),
        tokenName,
        tokenSymbol,
        tokenDecimals,
      };
    } else {
      updateParams = {
        title,
        tokenLogo,
        templateName: hexStringToUint8Array(templateName),
      };
    }

    const updatedAirdrop = await prisma.airdrop.update({
      where: { id: params.id },
      data: updateParams,
    });

    return NextResponse.json(updatedAirdrop);
  } catch (error: unknown) {
    return respondError(error);
  }
}

// Delete an airdrop by ID
export async function DELETE(
  req: Request,
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

  try {
    await prisma.airdrop.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Airdrop deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    return respondError(error);
  }
}
