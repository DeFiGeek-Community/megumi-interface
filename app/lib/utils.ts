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
