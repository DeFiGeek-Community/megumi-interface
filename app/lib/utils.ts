import type { GetEnsNameReturnType } from "viem/ens";
import * as chains from "wagmi/chains";

export const getEtherscanLink = (
  chain: string,
  hash: string,
  type: "tx" | "token" | "address" | "block",
): string => {
  return `https://${chain === "mainnet" ? "" : `${chain}.`}etherscan.io/${type}/${hash}`;
};

export const getChain = (chainId: number): chains.Chain => {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }
  return chains.localhost;
};

export const getEllipsizedAddress = ({
  address,
  ensName,
}: {
  address?: `0x${string}`;
  ensName?: GetEnsNameReturnType;
}): string => {
  return ensName ? `${ensName}` : `${address?.slice(0, 5)}...${address?.slice(-4)}`;
};
