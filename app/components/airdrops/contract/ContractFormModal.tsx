"use client";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import {
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
} from "@chakra-ui/react";
import NewContractForm from "./NewContractForm";

type ContractFormModalProps = {
  chainId: number;
  airdropId: string;
  totalAirdropAmount: string | null;
  ownerAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  checkContractDeployment: (options?: {
    maxRetry?: number;
    callbacks?: { onSuccess?: () => void; onError?: () => void };
  }) => Promise<void>;
  refetchAirdrop: () => Promise<void>;
};

export default function ContractFormModal({ isOpen, onClose, ...props }: ContractFormModalProps) {
  const { data: session } = useSession();
  const { t } = useTranslation();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        blockScrollOnMount={false}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("airdrop.contractForm.registerContract")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {!session ? (
              <Spinner />
            ) : (
              <Tabs isFitted>
                <TabList>
                  <Tab fontSize={"xs"}>{t("airdrop.contractForm.new")}</Tab>
                  <Tab fontSize={"xs"}>{t("airdrop.contractForm.existing")}</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <NewContractForm session={session} onClose={onClose} {...props} />
                  </TabPanel>
                  <TabPanel>TODO</TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
