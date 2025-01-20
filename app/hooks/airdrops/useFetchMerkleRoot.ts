import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { getErrorMessage } from "@/app/utils/shared";

const API_URL = `${API_BASE_URL}/airdrops`;

type Callbacks = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};
export const useFetchMerkleRoot = (chainId: number, airdropId: string) => {
  const [merkleRoot, setMerkleRoot] = useState<`0x${string}` | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMerklrRoot = async (callbacks?: Callbacks) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${chainId}/${airdropId}/merkletree`);

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        callbacks?.onError?.(data.error);
      } else {
        callbacks?.onSuccess?.();
      }
      setMerkleRoot(data.merkleRoot);
      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);
      callbacks?.onError?.(getErrorMessage(error));
    }
  };
  useEffect(() => {
    fetchMerklrRoot();
  }, []);
  return { fetchMerklrRoot, merkleRoot, loading, error };
};
