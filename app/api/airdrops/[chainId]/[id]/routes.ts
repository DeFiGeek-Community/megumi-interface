import { NextResponse } from "next/server";
import type { PublicClient } from "viem";
import type { Airdrop } from "@prisma/client";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/authOptions";
import {
  convertAirdropWithUint8ArrayToHexString,
  getMerkleRootFromAirdropAddress,
  getTemplateNameFromAirdropAddress,
  getTokenInfo,
  hexStringToUint8Array,
  uint8ArrayToHexString,
  validateAirdropContract,
  validateAirdropData,
  validateMerkleTree,
} from "@/app/lib/utils";
import { getViemProvider } from "@/app/lib/api";

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { awsClient } from "@/app/lib/aws";

// TODO util -->
export const respondError = (error: unknown) => {
  const message = error instanceof Error ? `${error.name} ${error.message}` : `${error}`;
  console.error(`[ERROR] ${message}`);
  return NextResponse.json({ error: message }, { status: 500 });
};
// <--

// Upload merkle tree file
export async function POST(req: Request, { params }: { params: { chainId: string; id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Owner check (TODO move to util) -->
  let airdrop: Airdrop | null;
  try {
    airdrop = await prisma.airdrop.findUnique({
      where: { id: params.id },
    });
  } catch (error: unknown) {
    return respondError(error);
  }

  if (!airdrop) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const formattedAirdrop = convertAirdropWithUint8ArrayToHexString(airdrop);

  if (session.user.address !== formattedAirdrop.owner) {
    return NextResponse.json({ error: "You are not the owner of this contract" }, { status: 403 });
  }
  // <--

  const formData = await req.formData();
  const file: any = formData.get("file");
  const buffer = Buffer.from(await file?.arrayBuffer());
  const json = JSON.parse(buffer.toString("utf-8"));

  // Validate merkle tree format
  const { valid, error } = validateMerkleTree(json);
  if (!valid) {
    return NextResponse.json({ error }, { status: 422 });
  }

  // Check if contract is already registered
  if (airdrop.contractAddress) {
    const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;
    const merkleRoot = await getMerkleRootFromAirdropAddress(
      uint8ArrayToHexString(airdrop.contractAddress),
      provider,
    );
    if (json.merkleRoot !== merkleRoot) {
      return NextResponse.json({ error: "Merkle root does not match" }, { status: 422 });
    }
  }

  const itemKey = `${params.chainId}/${params.id}-merkletree.json`;
  const command = new PutObjectCommand({
    Body: buffer,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: itemKey,
    ContentType: "application/json",
  });
  try {
    const response = await awsClient.send(command);
    return NextResponse.json({ result: "ok" });
  } catch (error: unknown) {
    return respondError(error);
  }
}

// Get an airdrop by ID
export async function GET(req: Request, { params }: { params: { chainId: string; id: string } }) {
  try {
    const airdrop = await prisma.airdrop.findUnique({
      where: { id: params.id },
    });

    if (!airdrop) {
      return NextResponse.json({ error: "Airdrop not found" }, { status: 404 });
    }

    const formattedAirdrop = convertAirdropWithUint8ArrayToHexString(airdrop);

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

  // Owner check (TODO move to util) -->
  let airdrop: Airdrop | null;
  try {
    airdrop = await prisma.airdrop.findUnique({
      where: { id: params.id },
    });
  } catch (error: unknown) {
    return respondError(error);
  }

  if (!airdrop) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const formattedAirdrop = convertAirdropWithUint8ArrayToHexString(airdrop);

  if (session.user.address !== formattedAirdrop.owner) {
    return NextResponse.json({ error: "You are not the owner of this contract" }, { status: 403 });
  }
  // <--

  try {
    const body = await req.json();
    const { title, contractAddress, templateName, tokenLogo } = body;

    const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;

    if (
      templateName &&
      templateName !== uint8ArrayToHexString(airdrop.templateName) &&
      airdrop.contractAddress
    ) {
      // template can be changed only before the contract address is registered
      airdrop.contractAddress;
      return NextResponse.json(
        { error: "Airdrop contract is already registered" },
        { status: 422 },
      );
    }
    if (contractAddress) {
      // 1. Check if contract is already registered
      if (airdrop.contractAddress) {
        return NextResponse.json(
          { error: "Airdrop contract is already registered" },
          { status: 422 },
        );
      }
      // 2. Check if the contract is registered in Factory
      const { isRegistered, airdropContract } = await validateAirdropContract(
        contractAddress,
        provider,
      );

      if (!airdropContract || !isRegistered) {
        return NextResponse.json({ error: "Invalid airdrop contract address" }, { status: 422 });
      }
      // 3. Check if the user is the owner
      const owner = (await airdropContract.read.owner()) as string;
      if (owner.toLowerCase() !== session.user.address) {
        return NextResponse.json(
          { error: "You are not the owner of this airdrop" },
          { status: 403 },
        );
      }

      // 4. Check if Template type is valid
      const _templateName = await getTemplateNameFromAirdropAddress(contractAddress, provider);
      if (templateName !== _templateName) {
        return NextResponse.json({ error: "Template type does not match" }, { status: 422 });
      }

      // 5. Fetch token address from the airdrop contract address
      const tokenAddress = (await airdropContract.read.token()) as `0x${string}`;

      // 6. Fetch token information from the token contract address
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
      airdrop = {
        ...airdrop,
        contractAddress: hexStringToUint8Array(contractAddress),
        tokenName,
        tokenSymbol,
        tokenDecimals,
      };
    } else {
      airdrop = {
        ...airdrop,
        title,
        tokenLogo,
        templateName: hexStringToUint8Array(templateName),
      };
    }

    // validateAirdropData(session, airdrop, provider);

    const updatedAirdrop = await prisma.airdrop.update({
      where: { id: params.id },
      data: airdrop,
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

  let airdrop;
  try {
    airdrop = await prisma.airdrop.findUnique({
      where: { id: params.id },
    });
  } catch (error: unknown) {
    return respondError(error);
  }

  if (!airdrop) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const formattedAirdrop = convertAirdropWithUint8ArrayToHexString(airdrop);

  if (session.user.address !== formattedAirdrop.owner) {
    return NextResponse.json({ error: "You are not the owner of this contract" }, { status: 403 });
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
