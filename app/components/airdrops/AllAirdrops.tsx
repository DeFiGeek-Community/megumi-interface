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
      <Heading
        mb={4}
        fontSize={{ base: "xl", md: "3xl" }}
        bgGradient="linear(to-r, brand.gold.100, brand.gold.500, brand.gold.600)"
        bgClip="text"
        fontWeight="bold"
      >
        {t("airdrops.title")}
      </Heading>
      <VStack spacing="4">
        {airdrops.data === null ? (
          <>
            <Skeleton
              h="200"
              w="full"
              borderRadius="16px"
              startColor="brand.bg.card"
              endColor="brand.border.subtle"
            />
            <Skeleton
              h="200"
              w="full"
              borderRadius="16px"
              startColor="brand.bg.card"
              endColor="brand.border.subtle"
            />
            <Skeleton
              h="200"
              w="full"
              borderRadius="16px"
              startColor="brand.bg.card"
              endColor="brand.border.subtle"
            />
          </>
        ) : airdrops.data.length === 0 ? (
          <Box mt="10" textAlign={"center"}>
            No airdrops
          </Box>
        ) : (
          airdrops.data.map((airdrop) => <AirdropCard key={airdrop.id} airdrop={airdrop} />)
        )}

        {airdrops.hasMore && (
          <Button onClick={() => airdrops.fetchNextPage()} variant="goldOutline">
            Load more
          </Button>
        )}
      </VStack>
    </>
  );
}
