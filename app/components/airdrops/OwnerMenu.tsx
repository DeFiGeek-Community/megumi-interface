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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  DownloadIcon,
  Search2Icon,
  WarningIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import ContractFormModal from "./contract/ContractFormModal";
import MerkletreeFormModal from "./merkleTree/MerkletreeFormModal";
import { formatAmount, formatDate } from "@/app/utils/clientHelper";
import { useSyncMerkletree } from "@/app/hooks/airdrops/useSyncMerkletree";
import useWithdrawToken from "@/app/hooks/airdrops/useWithdrawToken";
import useWithdrawClaimFee from "@/app/hooks/airdrops/useWithdrawClaimFee";
import { useBalance } from "wagmi";
import AirdropFormModal from "./AirdropFormModal";
import { TemplateNamesType } from "@/app/lib/constants/templates";
import { useDeleteAirdrop } from "@/app/hooks/airdrops/useDeleteAirdrop";
import { useRef } from "react";
import PreviewList from "./merkleTree/PreviewList";
import { useFetchMerkleTree } from "@/app/hooks/airdrops/useFetchMerkleTree";

export default function OwnerMenu({
  chainId,
  airdropId,
  ownerAddress,
  contractAddress,
  totalAirdropAmount,
  merkleTreeRegisteredAt,
  contractRegisteredAt,
  lastSyncedAt,
  balanceOnContract,
  title,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  templateName,
  tokenLogo,
  refetchAirdrop,
}: {
  chainId: number;
  airdropId: string;
  ownerAddress: `0x${string}`;
  contractAddress: `0x${string}` | null;
  totalAirdropAmount: string | null;
  merkleTreeRegisteredAt: Date | null;
  contractRegisteredAt: Date | null;
  lastSyncedAt: Date | null;
  balanceOnContract:
    | {
        decimals: number;
        formatted: string;
        symbol: string;
        value: bigint;
      }
    | undefined;
  title: string;
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  templateName: TemplateNamesType;
  tokenLogo: string | null;
  refetchAirdrop: () => Promise<void>;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const airdropModalDisclosure = useDisclosure();
  const merkletreeModalDisclosure = useDisclosure();
  const merkletreePreviewDisclosure = useDisclosure();
  const contractModalDisclosure = useDisclosure();
  const shouldSync = !!merkleTreeRegisteredAt && !lastSyncedAt; //  merkle tree is registered and not synced
  const sync = useSyncMerkletree(chainId, airdropId, contractAddress, shouldSync);
  const withdrawToken = useWithdrawToken({ chainId, contractAddress });
  const withdrawClaimFee = useWithdrawClaimFee({ chainId, contractAddress });
  const feeBalance = useBalance({
    chainId,
    address: contractAddress ? contractAddress : undefined,
  });
  const { deleteAirdrop, loading: deleting } = useDeleteAirdrop(chainId, airdropId);
  const deleteConfirmationDisclosure = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const callbacks = {
    onSuccess: () => {
      toast({ title: "Successfully deleted", status: "success" });
      deleteConfirmationDisclosure.onClose();
      router.push("/dashboard");
    },
    onError: (error: string) => {
      toast({ title: error, status: "error" });
    },
  };

  const { merkleTree, fetchMerkleTree, loading, error } = useFetchMerkleTree({
    chainId,
    airdropId,
    store: true,
    enabled: !!merkleTreeRegisteredAt,
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
          <Button size="sm" width="20" colorScheme="blue" onClick={airdropModalDisclosure.onOpen}>
            {t("airdrop.edit")}
          </Button>
          {airdropModalDisclosure.isOpen && (
            <AirdropFormModal
              chainId={chainId}
              airdropId={airdropId}
              ownerAddress={ownerAddress}
              isOpen={airdropModalDisclosure.isOpen}
              onClose={airdropModalDisclosure.onClose}
              callback={refetchAirdrop}
              initialData={{
                title,
                templateName,
                tokenAddress,
                tokenLogo,
              }}
              hasContract={!!contractAddress}
            />
          )}
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

                  {merkleTree && (
                    <Tooltip label={t("airdrop.preview")}>
                      <Link onClick={merkletreePreviewDisclosure.onOpen} ml={2}>
                        <Icon as={Search2Icon} mr={1} mb={1} />
                      </Link>
                    </Tooltip>
                  )}
                  {merkleTree && merkletreePreviewDisclosure.isOpen && (
                    <Modal
                      isOpen={merkletreePreviewDisclosure.isOpen}
                      onClose={merkletreePreviewDisclosure.onClose}
                      closeOnOverlayClick={false}
                      blockScrollOnMount={false}
                      isCentered={true}
                      size={"2xl"}
                      scrollBehavior={"inside"}
                    >
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>{t("airdrop.merkleTreePreview.heading")}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                          <PreviewList
                            chainId={chainId}
                            data={merkleTree}
                            decimals={tokenDecimals}
                            symbol={tokenSymbol}
                          />
                        </ModalBody>
                      </ModalContent>
                    </Modal>
                  )}
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
              disabled={!!contractRegisteredAt}
              onClick={merkletreeModalDisclosure.onOpen}
            >
              {t("airdrop.register")}
            </Button>
            {!contractRegisteredAt && merkletreeModalDisclosure.isOpen && (
              <MerkletreeFormModal
                chainId={chainId}
                airdropId={airdropId}
                ownerAddress={ownerAddress}
                tokenSymbol={tokenSymbol}
                tokenDecimals={tokenDecimals}
                isOpen={merkletreeModalDisclosure.isOpen}
                onClose={merkletreeModalDisclosure.onClose}
                refetchAirdrop={async () => {
                  refetchAirdrop();
                  fetchMerkleTree();
                }}
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
              {/* <Button
                onClick={() =>
                  sync.checkContractDeploymentAndSync({ callbacks: { onSuccess: refetchAirdrop } })
                }
              >
                Manual sync
              </Button> */}
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
                  isLoading={
                    withdrawToken.writeFn.status === "pending" ||
                    withdrawToken.waitResult?.isLoading
                  }
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
                  isLoading={
                    withdrawClaimFee.writeFn.status === "pending" ||
                    withdrawClaimFee.waitResult?.isLoading
                  }
                  disabled={withdrawClaimFee.prepareFn.isPending || !feeBalance.data?.value}
                  onClick={() => withdrawClaimFee.writeFn.write()}
                >
                  {t("airdrop.ownerMenu.withdraw")}
                </Button>
              </VStack>
            </>
          ) : (
            <>
              <Button
                variant={"solid"}
                colorScheme="blue"
                size={"sm"}
                isLoading={sync.loading}
                disabled={!merkleTreeRegisteredAt || sync.loading}
                onClick={contractModalDisclosure.onOpen}
              >
                {t("airdrop.register")}
              </Button>
              {contractModalDisclosure.isOpen && merkleTreeRegisteredAt && (
                <ContractFormModal
                  chainId={chainId}
                  airdropId={airdropId}
                  ownerAddress={ownerAddress}
                  tokenAddress={tokenAddress}
                  totalAirdropAmount={totalAirdropAmount}
                  templateName={templateName}
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
        <Divider />
        <HStack justify="space-between" py={2}>
          <Stack>
            <Text fontWeight="medium" color={"red"}>
              {" "}
              {t("airdrop.ownerMenu.deleteAirdropHeading")}
            </Text>
          </Stack>
          <>
            <Button
              colorScheme="red"
              isLoading={deleting}
              disabled={deleting}
              onClick={deleteConfirmationDisclosure.onOpen}
              py={2}
            >
              {t("airdrop.ownerMenu.deleteAirdrop")}
            </Button>
            <AlertDialog
              isOpen={deleteConfirmationDisclosure.isOpen}
              leastDestructiveRef={cancelRef}
              onClose={deleteConfirmationDisclosure.onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    <WarningIcon color={"red.400"} mr={1} />
                    {t("airdrop.ownerMenu.deleteAirdropHeading")}
                  </AlertDialogHeader>

                  <AlertDialogBody>{t("airdrop.ownerMenu.deleteAirdropHint")}</AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={deleteConfirmationDisclosure.onClose}>
                      {t("common.cancel")}
                    </Button>
                    <Button
                      colorScheme="red"
                      isLoading={deleting}
                      disabled={deleting}
                      onClick={() => deleteAirdrop(callbacks)}
                      ml={3}
                    >
                      {t("airdrop.ownerMenu.deleteAirdrop")}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>
        </HStack>
      </VStack>
    </Box>
  );
}
