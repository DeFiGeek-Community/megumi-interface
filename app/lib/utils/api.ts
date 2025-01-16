import { NextResponse } from "next/server";
import { createPublicClient, fallback, http, type PublicClient } from "viem";
import { prisma, type Airdrop } from "@/prisma";
import { getSupportedChain } from "@/app/lib/chain";
import { CHAIN_INFO } from "@/app/lib/constants/chains";
import { getErrorMessage, uint8ObjectToHexString } from "@/app/lib/utils";
import { InvalidOwnerError, NetworkAccessError } from "@/app/types/errors";

export const getViemProvider = (chainId: number): PublicClient => {
  const chain = getSupportedChain(chainId);
  if (!chain) throw new Error("Wrong network");

  const publicEndpoints = chain.rpcUrls.default.http.map((url) => http(url));
  const fallbackEndpoints =
    CHAIN_INFO[chain.id].infuraRpcUrl && process.env.INFURA_API_TOKEN
      ? fallback([
          http(`${CHAIN_INFO[chain.id].infuraRpcUrl}/${process.env.INFURA_API_TOKEN}`),
          ...publicEndpoints,
        ])
      : fallback(publicEndpoints);

  const client = createPublicClient({
    chain,
    transport: fallbackEndpoints,
  });
  return client;
};

export const respondError = (error: unknown) => {
  const message = getErrorMessage(error);
  const statusCode = error instanceof NetworkAccessError ? error.statusCode : 500;
  console.error(`[ERROR] ${message}`);
  return NextResponse.json({ error: message }, { status: statusCode });
};

export const requireOwner = async (
  airdrop: Airdrop,
  address: string,
): Promise<{
  error?: InvalidOwnerError;
}> => {
  const owner = uint8ObjectToHexString(airdrop.owner);
  if (address !== owner) {
    return { error: new InvalidOwnerError() };
  }

  return {};
};

// Airdrop ---->
export const getAirdropById = async (airdropId: string): Promise<Airdrop | null> => {
  const airdrop = await prisma.airdrop.findUnique({
    where: { id: airdropId },
  });

  return airdrop;
};
// <---- Airdrop
