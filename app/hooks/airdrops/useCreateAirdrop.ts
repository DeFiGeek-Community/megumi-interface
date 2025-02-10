"use client";
import { useCallback, useState } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { AirdropHex } from "@/app/types/airdrop";
import { getErrorMessage } from "@/app/utils/shared";

interface AirdropParams {
  chainId: number;
  airdropId?: string;
  tokenAddress: string;
  title: string;
  owner: `0x${string}`;
  templateName: string;
  tokenLogo?: string;
}

const API_URL = `${API_BASE_URL}/airdrops`;
export const useCreateAirdrop = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AirdropHex | null>(null);

  const updateOrCreateAirdrop = useCallback(
    async ({
      params,
      onSuccess,
      onError,
    }: {
      params: AirdropParams;
      onSuccess?: (data: AirdropHex) => void;
      onError?: (error: unknown) => void;
    }) => {
      const apiMethod = params.airdropId ? "PATCH" : "POST";
      const apiEndpoint = params.airdropId
        ? `${API_URL}/${params.chainId}/${params.airdropId}`
        : `${API_URL}/${params.chainId}`;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiEndpoint, {
          method: apiMethod,
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

  return { updateOrCreateAirdrop, data, loading, error };
};
