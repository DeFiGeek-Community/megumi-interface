"use client";
import { useTranslation } from "react-i18next";
import { VStack, Box, Skeleton, Flex, Button, useDisclosure } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useInfiniteScrollAirdrops } from "@/app/hooks/airdrops/useInfiniteScrollAirdrops";
import AirdropCard from "@/app/components/airdrops/cards/AirdropCard";
import AirdropFormModal from "@/app/components/airdrops/AirdropFormModal";

export default function MyAirdrops({
  chainId,
  signedInUser,
}: {
  chainId: number;
  signedInUser: `0x${string}`;
}): JSX.Element {
  const myAirdrops = useInfiniteScrollAirdrops({
    chainId,
    mine: true,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();

  return (
    <>
      <Flex justifyContent="flex-end" mb="6" mt="2">
        <Button
          leftIcon={<AddIcon />}
          bg="gray.500"
          _hover={{ bg: "gray.600" }}
          fontSize={{ base: "sm", sm: "md" }}
          onClick={onOpen}
        >
          {t("dashboard.createAirdrop")}
        </Button>
        {isOpen && (
          <AirdropFormModal
            chainId={chainId}
            ownerAddress={signedInUser}
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            callback={myAirdrops.unshiftAirdrop}
          />
        )}
      </Flex>

      <VStack spacing="4">
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

        {myAirdrops.hasMore && (
          <Button
            onClick={() => myAirdrops.fetchNextPage()}
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
