import { type PublicClient, createPublicClient, fallback, http } from "viem";
import { getSupportedChain } from "@/app/lib/chain";
import { CHAIN_INFO } from "../constants/chains";

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
