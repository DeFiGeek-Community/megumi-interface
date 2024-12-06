import type { Chain } from "viem/chains";
import { mainnet, sepolia, base, baseSepolia } from "viem/chains";

export type ChainInfo = Readonly<Chain> & {
  readonly chainSelector: bigint;
};

export const CHAIN_INFO: { [id: number]: ChainInfo } =
  process.env.NEXT_PUBLIC_ENV === "mainnet"
    ? {
        [mainnet.id]: { ...mainnet, chainSelector: 5009297550715157269n },
        [base.id]: { ...base, chainSelector: 15971525489660198786n, sourceId: 1 },
      }
    : {
        [sepolia.id]: { ...sepolia, chainSelector: 16015286601757825753n },
        [baseSepolia.id]: {
          ...baseSepolia,
          chainSelector: 10344971235874465080n,
        },
      };
