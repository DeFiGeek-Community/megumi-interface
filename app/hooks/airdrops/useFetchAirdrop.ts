import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { AirdropHex } from "@/app/types/airdrop";
import { getErrorMessage } from "@/app/utils/shared";

const API_URL = `${API_BASE_URL}/airdrops`;
export const useFetchAirdrop = (chainId: string, id: string) => {
  const [data, setData] = useState<AirdropHex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAirdrop = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${chainId}/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch airdrop claim");
      }

      const responseData: AirdropHex = await response.json();
      setData(responseData);
    } catch (err: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [chainId, id]);

  useEffect(() => {
    fetchAirdrop();
  }, [chainId, id]);

  return { data, loading, error };
};
