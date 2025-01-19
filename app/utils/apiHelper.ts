import { NextResponse } from "next/server";
import { createPublicClient, fallback, http, erc20Abi, getContract, type PublicClient } from "viem";
import { prisma, type Airdrop } from "@/prisma";
import { getSupportedChain } from "@/app/utils/chain";
import { CHAIN_INFO } from "@/app/lib/constants/chains";
import { getErrorMessage } from "@/app/utils/shared";
import { InvalidOwnerError, NetworkAccessError } from "@/app/types/errors";

export const uint8ObjectToHexString = (
  object: { [key: string]: number } | Uint8Array,
): `0x${string}` => {
  const values = Object.values(object);
  return uint8ArrayToHexString(new Uint8Array(values));
};

export const uint8ArrayToHexString = (uint8Array: Uint8Array): `0x${string}` => {
  return ("0x" +
    Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")) as `0x${string}`;
};

export const hexStringToUint8Array = (hexString: `0x${string}`): Uint8Array => {
  return Uint8Array.from(Buffer.from(hexString.slice(2), "hex"));
};

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

export const respondError = (error: unknown, status?: number) => {
  const message = getErrorMessage(error);
  const statusCode = error instanceof NetworkAccessError ? error.statusCode : 500;
  console.log(`[ERROR] ${message}`);
  return NextResponse.json({ error: message }, { status: status || statusCode });
};

export const requireOwner = async (
  airdrop: Airdrop,
  address: string,
): Promise<{
  error?: InvalidOwnerError;
}> => {
  const owner = uint8ObjectToHexString(airdrop.owner);
  if (address.toLowerCase() !== owner.toLowerCase()) {
    return { error: new InvalidOwnerError() };
  }

  return {};
};

export const getTokenInfo = async (
  tokenAddress: `0x${string}`,
  provider: PublicClient,
): Promise<{ tokenName: string; tokenSymbol: string; tokenDecimals: number }> => {
  const token = getContract({
    address: tokenAddress,
    abi: erc20Abi,
    client: provider,
  });
  const tokenName = await token.read.name();
  const tokenSymbol = await token.read.symbol();
  const tokenDecimals = await token.read.decimals();

  return { tokenName, tokenSymbol, tokenDecimals };
};
