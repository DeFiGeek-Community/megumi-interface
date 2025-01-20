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
import { formatAmount, formatDate } from "@/app/utils/clientHelper";
import { useSyncMerkletree } from "@/app/hooks/airdrops/useSyncMerkletree";
import useWithdrawToken from "@/app/hooks/airdrops/useWithdrawToken";
import useWithdrawClaimFee from "@/app/hooks/airdrops/useWithdrawClaimFee";
import { useBalance } from "wagmi";

export default function OwnerMenu({
  chainId,
  airdropId,
  ownerAddress,
  contractAddress,
  totalAirdropAmount,
  merkleTreeRegisteredAt,
  contractRegisteredAt,
  balanceOnContract,
  refetchAirdrop,
}: {
  chainId: number;
  airdropId: string;
  ownerAddress: `0x${string}`;
  contractAddress: `0x${string}` | null;
  totalAirdropAmount: bigint | null;
  merkleTreeRegisteredAt: Date | null;
  contractRegisteredAt: Date | null;
  balanceOnContract:
    | {
        decimals: number;
        formatted: string;
        symbol: string;
        value: bigint;
      }
    | undefined;
  refetchAirdrop: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const merkletreeModalDisclosure = useDisclosure();
  const contractModalDisclosure = useDisclosure();
  const sync = useSyncMerkletree(chainId, airdropId, contractAddress);
  const withdrawToken = useWithdrawToken({ chainId, contractAddress });
  const withdrawClaimFee = useWithdrawClaimFee({ chainId, contractAddress });
  const feeBalance = useBalance({
    chainId,
    address: contractAddress ? contractAddress : undefined,
  });
  return (
    <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4}>
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="900">
            {t("airdrop.ownerMenu.title")}
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
              <VStack alignItems={"baseline"}>
                <Text fontWeight="medium" textAlign="left">
                  <Icon as={CheckCircleIcon} mr={1} mb={1} color="green.500" />
                  {t("airdrop.registered")}
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
                <chakra.span fontSize={"xs"} ml={2} color={"gray.400"}>
                  {formatDate(merkleTreeRegisteredAt)}
                </chakra.span>
              </VStack>
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
                <VStack alignItems={"baseline"}>
                  <Text fontWeight="medium" textAlign="left">
                    <Icon as={CheckCircleIcon} mr={1} mb={1} color="green.500" />
                    {t("airdrop.registered")}
                  </Text>
                  <chakra.span fontSize={"xs"} ml={2} color={"gray.400"}>
                    {formatDate(contractRegisteredAt)}
                  </chakra.span>
                </VStack>
              </>
            ) : (
              <Text fontWeight="medium" textAlign="left">
                <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
                {t("airdrop.unregistered")}
              </Text>
            )}
          </Stack>
          {contractAddress ? (
            <>
              <VStack>
                <chakra.p color={"gray.400"} fontSize={"sm"} textAlign={"right"}>
                  {t("airdrop.ownerMenu.tokenBalance")}:{" "}
                  {balanceOnContract
                    ? `${formatAmount(balanceOnContract.value, balanceOnContract.decimals)} ${balanceOnContract.symbol}`
                    : "-"}
                </chakra.p>
                <Button
                  variant={"solid"}
                  colorScheme="blue"
                  size={"sm"}
                  isLoading={withdrawToken.waitResult?.isLoading}
                  disabled={withdrawToken.prepareFn.isPending || !balanceOnContract?.value}
                  onClick={() => withdrawToken.writeFn.write()}
                >
                  {t("airdrop.ownerMenu.withdraw")}
                </Button>
              </VStack>
              <VStack>
                <chakra.p color={"gray.400"} fontSize={"sm"} textAlign={"right"}>
                  {t("airdrop.ownerMenu.ethBalance")}:{" "}
                  {feeBalance.data?.value ? `${formatAmount(feeBalance.data.value)} ETH` : "-"}
                </chakra.p>
                <Button
                  variant={"solid"}
                  colorScheme="blue"
                  size={"sm"}
                  isLoading={withdrawClaimFee.waitResult?.isLoading}
                  disabled={withdrawClaimFee.prepareFn.isPending || !feeBalance.data?.value}
                  onClick={() => withdrawClaimFee.writeFn.write()}
                >
                  {t("airdrop.ownerMenu.withdraw")}
                </Button>
              </VStack>
            </>
          ) : (
            <>
              {/* <Button
                onClick={() => sync.checkContractDeploymentAndSync({ onSuccess: refetchAirdrop })}
              >
                sync
              </Button> */}
              <Button
                variant={"solid"}
                colorScheme="blue"
                size={"sm"}
                disabled={!merkleTreeRegisteredAt}
                onClick={contractModalDisclosure.onOpen}
              >
                {t("airdrop.register")}
              </Button>
              {contractModalDisclosure.isOpen && merkleTreeRegisteredAt && (
                <ContractFormModal
                  chainId={chainId}
                  airdropId={airdropId}
                  ownerAddress={ownerAddress}
                  totalAirdropAmount={totalAirdropAmount}
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
