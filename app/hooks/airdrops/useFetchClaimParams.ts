import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import type { AirdropClaimerMapHex } from "@/app/types/airdrop";

const API_URL = `${API_BASE_URL}/airdrops`;
export const useFetchClaimParams = (chainId: string, id: string, address?: `0x${string}`) => {
  const [data, setData] = useState<AirdropClaimerMapHex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    const fetchClaimParams = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/${chainId}/${id}/${address}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch airdrop claim");
        }

        const responseData: AirdropClaimerMapHex = await response.json();
        setData(responseData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      fetchClaimParams();
    };
  }, [chainId, id, address]);

  return { data, loading, error };
};
