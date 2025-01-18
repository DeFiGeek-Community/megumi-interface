import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { AirdropHex } from "@/app/types/airdrop";

interface Airdrop {
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

interface FetchAirdropsResponse {
  airdrops: AirdropHex[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type FetchMode = "all" | "mine" | "eligible";

export const useInfiniteScrollAirdrops = ({
  chainId,
  mine,
  targetAddress,
}: {
  chainId?: number;
  //   initialPage: number = 1;
  //   limit: number = 10;
  mine?: boolean;
  targetAddress?: `0x${string}`;
}) => {
  const API_URL = `${API_BASE_URL}/airdrops`;
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AirdropHex[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAirdrops = useCallback(async () => {
    if (!chainId || loading || !hasMore) return;

    setLoading(true);
    setError(null);

    let fetchModeParam = "";
    if (mine) {
      fetchModeParam = "&mine=true";
    } else if (targetAddress) {
      fetchModeParam = `&eligible=${targetAddress}`;
    }
    try {
      const response = await fetch(
        `${API_URL}/${chainId}?page=${page}&limit=${limit}${fetchModeParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch airdrops");
      }

      const responseData: FetchAirdropsResponse = await response.json();
      setData((prevData) => {
        const newData = responseData.airdrops.filter(
          (newAirdrop) => !prevData.some((existingAirdrop) => existingAirdrop.id === newAirdrop.id),
        );
        return [...prevData, ...newData];
      });
      setTotalPages(responseData.totalPages);
      setHasMore(responseData.page < responseData.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [chainId, page, limit, loading, hasMore]);

  const fetchNextPage = () => {
    if (hasMore) setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    fetchAirdrops();
  }, [page]);

  return { data, loading, error, fetchNextPage, hasMore, page };
};
