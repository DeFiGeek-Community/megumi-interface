"use client";
import { useRef, useState } from "react";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import {
  Button,
  HStack,
  chakra,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormErrorMessage,
  FormControl,
  useToast,
  Input,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
  InputGroup,
  InputLeftElement,
  Icon,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import { useUploadMerkletree } from "@/app/hooks/airdrops/useUploadMerkletree";

type MerkletreeFormModalProps = {
  chainId: number;
  airdropId: string;
  ownerAddress: `0x${string}`;
  isOpen: boolean;
  onOpen: () => void;
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
  isOpen,
  onOpen,
  onClose,
  refetchAirdrop,
}: MerkletreeFormModalProps) {
  const {
    address,
    isConnecting,
    isReconnecting,
    isConnected: isConnectedRaw,
  } = useRequireAccount();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { upload, loading, error } = useUploadMerkletree(chainId, airdropId);

  const handleSubmit = async (data: MerkletreeFileFormValues) => {
    formikProps.validateForm();
    if (!file) return;
    await upload(file, {
      onSuccess: () => {
        toast({ title: "Uplaod succeeded", status: "success" });
        refetchAirdrop();
        onClose();
      },
      onError: (error) => {
        toast({ title: error, status: "error" });
      },
    });
  };

  const validate = (value: MerkletreeFileFormValues) => {
    const errors: any = {};

    if (!file) {
      errors["file"] = "File is required";
    }
    return errors;
  };
  const initialValues: MerkletreeFileFormValues = {};
  const formikProps = useFormik<MerkletreeFileFormValues>({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: handleSubmit,
    validate: (value: MerkletreeFileFormValues) => validate(value),
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        blockScrollOnMount={false}
        isCentered={true}
        size={"2xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("airdrop.merkletreeForm.register")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs isFitted>
              <TabList>
                <Tab fontSize={"xs"}>{t("airdrop.merkletreeForm.uploadListFile")}</Tab>
                <Tab fontSize={"xs"} isDisabled>
                  {t("airdrop.merkletreeForm.manual")}
                </Tab>
                <Tab fontSize={"xs"} isDisabled>
                  {t("airdrop.merkletreeForm.snapshot")}
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <form onSubmit={formikProps.handleSubmit}>
                    <HStack spacing={8} alignItems={"start"}>
                      <chakra.div w={"full"}>
                        <FormControl isInvalid={!file && formikProps.submitCount > 0}>
                          <p>{t("airdrop.merkletreeForm.uploadListFileHint")}</p>
                          <InputGroup>
                            <InputLeftElement
                              pointerEvents="none"
                              children={<Icon as={FiFile} />}
                            />
                            <input
                              type="file"
                              accept={"application/json"}
                              ref={inputRef}
                              onChange={(e) => {
                                e.target.files && setFile(e.target.files[0]);
                                setTimeout(() => {
                                  formikProps.validateForm();
                                }, 10);
                              }}
                              style={{ display: "none" }}
                            ></input>
                            <Input
                              placeholder={"Airdrop list file"}
                              onClick={() => inputRef.current?.click()}
                              onChange={(e) => {}}
                              value={file ? file.name : ""}
                              cursor={"pointer"}
                            />
                          </InputGroup>
                          <FormErrorMessage>{"File is required"}</FormErrorMessage>
                        </FormControl>
                      </chakra.div>
                    </HStack>

                    <>
                      <Button
                        mt={4}
                        w={"full"}
                        variant="solid"
                        colorScheme="green"
                        type="submit"
                        isLoading={loading}
                        disabled={!formikProps.isValid}
                      >
                        {t("airdrop.contractForm.deploy")}
                      </Button>
                    </>
                  </form>
                </TabPanel>
                <TabPanel>
                  <p>TODO</p>
                </TabPanel>
                <TabPanel>
                  <p>TODO</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
