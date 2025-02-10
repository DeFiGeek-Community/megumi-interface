"use client";
import { useCallback, useState } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { AirdropHex } from "@/app/types/airdrop";
import { getErrorMessage } from "@/app/utils/shared";

interface AirdropParams {
  chainId: number;
  airdropId: string;
  contractAddress: string;
}

const API_URL = `${API_BASE_URL}/airdrops`;
export const useUpdateContractAddress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AirdropHex | null>(null);

  const update = useCallback(
    async ({
      params,
      onSuccess,
      onError,
    }: {
      params: AirdropParams;
      onSuccess?: (data: AirdropHex) => void;
      onError?: (error: unknown) => void;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/${params.chainId}/${params.airdropId}`, {
          method: "PATCH",
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create airdrop");
        }

        const responseData: AirdropHex = await response.json();
        setData(responseData);
        onSuccess?.(responseData);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        onError?.(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { update, data, loading, error };
};
