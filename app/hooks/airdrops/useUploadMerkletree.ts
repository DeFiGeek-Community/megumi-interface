import { useCallback, useState } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { getErrorMessage } from "@/app/utils/shared";

const API_URL = `${API_BASE_URL}/airdrops`;

type UploadCallbacks = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};
export const useUploadMerkletree = (chainId: number, airdropId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, { onSuccess, onError }: UploadCallbacks = {}) => {
      const formData = new FormData();
      formData.append("file", file);

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/${chainId}/${airdropId}`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.error) {
          setError(data.error);
          onError?.(data.error);
        } else {
          onSuccess?.();
        }
        setLoading(false);
      } catch (error: unknown) {
        setLoading(false);
        const message = getErrorMessage(error);
        setError(message);
        onError?.(message);
      }
    },
    [chainId, airdropId],
  );
  return { upload, loading, error };
};
