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
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import { URL_REGEX } from "@/app/lib/constants";
import { useCreateAirdrop } from "@/app/hooks/airdrops/useCreateAirdrop";
import { TemplateNames, TemplateNamesType } from "@/app/lib/constants/templates";
import { AirdropHex } from "@/app/types/airdrop";

type AirdropFormModalProps = {
  chainId: number;
  airdropId?: string; // Edit mode if airdropId is provided
  ownerAddress: `0x${string}`;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  callback?: (airdrop: AirdropHex) => void;
};

type AirdropFormValues = {
  title: string;
  templateName: TemplateNamesType;
  tokenLogo: string;
};
export default function AirdropFormModal({
  chainId,
  airdropId,
  ownerAddress,
  isOpen,
  onOpen,
  onClose,
  callback,
}: AirdropFormModalProps) {
  const {
    address,
    isConnecting,
    isReconnecting,
    isConnected: isConnectedRaw,
  } = useRequireAccount();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { createAirdrop, loading } = useCreateAirdrop();

  const handleSubmit = async (data: AirdropFormValues) => {
    createAirdrop({
      params: {
        chainId,
        owner: ownerAddress,
        title: data.title,
        templateName: data.templateName,
        tokenLogo: data.tokenLogo ? data.tokenLogo : undefined,
      },
      onSuccess: (airdrop: AirdropHex) => {
        toast({
          title: "Airdrop created",
          status: "success",
        });
        onClose();
        callback && callback(airdrop);
      },
      onError: (e) => {
        toast({
          title: `${e}`,
          status: "error",
        });
      },
    });
  };

  const validate = (value: AirdropFormValues) => {
    const errors: any = {};

    if (!value.title) {
      errors["title"] = "Title is required";
    }
    if (value.title && value.title.length > 200) {
      errors["title"] = "Max length is 200";
    }
    if (value.tokenLogo && !URL_REGEX.test(value.tokenLogo)) {
      errors.tokenLogo = "Invalid URL format";
    }
    if (value.tokenLogo && value.tokenLogo.length > 200) {
      errors.tokenLogo = "Max length is 200";
    }
    return errors;
  };
  const initialValues: AirdropFormValues = {
    title: "",
    templateName: TemplateNames.Standard,
    tokenLogo: "",
  };
  const formikProps = useFormik<AirdropFormValues>({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: handleSubmit,
    validate: (value: AirdropFormValues) => validate(value),
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        blockScrollOnMount={false}
        isCentered={true}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("airdrop.merkletreeForm.register")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={formikProps.handleSubmit}>
              <HStack spacing={8} alignItems={"start"}>
                <chakra.div w={"full"}>
                  <FormControl
                    mt={4}
                    isInvalid={!!formikProps.errors.title && !!formikProps.touched.title}
                  >
                    <FormLabel htmlFor="title" alignItems={"baseline"}>
                      {t("airdrop.airdropForm.title")}
                    </FormLabel>
                    <Input
                      id="title"
                      name="title"
                      maxLength={200}
                      onBlur={formikProps.handleBlur}
                      onChange={formikProps.handleChange}
                      value={formikProps.values.title}
                      placeholder={"Airdrop title"}
                    />
                    <FormErrorMessage>{formikProps.errors.title}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    mt={4}
                    isInvalid={!!formikProps.errors.tokenLogo && !!formikProps.touched.tokenLogo}
                  >
                    <FormLabel htmlFor="tokenLogo" alignItems={"baseline"}>
                      {t("airdrop.airdropForm.tokenLogo")}
                    </FormLabel>
                    <Input
                      id="tokenLogo"
                      name="tokenLogo"
                      maxLength={200}
                      onBlur={formikProps.handleBlur}
                      onChange={formikProps.handleChange}
                      value={formikProps.values.tokenLogo}
                      placeholder={"Logo URL"}
                    />
                    <FormErrorMessage>{formikProps.errors.tokenLogo}</FormErrorMessage>
                  </FormControl>

                  <FormControl mt={4}>
                    <FormLabel htmlFor="templateName" alignItems={"baseline"}>
                      {t("airdrop.airdropForm.templateName")}
                    </FormLabel>
                    <Select
                      isDisabled={true}
                      id="templateName"
                      name="templateName"
                      value={formikProps.values.templateName}
                    >
                      <option value={TemplateNames.Standard}>{t(`dashboard.Standard`)}</option>
                    </Select>
                    <FormErrorMessage>{formikProps.errors.tokenLogo}</FormErrorMessage>
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
                  {t("airdrop.airdropForm.register")}
                </Button>
              </>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
