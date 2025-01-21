"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import {
  Button,
  HStack,
  chakra,
  FormErrorMessage,
  FormControl,
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
} from "@chakra-ui/react";
import { useUploadMerkletree } from "@/app/hooks/airdrops/useUploadMerkletree";
import PreviewList from "./PreviewList";
import { MerkleDistributorInfo } from "@/app/types/airdrop";
import {
  generateAirdropListFromText,
  validate as validateManualList,
} from "@/app/utils/merkleTree/manual";
import { getErrorMessage } from "@/app/utils/shared";

type ManualFormProps = {
  chainId: number;
  airdropId: string;
  callbacks?: {
    onSuccess?: () => void;
    onError?: (error: string) => void;
  };
};

type FormValues = {
  text: string;
};

export default function ManualForm({ chainId, airdropId, callbacks }: ManualFormProps) {
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const [merkleTree, setMerkleTree] = useState<MerkleDistributorInfo | null>(null);
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
    try {
      const merkleTree = generateAirdropListFromText(data.text);
      if (merkleTree) {
        setMerkleTree(merkleTree);
        onOpen();
      }
    } catch (error: unknown) {
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const validate = (value: FormValues) => {
    const errors: any = {};

    const { valid, error } = validateManualList(value.text);

    if (!valid) {
      errors["text"] = error;
    }

    return errors;
  };
  const initialValues: FormValues = {
    text: "",
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

  return (
    <form onSubmit={formikProps.handleSubmit}>
      <HStack spacing={8} alignItems={"start"}>
        <chakra.div w={"full"}>
          <FormControl mt={4} isInvalid={!!formikProps.errors.text && !!formikProps.touched.text}>
            <FormLabel htmlFor="text" alignItems={"baseline"}>
              {t("airdrop.manualForm.text")}
            </FormLabel>
            <Textarea
              id="text"
              name="text"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.text}
              placeholder="0x0123456789012345678901234567890123456789,1000000000
              0x0123456789012345678901234567890123456789,1000000000"
            />
            <FormErrorMessage>{formikProps.errors.text}</FormErrorMessage>
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
          isLoading={uploading}
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
              <PreviewList data={merkleTree} decimals={0} />
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
