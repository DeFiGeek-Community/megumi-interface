import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { getErrorMessage } from "@/app/utils/shared";

const API_URL = `${API_BASE_URL}/airdrops`;
export const useSyncMerkletree = (
  chainId: number,
  id: string,
  contractAddress: `0x${string}` | null,
  enabled: boolean = true,
) => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkContractDeploymentAndSync = useCallback(
    async (options?: {
      maxRetry?: number;
      callbacks?: { onSuccess?: () => void; onError?: (error: string) => void };
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/${chainId}/${id}/syncMerkletree`, {
          method: "POST",
          body: JSON.stringify({ maxRetry: options?.maxRetry }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch airdrop claim");
        }

        const responseData = await response.json();
        options?.callbacks?.onSuccess?.();
        // setStatus(responseData);
      } catch (err: unknown) {
        const message = getErrorMessage(error);
        setError(message);
        options?.callbacks?.onError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [chainId, id, contractAddress],
  );

  useEffect(() => {
    // Not need to sync if contract address is already set
    if (!enabled || contractAddress) return;
    checkContractDeploymentAndSync();
  }, [chainId, id, contractAddress, enabled]);

  return { checkContractDeploymentAndSync, status, loading, error };
};
