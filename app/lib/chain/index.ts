import { HttpTransport, http } from "viem";
import * as chains from "viem/chains";
import { CHAIN_INFO } from "../constants/chains";
import type { ChainInfo } from "../constants/chains";

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

export const getRPCEndpoints = (chainId: number): HttpTransport[] => {
  const chain = CHAIN_INFO[chainId];
  if (!chain) throw Error("Chain id is invalid");

  const endpoints: HttpTransport[] = [];
  chain.rpcUrls.infura &&
    endpoints.push(
      http(`${chain.rpcUrls.infura.http[0]}/${process.env.NEXT_PUBLIC_INFURA_API_TOKEN}`),
    );
  chain.rpcUrls.alchemy &&
    endpoints.push(
      http(`${chain.rpcUrls.alchemy.http[0]}/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
    );
  endpoints.push(http(`${chain.rpcUrls.public.http[0]}`));

  return endpoints;
};
