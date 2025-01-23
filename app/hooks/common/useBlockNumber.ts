import { useState, useCallback } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import type { AirdropClaimerMapHex } from "@/app/types/airdrop";
import { getErrorMessage } from "@/app/utils/shared";

export type BlockData = {
  block: number;
  date: string;
  timestamp: number;
  block_timestamp: string;
  hash: string;
  parent_hash: string;
};
const API_URL = `${API_BASE_URL}/airdrops`;
export const useBlockNumber = (chainId: number) => {
  const [data, setData] = useState<BlockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockNumber = useCallback(
    async (date: string) => {
      if (!date) return;
      if (decodeURIComponent(date).match(/^\d{4}-\d{2}-\d{2}$/) === null) {
        setError("Invalid date format");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/${chainId}/block?date=${date}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch airdrop claim");
        }

        const responseData: BlockData = await response.json();
        setData(responseData);
      } catch (err: unknown) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [chainId],
  );

  return { data, loading, error, fetchBlockNumber };
};
