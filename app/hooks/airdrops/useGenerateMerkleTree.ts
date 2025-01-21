import { API_BASE_URL } from "@/app/lib/constants";
import { MerkleDistributorInfo } from "@/app/types/airdrop";
import { useState, useCallback } from "react";
const API_URL = `${API_BASE_URL}/airdrops`;

type GenerateResult = {
  success: boolean;
  data?: any;
  error?: string;
};

type Payload = {
  snapshotTokenAddress: `0x${string}`;
  untilBlock: number;
  totalAirdropAmount: string;
  ignoreAddresses: `0x${string}`[];
};

export function useGenerateMerkleTree(chainId: number, airdropId: string) {
  const [merkleTree, setMerkleTree] = useState<MerkleDistributorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMerkleTree = useCallback(
    async (payload: Payload): Promise<GenerateResult> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/${chainId}/${airdropId}/merkletree`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }
        const data = await response.json();

        console.log("Client, response: ", data);
        setMerkleTree(data);
        return { success: true, data };
      } catch (err: any) {
        console.log("Client, error: ", err.message);
        setMerkleTree(null);
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [chainId, airdropId],
  );

  return {
    generateMerkleTree,
    merkleTree,
    loading,
    error,
  };
}
