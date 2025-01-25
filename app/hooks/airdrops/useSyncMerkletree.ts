import { useState, useEffect, useCallback, useMemo } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { getErrorMessage, getTemplateKeyByHex, uuidToHex } from "@/app/utils/shared";
import { useBytecode } from "wagmi";
import { getAirdropAddressFromUUID } from "@/app/utils/airdrop";
import { TemplateNamesType } from "@/app/lib/constants/templates";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";

const API_URL = `${API_BASE_URL}/airdrops`;
export const useSyncMerkletree = (
  chainId: number,
  id: string,
  contractAddress: `0x${string}` | null,
  ownerAddress: `0x${string}`,
  templateName: TemplateNamesType,
  shouldSync: boolean = true,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkContractDeploymentAndSync = useCallback(
    async (options?: {
      maxRetry?: number;
      callbacks?: { onSuccess?: () => void; onError?: (error: string) => void };
    }) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/${chainId}/${id}/syncMerkleTree`, {
          method: "POST",
          body: JSON.stringify({ maxRetry: options?.maxRetry }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch airdrop claim");
        }

        const responseData = await response.json();
        options?.callbacks?.onSuccess?.();
      } catch (err: unknown) {
        const message = getErrorMessage(error);
        setError(message);
        options?.callbacks?.onError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [chainId, id, contractAddress],
  );

  const estimaetedContractAddress = useMemo(
    () =>
      getAirdropAddressFromUUID({
        chainId,
        uuid: uuidToHex(id),
        templateAddress: CONTRACT_ADDRESSES[chainId][getTemplateKeyByHex(templateName)],
        deployer: ownerAddress,
      }),
    [chainId, id, templateName, ownerAddress],
  );

  // Try to get bytecode from the estimated contract address
  // until the contract address is registered to the airdrop
  const result = useBytecode({
    query: { refetchInterval: 10000, enabled: shouldSync },
    address: estimaetedContractAddress,
  });

  useEffect(() => {
    if (!result.data || !shouldSync) return;
    checkContractDeploymentAndSync({ maxRetry: 1 });
  }, [result.data, shouldSync]);

  return { checkContractDeploymentAndSync, loading, error };
};
