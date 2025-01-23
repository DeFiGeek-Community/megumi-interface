"use client";
import { useFormik } from "formik";
import { isAddress } from "viem";
import { useReadContracts } from "wagmi";
import { useTranslation } from "react-i18next";
import {
  Button,
  HStack,
  chakra,
  FormLabel,
  FormErrorMessage,
  FormControl,
  useToast,
  Input,
  Spinner,
  Box,
  Text,
} from "@chakra-ui/react";
import { getErrorMessage } from "@/app/utils/shared";
import { AirdropNameABI, TemplateNamesType } from "@/app/lib/constants/templates";
import { useFetchMerkleTree } from "@/app/hooks/airdrops/useFetchMerkleTree";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { useUpdateContractAddress } from "@/app/hooks/airdrops/useUpdateContractAddress";

type NewContractFormProps = {
  chainId: number;
  airdropId: string;
  templateName: TemplateNamesType;
  ownerAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  merkleTreeRegisteredAt: Date | null;
  onClose: () => void;
  checkContractDeployment: (options?: {
    maxRetry?: number;
    callbacks?: { onSuccess?: () => void; onError?: () => void };
  }) => Promise<void>;
  refetchAirdrop: () => Promise<void>;
};

type ContractFormValues = {
  contractAddress: string;
};
export default function ExistingContractForm({
  chainId,
  airdropId,
  templateName,
  ownerAddress,
  tokenAddress,
  onClose,
  refetchAirdrop,
}: NewContractFormProps) {
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { merkleRoot } = useFetchMerkleTree({
    chainId,
    airdropId,
  });
  const { update, loading: updating, error: updateError } = useUpdateContractAddress();
  const handleSubmit = () => {
    update({
      params: { chainId, airdropId, contractAddress: formikProps.values.contractAddress },
      onSuccess: () => {
        toast({
          title: "Contract address updated",
          status: "success",
        });
        refetchAirdrop();
        onClose();
      },
      onError: (error: unknown) => {
        toast({
          title: getErrorMessage(error),
          status: "error",
        });
      },
    });
  };

  const validate = (value: ContractFormValues) => {
    const errors: any = {};

    if (!isAddress(value.contractAddress)) {
      errors.contractAddress = "Contract address is required";
    } else if (contract.data && Number(contract.data[0]) === 0) {
      errors.contractAddress = "Contract address is invalid";
    } else if (
      contract.data &&
      String(contract.data[0]).toLowerCase() !== merkleRoot?.toLowerCase()
    ) {
      errors.contractAddress = "Merkle root does not match";
    } else if (
      contract.data &&
      String(contract.data[1]).toLowerCase() !== ownerAddress.toLowerCase()
    ) {
      errors.contractAddress = "You are not the owner of the contract";
    } else if (
      contract.data &&
      String(contract.data[2]).toLowerCase() !== tokenAddress.toLowerCase()
    ) {
      errors.contractAddress = "Token address does not match";
    }

    // Check if the airdrop contract is registered on Factory
    // will be done on the backend

    return errors;
  };
  const initialValues: ContractFormValues = {
    contractAddress: "",
  };
  const formikProps = useFormik<ContractFormValues>({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: handleSubmit,
    validate: (value: ContractFormValues) => validate(value),
  });

  const abi = AirdropNameABI[templateName];
  const contract = useReadContracts({
    query: {
      enabled:
        !!formikProps.values.contractAddress && isAddress(formikProps.values.contractAddress),
    },
    allowFailure: false,
    contracts: [
      {
        address: formikProps.values.contractAddress as `0x${string}`,
        abi: abi,
        functionName: "merkleRoot",
      },
      {
        address: formikProps.values.contractAddress as `0x${string}`,
        abi: abi,
        functionName: "owner",
      },
      {
        address: formikProps.values.contractAddress as `0x${string}`,
        abi: abi,
        functionName: "token",
      },
    ],
  });

  return (
    <form onSubmit={formikProps.handleSubmit}>
      <HStack spacing={8} alignItems={"start"}>
        <chakra.div w={"full"}>
          <FormControl
            mt={4}
            isInvalid={
              !!formikProps.errors.contractAddress && !!formikProps.touched.contractAddress
            }
          >
            <FormLabel fontSize={"xs"} htmlFor="contractAddress" alignItems={"baseline"}>
              {t("airdrop.contractForm.existingContractAddress")}
              {/* <Tooltip
                        hasArrow
                        label={""}
                      >
                        <QuestionIcon mb={1} ml={1} />
                      </Tooltip> */}
            </FormLabel>
            <Input
              id="contractAddress"
              name="contractAddress"
              onBlur={formikProps.handleBlur}
              onChange={formikProps.handleChange}
              value={formikProps.values.contractAddress}
              placeholder="e.g. 0x0123456789012345678901234567890123456789"
            />
            <FormErrorMessage>{formikProps.errors.contractAddress}</FormErrorMessage>
            <Box>
              {contract.isLoading && <Spinner />}
              {contract.data && (
                <>
                  <Text fontSize={"sm"} mt={2} color={"gray.400"}>
                    Merkle Root:{" "}
                  </Text>
                  <Text fontSize={"sm"} mt={1} color={"gray.400"}>
                    {String(contract.data[0]).toLowerCase() === merkleRoot?.toLowerCase() ? (
                      <CheckCircleIcon color="green.500" />
                    ) : (
                      <WarningIcon color="red.500" />
                    )}
                    <chakra.span ml={1} fontSize={"xs"}>
                      {String(contract.data[0])}
                    </chakra.span>
                  </Text>
                </>
              )}
            </Box>
            <Box>
              {contract.data && (
                <>
                  <Text fontSize={"sm"} mt={2} color={"gray.400"}>
                    Owner:{" "}
                  </Text>
                  <Text fontSize={"sm"} mt={1} color={"gray.400"}>
                    {String(contract.data[1]).toLowerCase() === ownerAddress.toLowerCase() ? (
                      <CheckCircleIcon color="green.500" />
                    ) : (
                      <WarningIcon color="red.500" />
                    )}
                    <chakra.span ml={1} fontSize={"xs"}>
                      {String(contract.data[1])}
                    </chakra.span>
                  </Text>
                </>
              )}
            </Box>
            <Box>
              {contract.data && (
                <>
                  <Text fontSize={"sm"} mt={2} color={"gray.400"}>
                    Token:{" "}
                  </Text>
                  <Text fontSize={"sm"} mt={1} color={"gray.400"}>
                    {String(contract.data[2]).toLowerCase() === tokenAddress.toLowerCase() ? (
                      <CheckCircleIcon color="green.500" />
                    ) : (
                      <WarningIcon color="red.500" />
                    )}
                    <chakra.span ml={1} fontSize={"xs"}>
                      {String(contract.data[2])}
                    </chakra.span>
                  </Text>
                </>
              )}
            </Box>
          </FormControl>
        </chakra.div>
      </HStack>

      <Button
        mt={4}
        w={"full"}
        variant="solid"
        colorScheme="green"
        type="submit"
        isLoading={contract.isLoading || updating}
        disabled={!contract.data || contract.isLoading || updating || !formikProps.isValid}
      >
        {t("airdrop.contractForm.attach")}
      </Button>
    </form>
  );
}
