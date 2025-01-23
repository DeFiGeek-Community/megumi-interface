import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import type { AirdropClaimerMapHex } from "@/app/types/airdrop";
import { getErrorMessage } from "@/app/utils/shared";

const API_URL = `${API_BASE_URL}/airdrops`;
export const useFetchClaimParams = (chainId: string, id: string, address?: `0x${string}`) => {
  const [data, setData] = useState<AirdropClaimerMapHex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaimParams = useCallback(async () => {
    if (!address) return;
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
    } catch (err: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [chainId, id, address]);

  useEffect(() => {
    fetchClaimParams();
  }, [fetchClaimParams]);

  return { data, loading, error, fetchClaimParams };
};
