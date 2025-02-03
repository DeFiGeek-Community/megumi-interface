import { useEffect, useState } from "react";
import { getErrorMessage, getTokenInfo, getViemProvider } from "@/app/utils/shared";

export default function useToken(address: string | undefined, chainId: number) {
  const provider = getViemProvider(chainId, true, true);
  const [token, setToken] = useState<{
    name: string;
    symbol: string;
    decimals: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchToken = async () => {
    setIsLoading(true);
    setToken(null);
    setIsError(false);
    setError(null);
    try {
      const token = await getTokenInfo(address as `0x${string}`, provider);
      setToken({
        name: token.tokenName,
        symbol: token.tokenSymbol,
        decimals: token.tokenDecimals,
      });
      setIsError(false);
      setError(null);
    } catch (e: unknown) {
      setIsError(true);
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!address) return;
    fetchToken();
  }, [address, chainId]);

  return {
    data: token,
    isLoading,
    isError,
    error,
  };
}
