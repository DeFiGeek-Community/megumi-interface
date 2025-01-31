import { NextResponse } from "next/server";
import { createPublicClient, fallback, http, erc20Abi, getContract, type PublicClient } from "viem";
import { prisma, type Airdrop } from "@/prisma";
import { getSupportedChain } from "@/app/utils/chain";
import { CHAIN_INFO } from "@/app/lib/constants/chains";
import { getErrorMessage } from "@/app/utils/shared";
import { InvalidOwnerError, NetworkAccessError } from "@/app/types/errors";

export const uint8ObjectToHexString = (
  object: { [key: string]: number } | Uint8Array | null,
): `0x${string}` | null => {
  if (!object) {
    return null;
  }
  const values = Object.values(object);
  return uint8ArrayToHexString(new Uint8Array(values));
};

export const uint8ArrayToHexString = (uint8Array: Uint8Array): `0x${string}` => {
  const array = Array.from(uint8Array);
  const str =
    array.length === 0 ? "0" : array.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return ("0x" + str) as `0x${string}`;
};

export const hexStringToUint8Array = (hexString: `0x${string}`): Uint8Array => {
  const str = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  const normalizedHex = str.length % 2 ? "0" + str : str;
  return Uint8Array.from(Buffer.from(normalizedHex, "hex"));
};

export const getViemProvider = (chainId: number): PublicClient => {
  const chain = getSupportedChain(chainId);
  if (!chain) throw new Error("Wrong network");
  const thirdPartyEndpoints = [];

  if (CHAIN_INFO[chain.id].infuraRpcUrl && process.env.NEXT_PUBLIC_INFURA_API_KEY) {
    thirdPartyEndpoints.push(
      http(`${CHAIN_INFO[chain.id].infuraRpcUrl}${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
    );
  }
  if (CHAIN_INFO[chain.id].alchemyRpcUrl && process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    thirdPartyEndpoints.push(
      http(`${CHAIN_INFO[chain.id].alchemyRpcUrl}${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
    );
  }

  const client = createPublicClient({
    chain,
    transport: fallback(thirdPartyEndpoints),
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
  if (address.toLowerCase() !== owner?.toLowerCase()) {
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
