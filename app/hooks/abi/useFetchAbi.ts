import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { getViemProvider } from "@/app/utils/shared";
import { API_BASE_URL } from "@/app/lib/constants";

type AbiData = [{ [key: string]: any }];

// Fetch ABI from etherscan
export function useFetchAbi(chainId: number, address?: string) {
  const [data, setData] = useState<AbiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [impleAddress, setImpleAddress] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    if (!address || !isAddress(address)) return;
    getImplementationAddress(chainId, address as `0x${string}`).then(setImpleAddress);
  }, [address]);

  useEffect(() => {
    if (!chainId || !impleAddress) return;

    setLoading(true);
    fetch(`${API_BASE_URL}/abi/${chainId}?address=${impleAddress}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch ABI");
        }
        return res.json();
      })
      .then((json) => {
        const data = JSON.parse(json);
        setData(JSON.parse(data.result));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chainId, impleAddress]);

  return { data, loading, error };
}

export async function getImplementationAddress(
  chainId: number,
  address: `0x${string}`,
): Promise<`0x${string}` | null> {
  const EIP1967_IMPLEMENTATION_SLOT =
    "0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC";
  const client = getViemProvider(chainId, true, true);
  const storageValue = await client.getStorageAt({
    address,
    slot: EIP1967_IMPLEMENTATION_SLOT,
  });
  if (!storageValue) return address;
  const implAddress = `0x${storageValue.slice(-40)}` as `0x${string}`;
  return implAddress === "0x0000000000000000000000000000000000000000" ? address : implAddress;
}
