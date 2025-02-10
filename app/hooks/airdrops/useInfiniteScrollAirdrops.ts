"use client";
import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/app/lib/constants";
import { AirdropHex } from "@/app/types/airdrop";
import { getErrorMessage } from "@/app/utils/shared";

type FetchAirdropsResponse = {
  airdrops: AirdropHex[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
  const [data, setData] = useState<AirdropHex[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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
        const _prevData = prevData || [];
        const newData = _prevData
          ? responseData.airdrops.filter(
              (newAirdrop) =>
                !_prevData.some((existingAirdrop) => existingAirdrop.id === newAirdrop.id),
            )
          : responseData.airdrops;
        return [..._prevData, ...newData];
      });
      setTotalPages(responseData.totalPages);
      setTotalCount(responseData.totalCount);
      setHasMore(responseData.page < responseData.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [chainId, page, limit, loading, hasMore]);

  const fetchNextPage = useCallback(() => {
    if (hasMore) setPage((prevPage) => prevPage + 1);
  }, [hasMore]);

  const unshiftAirdrop = useCallback((airdrop: AirdropHex) => {
    setData((prevData) => {
      const _prevData = prevData || [];
      return [airdrop, ..._prevData];
    });
  }, []);

  useEffect(() => {
    fetchAirdrops();
  }, [page]);

  return {
    data,
    loading,
    error,
    fetchNextPage,
    hasMore,
    page,
    totalPages,
    totalCount,
    unshiftAirdrop,
  };
};
