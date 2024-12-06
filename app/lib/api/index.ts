import { type PublicClient, createPublicClient, fallback, http } from "viem";
import { getSupportedChain } from "@/app/lib/chain";

export const getViemProvider = (chainId: number): PublicClient => {
  const chain = getSupportedChain(chainId);
  if (!chain) throw new Error("Wrong network");

  const publicEndpoints = chain.rpcUrls.public.http.map((url) => http(url));
  const fallbackEndpoints =
    chain.rpcUrls.infura && process.env.INFURA_API_TOKEN
      ? fallback([
          http(`${chain.rpcUrls.infura.http}/${process.env.INFURA_API_TOKEN}`),
          ...publicEndpoints,
        ])
      : fallback(publicEndpoints);

  const client = createPublicClient({
    chain,
    transport: fallbackEndpoints,
  });
  return client;
};
