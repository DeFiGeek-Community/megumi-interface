import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/authOptions";
import { convertAirdropWithUint8ArrayToHexString, hexStringToUint8Array } from "@/app/lib/utils";

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
  } catch (error) {
    console.error("Error fetching airdrop:", error);
    return NextResponse.json({ error: "Failed to fetch airdrop" }, { status: 500 });
  }
}

// Update an airdrop by ID
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // TODO check owner
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      contractAddress,
      templateName,
      owner,
      tokenAddress,
      tokenName,
      tokenSymbol,
      tokenLogo,
      tokenDecimals,
    } = body;

    const updatedAirdrop = await prisma.airdrop.update({
      where: { id: params.id },
      data: {
        contractAddress: contractAddress ? hexStringToUint8Array(contractAddress) : null,
        templateName: hexStringToUint8Array(templateName),
        owner: hexStringToUint8Array(owner),
        tokenAddress: hexStringToUint8Array(tokenAddress),
        tokenName,
        tokenSymbol,
        tokenDecimals,
        tokenLogo,
      },
    });

    return NextResponse.json(updatedAirdrop);
  } catch (error) {
    console.error("Error updating airdrop:", error);
    return NextResponse.json({ error: "Failed to update airdrop" }, { status: 500 });
  }
}

// Delete an airdrop by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // TODO check owner
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.airdrop.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Airdrop deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting airdrop:", error);
    return NextResponse.json({ error: "Failed to delete airdrop" }, { status: 500 });
  }
}
