import type { GetEnsNameReturnType } from "viem/ens";
// import * as chains from "wagmi/chains";
import { type Chain, localhost, mainnet, sepolia, base, baseSepolia } from "viem/chains";

const chains = { mainnet, sepolia, base, baseSepolia };
export const getEtherscanLink = (
  chain: Chain | undefined,
  hash: string,
  type: "tx" | "token" | "address" | "block",
): string => {
  if (typeof chain === "undefined" || typeof chain.blockExplorers === "undefined") return "";
  return `${chain.blockExplorers.default.url}/${type}/${hash}`;
};

export const getChain = (chainId: number): Chain => {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }
  return localhost;
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
