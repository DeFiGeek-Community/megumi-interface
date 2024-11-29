import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/authOptions";

const prisma = new PrismaClient();

// Get an airdrop by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const airdrop = await prisma.airdrop.findUnique({
      where: { id: params.id },
    });

    if (!airdrop) {
      return NextResponse.json({ error: "Airdrop not found" }, { status: 404 });
    }

    const formattedAirdrop = {
      ...airdrop,
      contractAddress: airdrop.contractAddress ? airdrop.contractAddress.toString("hex") : null,
      templateName: airdrop.templateName.toString("hex"),
      owner: airdrop.owner.toString("hex"),
      tokenAddress: airdrop.tokenAddress.toString("hex"),
    };

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
        contractAddress: contractAddress ? Buffer.from(contractAddress, "hex") : undefined,
        templateName: templateName ? Buffer.from(templateName, "hex") : undefined,
        owner: owner ? Buffer.from(owner, "hex") : undefined,
        tokenAddress: tokenAddress ? Buffer.from(tokenAddress, "hex") : undefined,
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
