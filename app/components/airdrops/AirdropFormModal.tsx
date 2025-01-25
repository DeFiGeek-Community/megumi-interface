"use client";
import { useTranslation } from "react-i18next";
import { isAddress } from "viem";
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
  FormLabel,
  Select,
  Text,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { URL_REGEX } from "@/app/lib/constants";
import { useCreateAirdrop } from "@/app/hooks/airdrops/useCreateAirdrop";
import { TemplateNames, TemplateNamesType } from "@/app/lib/constants/templates";
import { AirdropHex } from "@/app/types/airdrop";
import useToken from "@/app/hooks/common/useToken";

type AirdropFormModalProps = {
  chainId: number;
  airdropId?: string; // Edit mode if airdropId is provided
  ownerAddress: `0x${string}`;
  isOpen: boolean;
  onClose: () => void;
  callback?: (airdrop: AirdropHex) => void;
  initialData?: Omit<AirdropFormValues, "tokenLogo"> & { tokenLogo: string | null };
  hasContract?: boolean;
};

type AirdropFormValues = {
  title: string;
  tokenAddress: string;
  templateName: TemplateNamesType;
  tokenLogo: string;
};
export default function AirdropFormModal({
  chainId,
  airdropId,
  ownerAddress,
  isOpen,
  onClose,
  callback,
  initialData,
  hasContract = false,
}: AirdropFormModalProps) {
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { updateOrCreateAirdrop, loading } = useCreateAirdrop();

  const handleSubmit = async (data: AirdropFormValues) => {
    const successMessage = airdropId ? "Airdrop updated" : "Airdrop created";
    updateOrCreateAirdrop({
      params: {
        chainId,
        airdropId,
        owner: ownerAddress,
        title: data.title,
        tokenAddress: data.tokenAddress,
        templateName: data.templateName,
        tokenLogo: data.tokenLogo ? data.tokenLogo : undefined,
      },
      onSuccess: (airdrop: AirdropHex) => {
        toast({
          title: successMessage,
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
      errors.title = "Title is required";
    }
    if (value.title && value.title.length > 200) {
      errors.title = "Max length is 200";
    }
    if (value.tokenLogo && !URL_REGEX.test(value.tokenLogo)) {
      errors.tokenLogo = "Invalid URL format";
    }
    if (value.tokenLogo && value.tokenLogo.length > 200) {
      errors.tokenLogo = "Max length is 200";
    }
    if (!value.tokenAddress) {
      errors.tokenAddress = "Token address is required";
    } else if (value.tokenAddress && (!isAddress(value.tokenAddress) || !token)) {
      errors.tokenAddress = "Token address is invalid";
    } else if (token.isError) {
      errors.tokenAddress = token.error.message;
    }
    return errors;
  };

  const initialValues: AirdropFormValues =
    airdropId && initialData
      ? { ...initialData, tokenLogo: initialData.tokenLogo || "" }
      : {
          title: "",
          tokenAddress: "",
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

  const token = useToken(formikProps.values.tokenAddress);

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
          <ModalHeader>
            {airdropId
              ? t("airdrop.airdropForm.headerUpdate")
              : t("airdrop.airdropForm.headerCreation")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={formikProps.handleSubmit}>
              <HStack spacing={8} alignItems={"start"}>
                <chakra.div w={"full"}>
                  <FormControl
                    mt={4}
                    isInvalid={!!formikProps.errors.title && !!formikProps.touched.title}
                  >
                    <FormLabel fontSize={"xs"} htmlFor="title" alignItems={"baseline"}>
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
                    isInvalid={
                      !!formikProps.errors.tokenAddress && !!formikProps.touched.tokenAddress
                    }
                  >
                    <FormLabel fontSize={"xs"} htmlFor="tokenAddress" alignItems={"baseline"}>
                      {t("airdrop.airdropForm.tokenAddress")}
                      {/* <Tooltip
                        hasArrow
                        label={""}
                      >
                        <QuestionIcon mb={1} ml={1} />
                      </Tooltip> */}
                    </FormLabel>
                    <Input
                      id="tokenAddress"
                      name="tokenAddress"
                      readOnly={hasContract}
                      disabled={hasContract}
                      onBlur={formikProps.handleBlur}
                      onChange={(event: React.ChangeEvent<any>) => {
                        formikProps.setFieldTouched("amount");
                        formikProps.handleChange(event);
                      }}
                      value={formikProps.values.tokenAddress ? formikProps.values.tokenAddress : ""}
                      placeholder="e.g. 0x0123456789012345678901234567890123456789"
                    />
                    <FormErrorMessage>{formikProps.errors.tokenAddress}</FormErrorMessage>
                    <Box>
                      {token.isLoading && <Spinner />}
                      {token.data && (
                        <Text textAlign={"right"} fontSize={"sm"} mt={1} color={"gray.400"}>
                          {token.data.name} ({token.data.symbol})
                        </Text>
                      )}
                    </Box>
                  </FormControl>

                  <FormControl
                    mt={4}
                    isInvalid={!!formikProps.errors.tokenLogo && !!formikProps.touched.tokenLogo}
                  >
                    <FormLabel fontSize={"xs"} htmlFor="tokenLogo" alignItems={"baseline"}>
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
                    <FormLabel fontSize={"xs"} htmlFor="templateName" alignItems={"baseline"}>
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
                  disabled={!formikProps.isValid || loading}
                >
                  {airdropId ? t("airdrop.airdropForm.update") : t("airdrop.airdropForm.register")}
                </Button>
              </>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
