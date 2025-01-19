import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/app/lib/constants";

const API_URL = `${API_BASE_URL}/airdrops`;
export const useSyncMerkletree = (
  chainId: number,
  id: string,
  contractAddress: `0x${string}` | null,
) => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkContractDeploymentAndSync = useCallback(async () => {
    if (contractAddress) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${chainId}/${id}/syncMerkletree`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch airdrop claim");
      }

      const responseData = await response.json();
      console.log(responseData);
      // setStatus(responseData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [chainId, id, contractAddress]);

  useEffect(() => {
    checkContractDeploymentAndSync();
  }, [chainId, id, contractAddress]);

  return { checkContractDeploymentAndSync, status, loading, error };
};
