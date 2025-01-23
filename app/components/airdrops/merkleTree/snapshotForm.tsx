"use client";
import { useEffect } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import {
  Button,
  HStack,
  chakra,
  FormErrorMessage,
  FormControl,
  Input,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
  NumberInputStepper,
  NumberDecrementStepper,
  FormLabel,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  ModalFooter,
  Box,
  Spinner,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useUploadMerkletree } from "@/app/hooks/airdrops/useUploadMerkletree";
import { isAddress } from "viem";
import { useGenerateMerkleTree } from "@/app/hooks/airdrops/useGenerateMerkleTree";
import PreviewList from "./PreviewList";
import { MerkleDistributorInfo } from "@/app/types/airdrop";
import useToken from "@/app/hooks/common/useToken";
import { toMinUnit } from "@/app/utils/clientHelper";

type SnapshotFormProps = {
  chainId: number;
  airdropId: string;
  airdropTokenDecimals: number;
  airdropTokenSymbol: string;
  callbacks?: {
    onSuccess?: () => void;
    onError?: (error: string) => void;
  };
};

type FormValues = {
  tokenAmount: string;
  snapshotBlockNumber: string;
  snapshotTokenAddress: string;
  ignoreList?: string;
  minAmount?: string;
};

export default function SnapshotForm({
  chainId,
  airdropId,
  airdropTokenDecimals,
  airdropTokenSymbol,
  callbacks,
}: SnapshotFormProps) {
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const {
    generateMerkleTree,
    merkleTree,
    loading: generating,
    error: generateError,
  } = useGenerateMerkleTree(chainId, airdropId);
  const {
    upload,
    loading: uploading,
    error: uploadError,
  } = useUploadMerkletree(chainId, airdropId);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onSuccess = () => {
    callbacks?.onSuccess?.();
    onClose();
  };

  const uploadGeneratedMerkleTree = async (data: MerkleDistributorInfo) => {
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const payload = new File([blob], "file", { type: "application/json" });
    await upload(payload, { ...callbacks, onSuccess });
  };

  const handleSubmit = async (data: FormValues) => {
    await generateMerkleTree(
      {
        snapshotTokenAddress: data.snapshotTokenAddress as `0x${string}`,
        untilBlock: parseInt(data.snapshotBlockNumber),
        totalAirdropAmount: toMinUnit(data.tokenAmount, airdropTokenDecimals).toString(),
        ignoreAddresses: data.ignoreList
          ? (data.ignoreList.trim().split(/\r?\n/) as `0x${string}`[])
          : [],
        minAmount:
          snapshotToken.data && data.minAmount
            ? toMinUnit(data.minAmount, snapshotToken.data.decimals).toString()
            : undefined,
      },
      { onError: callbacks?.onError },
    );
    if (merkleTree) {
      onOpen();
    }
  };

  const validate = (value: FormValues) => {
    const errors: any = {};

    if (!value.tokenAmount) {
      errors["tokenAmount"] = "tokenAmount is required";
    }
    try {
      BigInt(value.tokenAmount);
    } catch (e) {
      errors.tokenAmount = "tokenAmount is invalid";
    }
    if (!value.snapshotBlockNumber) {
      errors.snapshotBlockNumber = "snapshotBlockNumber is required";
    }

    if (!value.snapshotTokenAddress) {
      errors.snapshotTokenAddress = "snapshotTokenAddress address is required";
    } else if (
      value.snapshotTokenAddress &&
      (!isAddress(value.snapshotTokenAddress) || !snapshotToken)
    ) {
      errors.snapshotTokenAddress = "snapshotTokenAddress address is invalid";
    } else if (snapshotToken.isError) {
      errors.snapshotTokenAddress = snapshotToken.error.message;
    }
    if (
      value.minAmount &&
      snapshotToken.data &&
      toMinUnit(value.minAmount, snapshotToken.data.decimals) === 0n
    ) {
      errors.minAmount = "minAmount is too small";
    }

    if (value.ignoreList) {
      let spl = value.ignoreList.trim().split(/\r?\n/);
      spl.forEach(function (elm) {
        if (!isAddress(elm)) {
          errors.ignoreList = "ignoreList is invalid";
        }
      });
    }
    return errors;
  };
  const initialValues: FormValues = {
    tokenAmount: "",
    snapshotBlockNumber: "",
    snapshotTokenAddress: "",
    ignoreList: "",
    minAmount: "",
  };
  const formikProps = useFormik<FormValues>({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: handleSubmit,
    validate: (value: FormValues) => validate(value),
  });

  useEffect(() => {
    merkleTree && onOpen();
  }, [merkleTree]);

  const snapshotToken = useToken(formikProps.values.snapshotTokenAddress);

  return (
    <form onSubmit={formikProps.handleSubmit}>
      <HStack spacing={8} alignItems={"start"}>
        <chakra.div w={"full"}>
          <FormControl
            mt={4}
            isInvalid={!!formikProps.errors.tokenAmount && !!formikProps.touched.tokenAmount}
          >
            <FormLabel htmlFor="tokenAmount" alignItems={"baseline"}>
              {t("airdrop.snapshotForm.tokenAmount")}
            </FormLabel>
            <Flex>
              <NumberInput
                flex="1"
                id="tokenAmount"
                name="tokenAmount"
                onBlur={formikProps.handleBlur}
                value={formikProps.values.tokenAmount}
                onChange={(strVal: string, val: number) =>
                  formikProps.setFieldValue(
                    "tokenAmount",
                    strVal && Number(strVal) === val ? strVal : isNaN(val) ? 0 : val,
                  )
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <chakra.div px={2} minW={"4rem"} whiteSpace={"nowrap"}>
                {airdropTokenSymbol}
              </chakra.div>
            </Flex>
            <FormErrorMessage>{formikProps.errors.tokenAmount}</FormErrorMessage>
          </FormControl>

          <FormControl
            mt={4}
            isInvalid={
              !!formikProps.errors.snapshotBlockNumber && !!formikProps.touched.snapshotBlockNumber
            }
          >
            <FormLabel alignItems={"baseline"}>
              {t("airdrop.snapshotForm.snapshotBlockNumber")}
            </FormLabel>

            <NumberInput
              flex="1"
              id="snapshotBlockNumber"
              name="snapshotBlockNumber"
              value={formikProps.values.snapshotBlockNumber}
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              onBlur={formikProps.handleBlur}
              onChange={(strVal: string, val: number) =>
                formikProps.setFieldValue(
                  "snapshotBlockNumber",
                  strVal && Number(strVal) === val ? strVal : isNaN(val) ? 0 : val,
                )
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl
            mt={4}
            isInvalid={
              !!formikProps.errors.snapshotTokenAddress &&
              !!formikProps.touched.snapshotTokenAddress
            }
          >
            <FormLabel htmlFor="snapshotTokenAddress" alignItems={"baseline"}>
              {t("airdrop.snapshotForm.snapshotTokenAddress")}
            </FormLabel>
            <Input
              id="snapshotTokenAddress"
              name="snapshotTokenAddress"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.snapshotTokenAddress}
              placeholder="e.g. 0x0123456789012345678901234567890123456789"
            />
            <FormErrorMessage>{formikProps.errors.snapshotTokenAddress}</FormErrorMessage>
            <Box>
              {snapshotToken.isLoading && <Spinner mt={1} textAlign={"right"} />}
              {snapshotToken.data && (
                <Text textAlign={"right"} fontSize={"sm"} mt={1} color={"gray.400"}>
                  {snapshotToken.data.name} ({snapshotToken.data.symbol})
                </Text>
              )}
            </Box>
          </FormControl>

          <FormControl
            mt={4}
            isInvalid={!!formikProps.errors.minAmount && !!formikProps.touched.minAmount}
          >
            <FormLabel htmlFor="minAmount" alignItems={"baseline"}>
              {t("airdrop.snapshotForm.minAmount")}
            </FormLabel>
            <Flex alignItems={"baseline"}>
              <NumberInput
                flex="1"
                id="minAmount"
                name="minAmount"
                onBlur={formikProps.handleBlur}
                min={0}
                step={0.001}
                onChange={(strVal: string, val: number) =>
                  formikProps.setFieldValue(
                    "minAmount",
                    strVal && Number(strVal) === val ? strVal : isNaN(val) ? 0 : val,
                  )
                }
                value={formikProps.values.minAmount}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <chakra.div px={2} minW={"4rem"} whiteSpace={"nowrap"}>
                {snapshotToken.data && snapshotToken.data.symbol}
              </chakra.div>
            </Flex>
            <FormErrorMessage>{formikProps.errors.minAmount}</FormErrorMessage>
          </FormControl>

          <FormControl
            mt={4}
            isInvalid={!!formikProps.errors.ignoreList && !!formikProps.touched.ignoreList}
          >
            <FormLabel htmlFor="ignoreList" alignItems={"baseline"}>
              {t("airdrop.snapshotForm.ignoreList")}
            </FormLabel>
            <Textarea
              id="ignoreList"
              name="ignoreList"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.ignoreList}
              placeholder="0x0123456789012345678901234567890123456789
              0x0123456789012345678901234567890123456789"
            />
            <FormErrorMessage>{formikProps.errors.ignoreList}</FormErrorMessage>
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
          isLoading={generating || uploading}
          disabled={!formikProps.isValid}
        >
          {t("airdrop.merkletreeForm.generate")}
        </Button>
      </>
      {merkleTree && isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
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
                decimals={airdropTokenDecimals}
                symbol={airdropTokenSymbol}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                mt={4}
                w={"full"}
                variant="solid"
                colorScheme="green"
                isLoading={uploading}
                disabled={!formikProps.isValid}
                onClick={() => uploadGeneratedMerkleTree(merkleTree)}
              >
                {t("airdrop.merkletreeForm.register")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </form>
  );
}
