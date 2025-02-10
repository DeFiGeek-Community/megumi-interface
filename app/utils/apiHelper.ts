import { NextResponse } from "next/server";
import type { Airdrop } from "@/prisma";
import { getErrorMessage } from "@/app/utils/shared";
import { InvalidOwnerError, NetworkAccessError } from "@/app/types/errors";
import { getChainById } from "./chain";
import { createPublicClient, http } from "viem";
import { CHAIN_INFO } from "../lib/constants/chains";

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

export const getAlchemyProvider = (chainId: number) => {
  const chain = getChainById(chainId);
  if (!chain) throw new Error("Chain id is invalid");
  if (!process.env.ALCHEMY_API_KEY) throw new Error("ALCHEMY_API_KEY not set");

  return createPublicClient({
    chain,
    transport: http(`${CHAIN_INFO[chain.id].alchemyRpcUrl}${process.env.ALCHEMY_API_KEY}`),
  });
};
