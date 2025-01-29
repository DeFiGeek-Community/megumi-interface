"use client";
import { useTranslation } from "react-i18next";
import { Heading, VStack, Box, Skeleton, Button } from "@chakra-ui/react";
import { useInfiniteScrollAirdrops } from "@/app/hooks/airdrops/useInfiniteScrollAirdrops";
import AirdropCard from "@/app/components/airdrops/cards/AirdropCard";

export default function AllAirdrops({ chainId }: { chainId: number }): JSX.Element {
  const airdrops = useInfiniteScrollAirdrops({
    chainId,
  });
  const { t } = useTranslation();

  return (
    <>
      <Heading mb={4} fontSize={{ base: "xl", md: "3xl" }}>
        {t("airdrop.title")}
      </Heading>
      <VStack spacing="4">
        {airdrops.data === null ? (
          <>
            <Skeleton h="200" w="full" />
            <Skeleton h="200" w="full" />
            <Skeleton h="200" w="full" />
          </>
        ) : airdrops.data.length === 0 ? (
          <Box mt="10" textAlign={"center"}>
            No airdrops
          </Box>
        ) : (
          airdrops.data.map((airdrop) => <AirdropCard key={airdrop.id} airdrop={airdrop} />)
        )}

        {airdrops.hasMore && (
          <Button
            onClick={() => airdrops.fetchNextPage()}
            bg="gray.500"
            _hover={{ bg: "gray.600" }}
          >
            Load more
          </Button>
        )}
      </VStack>
    </>
  );
}
