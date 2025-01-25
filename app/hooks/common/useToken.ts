import { erc20Abi, isAddress } from "viem";
import { useReadContracts } from "wagmi";

export default function useToken(address: string | undefined) {
  const result = useReadContracts({
    query: { enabled: !!address && isAddress(address) },
    allowFailure: false,
    contracts: [
      {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
  });
  return result.data
    ? {
        ...result,
        data: {
          name: result.data[0],
          symbol: result.data[1],
          decimals: result.data[2],
          totalSupply: result.data[3],
        },
      }
    : result;
}
