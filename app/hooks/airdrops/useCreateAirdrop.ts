import { useState } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { AirdropHex } from "@/app/types/airdrop";

interface CreateAirdropParams {
  chainId: number;
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

  const createAirdrop = async ({
    params,
    onSuccess,
    onError,
  }: {
    params: CreateAirdropParams;
    onSuccess?: (data: AirdropHex) => void;
    onError?: (error: unknown) => void;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${params.chainId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create airdrop");
      }

      const responseData: AirdropHex = await response.json();
      setData(responseData);
      onSuccess?.(responseData);
    } catch (err: any) {
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return { createAirdrop, data, loading, error };
};
