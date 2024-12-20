import { NextResponse } from "next/server";
import type { PublicClient } from "viem";
import { Airdrop } from "@prisma/client";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/authOptions";
import {
  convertAirdropWithUint8ArrayToHexString,
  getTemplateNameFromAirdropAddress,
  getTokenInfo,
  hexStringToUint8Array,
  validateAirdropContract,
  validateAirdropData,
} from "@/app/lib/utils";
import { getViemProvider } from "@/app/lib/api";

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { awsClient } from "@/app/lib/aws";

// TODO util
export const respondError = (error: unknown) => {
  const message = error instanceof Error ? `${error.name} ${error.message}` : `${error}`;
  console.error(`[ERROR] ${message}`);
  return NextResponse.json({ error: message }, { status: 500 });
};

// Upload merkle tree file
export async function POST(req: Request, { params }: { params: { chainId: string; id: string } }) {
  // console.log(await req.formData(), params);
  const formData = await req.formData();
  const file: any = formData.get("file");
  const buffer = Buffer.from(await file?.arrayBuffer());

  // TODO
  // Validate merkle tree format
  // if(!validateMerkleTree) {
  // return 422
  // }

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

  try {
    const body = await req.json();
    const { title, contractAddress, templateName, tokenLogo } = body;

    const provider = getViemProvider(parseInt(params.chainId)) as PublicClient;

    if (templateName) {
      // TODO
      // コントラクトが登録されているかチェック。されている場合はエラー
      airdrop.contractAddress;
    }
    if (contractAddress) {
      // コントラクトアドレスの登録時は
      // 1. コントラクトがすでに登録されているかチェック。されている場合はエラー
      if (airdrop.contractAddress) {
        return NextResponse.json({ error: "Airdrop is already registered" }, { status: 422 });
      }
      // 2. コントラクトがファクトリーに登録されているかチェック
      const { isRegistered, airdropContract } = await validateAirdropContract(
        contractAddress,
        provider,
      );

      if (!airdropContract || !isRegistered) {
        return NextResponse.json({ error: "Invalid airdrop contract address" }, { status: 422 });
      }
      // 2. オーナーチェック
      const owner = (await airdropContract.read.owner()) as string;
      if (owner.toLowerCase() !== session.user.address) {
        return NextResponse.json(
          { error: "You are not the owner of this airdrop" },
          { status: 403 },
        );
      }

      // 3. Template typeのチェック
      const _templateName = getTemplateNameFromAirdropAddress(contractAddress, provider);
      if (templateName !== _templateName) {
        return NextResponse.json({ error: "Template type does not match" }, { status: 422 });
      }

      // 4. token Address取得
      const tokenAddress = (await airdropContract.read.token()) as `0x${string}`;
      // 5.トークン情報取得
      // Fetch token information from the contract address
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
      };
    }

    // validateAirdropData(session, airdrop, provider);

    const updatedAirdrop = await prisma.airdrop.update({
      where: { id: params.id },
      data: airdrop,
    });

    // const updatedAirdrop = await prisma.airdrop.update({
    //   where: { id: params.id },
    //   data: {
    //     contractAddress: contractAddress ? hexStringToUint8Array(contractAddress) : null,
    //     templateName: hexStringToUint8Array(templateName),
    //     owner: hexStringToUint8Array(owner),
    //     tokenAddress: hexStringToUint8Array(tokenAddress),
    //     tokenLogo,
    //   },
    // });

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
