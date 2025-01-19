"use client";
import { VStack, Box, Skeleton, Button } from "@chakra-ui/react";
import { useInfiniteScrollAirdrops } from "@/app/hooks/airdrops/useInfiniteScrollAirdrops";
import AirdropCard from "@/app/components/airdrops/cards/AirdropCard";

export default function MyAirdrops({ chainId }: { chainId: number }): JSX.Element {
  const myAirdrops = useInfiniteScrollAirdrops({
    chainId,
    mine: true,
  });

  return (
    <VStack spacing="4">
      <Button onClick={() => myAirdrops.fetchNextPage()} bg="gray.500" _hover={{ bg: "gray.600" }}>
        Fetch
      </Button>
      {myAirdrops.data === null ? (
        <>
          <Skeleton h="200" w="full" />
          <Skeleton h="200" w="full" />
          <Skeleton h="200" w="full" />
        </>
      ) : myAirdrops.data.length === 0 ? (
        <Box mt="10" h="200" textAlign={"center"}>
          No airdrops
        </Box>
      ) : (
        myAirdrops.data.map((airdrop) => <AirdropCard key={airdrop.id} airdrop={airdrop} />)
      )}
    </VStack>
  );
}
