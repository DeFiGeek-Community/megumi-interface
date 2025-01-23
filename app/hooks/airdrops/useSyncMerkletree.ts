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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkContractDeploymentAndSync = useCallback(
    async (options?: {
      maxRetry?: number;
      callbacks?: { onSuccess?: () => void; onError?: (error: string) => void };
    }) => {
      // Not need to sync if already synced
      if (!enabled) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/${chainId}/${id}/syncMerkleTree`, {
          method: "POST",
          body: JSON.stringify({ maxRetry: options?.maxRetry }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch airdrop claim");
        }

        const responseData = await response.json();
        options?.callbacks?.onSuccess?.();
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
    checkContractDeploymentAndSync();
  }, [chainId, id, contractAddress, enabled]);

  return { checkContractDeploymentAndSync, loading, error };
};
