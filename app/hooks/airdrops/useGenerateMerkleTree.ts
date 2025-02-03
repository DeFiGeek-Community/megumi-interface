"use client";
import { API_BASE_URL } from "@/app/lib/constants";
import { MerkleDistributorInfo } from "@/app/types/airdrop";
import { getErrorMessage } from "@/app/utils/shared";
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
  minAmount?: string;
};

type Callbacks = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function useGenerateMerkleTree(chainId: number, airdropId: string) {
  const [merkleTree, setMerkleTree] = useState<MerkleDistributorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMerkleTree = useCallback(
    async (payload: Payload, callbacks?: Callbacks): Promise<GenerateResult> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/${chainId}/${airdropId}/merkletree`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`${data.error || "Failed to generate merkle tree"}`);
        }

        callbacks?.onSuccess?.();
        setMerkleTree(data);
        return { success: true, data };
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        callbacks?.onError?.(message);
        setMerkleTree(null);
        setError(message);
        return { success: false, error: message };
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
