"use client";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
} from "@chakra-ui/react";
import UploadForm from "./uploadForm";
import SnapshotForm from "./snapshotForm";
import ManualForm from "./manualForm";

type MerkletreeFormModalProps = {
  chainId: number;
  airdropId: string;
  ownerAddress: `0x${string}`;
  tokenDecimals: number;
  tokenSymbol: string;
  isOpen: boolean;
  onClose: () => void;
  refetchAirdrop: () => Promise<void>;
};

type MerkletreeFileFormValues = {
  fileinput?: string;
};
export default function MerkletreeFormModal({
  chainId,
  airdropId,
  ownerAddress,
  tokenDecimals,
  tokenSymbol,
  isOpen,
  onClose,
  refetchAirdrop,
}: MerkletreeFormModalProps) {
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });

  const callbacks = {
    onSuccess: () => {
      toast({ title: "Upload succeeded", status: "success" });
      refetchAirdrop();
      onClose();
    },
    onError: (error: string) => {
      toast({ title: error, status: "error" });
    },
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        blockScrollOnMount={false}
        size={"2xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("airdrop.merkletreeForm.register")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs isFitted>
              <TabList>
                <Tab fontSize={"xs"}>{t("airdrop.merkletreeForm.snapshot")}</Tab>
                <Tab fontSize={"xs"}>{t("airdrop.merkletreeForm.manual")}</Tab>
                <Tab fontSize={"xs"}>{t("airdrop.merkletreeForm.uploadListFile")}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <SnapshotForm
                    chainId={chainId}
                    airdropId={airdropId}
                    airdropTokenDecimals={tokenDecimals}
                    airdropTokenSymbol={tokenSymbol}
                    callbacks={callbacks}
                  />
                </TabPanel>
                <TabPanel>
                  <ManualForm
                    chainId={chainId}
                    airdropId={airdropId}
                    airdropTokenDecimals={tokenDecimals}
                    airdropTokenSymbol={tokenSymbol}
                    callbacks={callbacks}
                  />
                </TabPanel>
                <TabPanel>
                  <UploadForm
                    chainId={chainId}
                    airdropId={airdropId}
                    airdropTokenDecimals={tokenDecimals}
                    airdropTokenSymbol={tokenSymbol}
                    callbacks={callbacks}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
