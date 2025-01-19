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
  chakra,
  Link,
  Tooltip,
} from "@chakra-ui/react";
import { CheckCircleIcon, DownloadIcon, WarningTwoIcon } from "@chakra-ui/icons";
import ContractFormModal from "./ContractFormModal";
import MerkletreeFormModal from "./merkleTree/MerkletreeFormModal";
import { formatDate } from "@/app/utils/clientHelper";
import { useSyncMerkletree } from "@/app/hooks/airdrops/useSyncMerkletree";

export default function OwnerMenu({
  chainId,
  airdropId,
  ownerAddress,
  contractAddress,
  merkleTreeRegisteredAt,
  contractRegisteredAt,
  refetchAirdrop,
}: {
  chainId: number;
  airdropId: string;
  ownerAddress: `0x${string}`;
  contractAddress: `0x${string}` | null;
  merkleTreeRegisteredAt: Date | null;
  contractRegisteredAt: Date | null;
  refetchAirdrop: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const merkletreeModalDisclosure = useDisclosure();
  const contractModalDisclosure = useDisclosure();
  const sync = useSyncMerkletree(chainId, airdropId, contractAddress);
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
            {merkleTreeRegisteredAt ? (
              <>
                <Text fontWeight="medium" textAlign="left">
                  <Icon as={CheckCircleIcon} mr={1} mb={1} color="green.500" />
                  {t("airdrop.registered")}
                  <chakra.span fontSize={"xs"} ml={2}>
                    ({formatDate(merkleTreeRegisteredAt)})
                  </chakra.span>
                  <Tooltip label={t("airdrop.download")}>
                    <Link
                      href={`/api/airdrops/${chainId}/${airdropId}/merkletree`}
                      download={`merkletree.json`}
                      isExternal
                      ml={2}
                    >
                      <Icon as={DownloadIcon} mr={1} mb={1} />
                    </Link>
                  </Tooltip>
                </Text>
              </>
            ) : (
              <Text fontWeight="medium" textAlign="left">
                <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
                {t("airdrop.unregistered")}
              </Text>
            )}
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
                refetchAirdrop={refetchAirdrop}
              />
            )}
          </>
        </HStack>
        <Divider />
        <HStack justify="space-between">
          <Stack>
            <Text fontWeight="medium">{t("airdrop.contract")}</Text>
            {contractRegisteredAt ? (
              <>
                <Text fontWeight="medium" textAlign="left">
                  <Icon as={CheckCircleIcon} mr={1} mb={1} color="green.500" />
                  {t("airdrop.registered")}
                  <chakra.span fontSize={"xs"} ml={2}>
                    ({formatDate(contractRegisteredAt)})
                  </chakra.span>
                </Text>
              </>
            ) : (
              <Text fontWeight="medium" textAlign="left">
                <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
                {t("airdrop.unregistered")}
              </Text>
            )}
          </Stack>
          {contractAddress ? (
            <></>
          ) : (
            <>
              <Button onClick={sync.checkContractDeploymentAndSync}>sync</Button>
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
                  checkContractDeployment={sync.checkContractDeploymentAndSync}
                  refetchAirdrop={refetchAirdrop}
                />
              )}
            </>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
