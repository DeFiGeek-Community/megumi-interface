import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { getErrorMessage } from "@/app/utils/shared";
import { MerkleDistributorInfo } from "@/app/types/airdrop";

const API_URL = `${API_BASE_URL}/airdrops`;

type Callbacks = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};
// If store is true, the merkle tree will be stored in the state (For the memory efficiency)
export const useFetchMerkleTree = ({
  chainId,
  airdropId,
  store = false,
  enabled = true,
}: {
  chainId: number;
  airdropId: string;
  store?: boolean;
  enabled?: boolean;
}) => {
  const [merkleRoot, setMerkleRoot] = useState<`0x${string}` | null>(null);
  const [merkleTree, setMerkleTree] = useState<MerkleDistributorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMerkleTree = useCallback(
    async (callbacks?: Callbacks) => {
      if (!enabled) return;

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/${chainId}/${airdropId}/merkletree`);

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }
        store && setMerkleTree(data);
        callbacks?.onSuccess?.();
        setMerkleRoot(data.merkleRoot);
        setLoading(false);
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        setLoading(false);
        setError(message);
        callbacks?.onError?.(message);
      }
    },
    [chainId, airdropId],
  );

  useEffect(() => {
    fetchMerkleTree();
  }, []);

  return { fetchMerkleTree, merkleTree, merkleRoot, loading, error };
};
