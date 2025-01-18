import { useState } from "react";
import { API_BASE_URL } from "@/app/lib/constants";

// TODO --->
interface CreateAirdropParams {
  chainId: number;
  title: string;
  templateName: string;
  tokenAddress: string;
  tokenLogo?: string;
}

interface CreateAirdropResponse {
  id: string;
  chainId: number;
  title: string;
  contractAddress: string | null;
  templateName: string;
  owner: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenLogo: string | null;
  createdAt: string;
  updatedAt: string;
}
//<---

const API_URL = `${API_BASE_URL}/airdrops`;
export const useCreateAirdrop = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CreateAirdropResponse | null>(null);

  const createAirdrop = async ({
    params,
    onSuccess,
    onError,
  }: {
    params: CreateAirdropParams;
    onSuccess?: (data: CreateAirdropResponse) => void;
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

      const responseData: CreateAirdropResponse = await response.json();
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
