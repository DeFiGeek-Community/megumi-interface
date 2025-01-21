"use client";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import {
  Button,
  HStack,
  chakra,
  FormErrorMessage,
  FormControl,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
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
import { FiFile } from "react-icons/fi";
import { useUploadMerkletree } from "@/app/hooks/airdrops/useUploadMerkletree";
import { MerkleDistributorInfo } from "@/app/types/airdrop";
import PreviewList from "./PreviewList";
import { getErrorMessage } from "@/app/utils/shared";
import { validateMerkleTree } from "@/app/utils/airdrop";

type UploadFormProps = {
  chainId: number;
  airdropId: string;
  callbacks?: {
    onSuccess?: () => void;
    onError?: (error: string) => void;
  };
};

type MerkletreeFileFormValues = {
  fileinput?: string;
};
export default function UploadForm({ chainId, airdropId, callbacks }: UploadFormProps) {
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [merkleTree, setMerkleTree] = useState<MerkleDistributorInfo | null>(null);
  const [merkleTreeLoading, setMerkleTreeLoading] = useState<boolean>(false);
  const {
    upload,
    loading: uploading,
    error: uploadError,
  } = useUploadMerkletree(chainId, airdropId);

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
  const handleSubmit = async (data: MerkletreeFileFormValues) => {
    // formikProps.validateForm();
    if (!file) return;
    setMerkleTreeLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === "string") {
        try {
          const data = JSON.parse(text);
          const { valid, error } = validateMerkleTree(data);
          if (!valid) {
            formikProps.setErrors({ fileinput: error?.message });
            return;
          }
          formikProps.setErrors({});
          setMerkleTree(data);
          onOpen();
        } catch (error: unknown) {
          toast({ title: getErrorMessage(error), status: "error" });
        }
      } else {
        formikProps.setErrors({ fileinput: "Invalid format" });
      }
      setMerkleTreeLoading(false);
    };
    reader.readAsText(file);
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

  useEffect(() => {
    formikProps.validateForm();
  }, [file]);

  return (
    <form onSubmit={formikProps.handleSubmit}>
      <HStack spacing={8} alignItems={"start"}>
        <chakra.div w={"full"}>
          <FormControl isInvalid={!file && formikProps.submitCount > 0}>
            <p>{t("airdrop.merkletreeForm.uploadListFileHint")}</p>
            <InputGroup>
              <InputLeftElement pointerEvents="none" children={<Icon as={FiFile} />} />
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
          isLoading={merkleTreeLoading || uploading}
          disabled={!formikProps.isValid}
        >
          {t("airdrop.merkletreeForm.register")}
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
