"use client";
import { VStack, Box, Skeleton, Button } from "@chakra-ui/react";
import { useInfiniteScrollAirdrops } from "@/app/hooks/airdrops/useInfiniteScrollAirdrops";
import AirdropCard from "@/app/components/airdrops/cards/AirdropCard";

export default function EligibleAirdrops({
  chainId,
  address,
}: {
  chainId: number;
  address: `0x${string}`;
}): JSX.Element {
  const eligibleAirdrops = useInfiniteScrollAirdrops({
    chainId,
    targetAddress: address,
  });

  return (
    <VStack spacing="4">
      {eligibleAirdrops.data === null ? (
        <>
          <Skeleton h="200" w="full" borderRadius="16px" startColor="brand.bg.card" endColor="brand.border.subtle" />
          <Skeleton h="200" w="full" borderRadius="16px" startColor="brand.bg.card" endColor="brand.border.subtle" />
          <Skeleton h="200" w="full" borderRadius="16px" startColor="brand.bg.card" endColor="brand.border.subtle" />
        </>
      ) : eligibleAirdrops.data.length === 0 ? (
        <Box mt="10" textAlign={"center"}>
          No airdrops
        </Box>
      ) : (
        eligibleAirdrops.data.map((airdrop) => <AirdropCard key={airdrop.id} airdrop={airdrop} />)
      )}

      {eligibleAirdrops.hasMore && (
        <Button
          onClick={() => eligibleAirdrops.fetchNextPage()}
          variant="goldOutline"
        >
          Load more
        </Button>
      )}
    </VStack>
  );
}
