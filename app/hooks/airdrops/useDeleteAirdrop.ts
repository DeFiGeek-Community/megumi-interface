import { useCallback, useState } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { getErrorMessage } from "@/app/utils/shared";

type DeleteAirdropResult = {
  success: boolean;
  error: string | null;
};

type Callbacks = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

const API_URL = `${API_BASE_URL}/airdrops`;
export const useDeleteAirdrop = (chainId: number, airdropId: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DeleteAirdropResult | null>(null);

  const deleteAirdrop = useCallback(
    async (callbacks?: Callbacks) => {
      setLoading(true);
      setResult(null);

      try {
        const response = await fetch(`${API_URL}/${chainId}/${airdropId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete airdrop");
        }

        callbacks?.onSuccess?.();
        setResult({ success: true, error: null });
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        callbacks?.onError?.(message);
        setResult({ success: false, error: message });
      } finally {
        setLoading(false);
      }
    },
    [chainId, airdropId],
  );

  return { deleteAirdrop, loading, result };
};
