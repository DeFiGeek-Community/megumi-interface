import * as chains from "viem/chains";
import { CHAIN_INFO } from "../lib/constants/chains";
import type { ChainInfo } from "../lib/constants/chains";

export const isSupportedChain = (chainId: string | number): boolean => {
  return !!getSupportedChain(chainId);
};

export const getSupportedChain = (chainId: string | number): ChainInfo | undefined => {
  return Object.values(CHAIN_INFO).find((c) => c.id === Number(chainId));
};

export const getDefaultChain = (): chains.Chain => {
  if (typeof process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID !== "string") {
    throw new Error("NEXT_PUBLIC_DEFAULT_CHAIN_ID is not set");
  }

  const chain = getSupportedChain(Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID));

  if (typeof chain === "undefined") {
    throw new Error("Unsupported chain is set to NEXT_PUBLIC_DEFAULT_CHAIN_ID");
  }

  return chain;
};

export const getChainById = (chainId: string | number): chains.Chain | undefined => {
  const chain = Object.entries(chains).find(([, chain]) => chain.id === Number(chainId));
  return chain ? chain[1] : undefined;
};
