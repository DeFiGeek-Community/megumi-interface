import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import type { AirdropClaimerMapHex } from "@/app/types/airdrop";
import { getErrorMessage } from "@/app/utils/shared";

const API_URL = `${API_BASE_URL}/airdrops`;
export const useUpdateClaimStatus = (
  chainId: string,
  id: string,
  address: `0x${string}` | undefined,
  isClaimed: boolean = true,
  { onSuccess, onError }: { onSuccess?: () => void; onError?: (error: string) => void } = {},
) => {
  const [data, setData] = useState<AirdropClaimerMapHex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateClaimStatus = useCallback(async () => {
    if (!address || isClaimed) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${chainId}/${id}/${address}`, { method: "PATCH" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update claim status");
      }

      const responseData: AirdropClaimerMapHex = await response.json();
      setData(responseData);
      onSuccess?.();
    } catch (err: unknown) {
      const message = getErrorMessage(error);
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [chainId, id, address, isClaimed]);

  useEffect(() => {
    updateClaimStatus();
  }, [chainId, id, address, isClaimed]);

  return { data, loading, error, updateClaimStatus };
};
