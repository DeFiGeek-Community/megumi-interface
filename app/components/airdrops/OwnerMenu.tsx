"use client";
import { useTranslation } from "react-i18next";
import {
  Stack,
  HStack,
  Text,
  Button,
  VStack,
  Box,
  Divider,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import ContractFormModal from "./ContractFormModal";
import MerkletreeFormModal from "./merkleTree/MerkletreeFormModal";

export default function OwnerMenu({
  chainId,
  airdropId,
  ownerAddress,
  contractAddress,
}: {
  chainId: number;
  airdropId: string;
  ownerAddress: `0x${string}`;
  contractAddress: `0x${string}` | null;
}) {
  const { t } = useTranslation();
  const merkletreeModalDisclosure = useDisclosure();
  const contractModalDisclosure = useDisclosure();
  return (
    <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4}>
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="900">
            {t("airdrop.ownerMenu")}
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontWeight="medium">{t("airdrop.basicInformation")}</Text>
          <Button size="sm" width="20" colorScheme="blue">
            {t("airdrop.edit")}
          </Button>
        </HStack>
        <Divider />
        <HStack justify="space-between">
          <Stack>
            <Text fontWeight="medium">{t("airdrop.airdropList")}</Text>
            <Text fontWeight="medium" textAlign="left">
              <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
              {t("airdrop.unregistered")}
            </Text>
          </Stack>
          <>
            <Button
              variant={"solid"}
              colorScheme="blue"
              size={"sm"}
              onClick={merkletreeModalDisclosure.onOpen}
            >
              {t("airdrop.register")}
            </Button>
            {merkletreeModalDisclosure.isOpen && (
              <MerkletreeFormModal
                chainId={chainId}
                airdropId={airdropId}
                ownerAddress={ownerAddress}
                isOpen={merkletreeModalDisclosure.isOpen}
                onOpen={merkletreeModalDisclosure.onOpen}
                onClose={merkletreeModalDisclosure.onClose}
              />
            )}
          </>
        </HStack>
        <Divider />
        <HStack justify="space-between">
          <Stack>
            <Text fontWeight="medium">{t("airdrop.contract")}</Text>
            <Text fontWeight="medium" textAlign="left">
              <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
              {t("airdrop.unregistered")}
            </Text>
          </Stack>

          {contractAddress ? (
            <>TODO</>
          ) : (
            <>
              <Button
                variant={"solid"}
                colorScheme="blue"
                size={"sm"}
                onClick={contractModalDisclosure.onOpen}
              >
                {t("airdrop.register")}
              </Button>
              {contractModalDisclosure.isOpen && (
                <ContractFormModal
                  chainId={chainId}
                  airdropId={airdropId}
                  ownerAddress={ownerAddress}
                  isOpen={contractModalDisclosure.isOpen}
                  onOpen={contractModalDisclosure.onOpen}
                  onClose={contractModalDisclosure.onClose}
                />
              )}
            </>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
