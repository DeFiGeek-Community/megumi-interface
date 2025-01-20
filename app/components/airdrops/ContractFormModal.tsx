"use client";
import { useEffect } from "react";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { erc20Abi, isAddress } from "viem";
import { useReadContract } from "wagmi";
import { useTranslation } from "react-i18next";
import {
  Button,
  HStack,
  Flex,
  chakra,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  FormErrorMessage,
  FormControl,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
  NumberInputStepper,
  NumberDecrementStepper,
  useToast,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import useApprove from "@/app/hooks/common/useApprove";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import useToken from "@/app/hooks/common/useToken";
import { formatAmount } from "@/app/utils/clientHelper";
import { uuidToHex } from "@/app/utils/shared";
import { TemplateType } from "@/app/lib/constants/templates";
import useDeployAirdrop from "@/app/hooks/airdrops/useDeployAirdrop";
import { useFetchMerkleRoot } from "@/app/hooks/airdrops/useFetchMerkleRoot";
import { on } from "events";

type ContractFormModalProps = {
  chainId: number;
  airdropId: string;
  totalAirdropAmount: string | null;
  ownerAddress: `0x${string}`;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  checkContractDeployment: (callbacks?: {
    onSuccess?: () => void;
    onError?: () => void;
  }) => Promise<void>;
  refetchAirdrop: () => Promise<void>;
};

type ContractFormValues = {
  tokenAddress: string;
  amount: string;
  merkleRoot: `0x${string}` | null;
};
export default function ContractFormModal({
  chainId,
  airdropId,
  totalAirdropAmount,
  ownerAddress,
  isOpen,
  onOpen,
  onClose,
  checkContractDeployment,
  refetchAirdrop,
}: ContractFormModalProps) {
  const {
    address,
    isConnecting,
    isReconnecting,
    isConnected: isConnectedRaw,
  } = useRequireAccount();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { merkleRoot, fetchMerklrRoot, loading, error } = useFetchMerkleRoot(chainId, airdropId);
  const handleSubmit = () => {
    writeFn.write({
      onSuccess: () => {
        checkContractDeployment({ onSuccess: () => refetchAirdrop() });
        refetchAirdrop();
        onClose();
      },
    });
  };

  const validate = (value: ContractFormValues) => {
    const errors: any = {};
    if (!isAddress(value.tokenAddress)) {
      errors.tokenAddress = "Token address is required";
    }
    if (!value.amount) {
      errors.amount = "Amount is required";
    }
    if (merkleRoot === null) {
      errors.merkleRoot = "MerkleRoot is required";
    }
    return errors;
  };
  const initialValues: ContractFormValues = {
    tokenAddress: "",
    amount: "0",
    merkleRoot: null,
  };
  const formikProps = useFormik<ContractFormValues>({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: handleSubmit,
    validate: (value: ContractFormValues) => validate(value),
  });

  const { data: token } = useToken(formikProps.values.tokenAddress);

  const approvals = useApprove({
    chainId,
    targetAddress: formikProps.values.tokenAddress as `0x${string}`,
    owner: session?.user.address,
    spender: CONTRACT_ADDRESSES[chainId].FACTORY,
    amount: BigInt(
      parseInt(formikProps.values.amount) * 10 ** (token?.decimals ? token?.decimals : 18),
    ),
    enabled: isAddress(formikProps.values.tokenAddress),
  });

  const { data: balance } = useReadContract({
    address: formikProps.values.tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [session?.user.address || "0x"],
    query: {
      enabled: !!session?.user.address && isAddress(formikProps.values.tokenAddress),
    },
  });

  const { prepareFn, writeFn, waitResult } = useDeployAirdrop({
    chainId,
    type: TemplateType.STANDARD, // TODO
    args: [
      ownerAddress,
      merkleRoot || "0x",
      formikProps.values.tokenAddress,
      token ? BigInt(parseInt(formikProps.values.amount) * 10 ** token.decimals) : 0n,
    ],
    uuid: uuidToHex(airdropId),
    enabled:
      isAddress(ownerAddress) &&
      token &&
      approvals.allowance >= BigInt(parseInt(formikProps.values.amount) * 10 ** token.decimals),
  });

  useEffect(() => {
    approvals.refetchAllowance();
  }, [approvals.waitResult?.status]);

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
          <ModalHeader>{t("airdrop.contractForm.registerContract")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={formikProps.handleSubmit}>
              <HStack spacing={8} alignItems={"start"}>
                <chakra.div w={"full"}>
                  <FormControl
                    mt={4}
                    isInvalid={
                      !!formikProps.errors.tokenAddress && !!formikProps.touched.tokenAddress
                    }
                  >
                    <FormLabel htmlFor="token" alignItems={"baseline"}>
                      {t("airdrop.contractForm.tokenAddress")}
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
                      onBlur={formikProps.handleBlur}
                      onChange={(event: React.ChangeEvent<any>) => {
                        formikProps.setFieldTouched("amount");
                        formikProps.handleChange(event);
                        // console.log(formikProps.values);
                      }}
                      value={formikProps.values.tokenAddress ? formikProps.values.tokenAddress : ""}
                      placeholder="e.g. 0x0123456789012345678901234567890123456789"
                    />
                    <FormErrorMessage>{formikProps.errors.tokenAddress}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    mt={4}
                    isInvalid={!!formikProps.errors.amount && !!formikProps.touched.amount}
                  >
                    <Flex justifyContent={"space-between"}>
                      <FormLabel alignItems={"baseline"}>
                        {t("airdrop.contractForm.depositAmount")}
                      </FormLabel>
                    </Flex>

                    <Flex alignItems={"center"}>
                      <NumberInput
                        flex="1"
                        name="value"
                        value={formikProps.values.amount}
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        onBlur={formikProps.handleBlur}
                        onChange={(strVal: string, val: number) =>
                          formikProps.setFieldValue(
                            "amount",
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
                      <chakra.div px={2} minW={"3rem"}>
                        {token?.symbol}
                      </chakra.div>
                    </Flex>
                    <chakra.p color={"gray.400"} fontSize={"sm"}>
                      {t("airdrop.contractForm.balance")}:{" "}
                      {balance ? formatAmount(balance, token?.decimals, 4) : "0"} {token?.symbol}
                      <chakra.span
                        color={"gray.400"}
                        ml={4}
                        cursor={"pointer"}
                        onClick={() => {
                          if (!totalAirdropAmount || !token) return;
                          formikProps.setFieldValue(
                            "amount",
                            formatAmount(totalAirdropAmount, token.decimals),
                          );
                        }}
                      >
                        (エアドロップ総額:
                        {totalAirdropAmount && token
                          ? formatAmount(totalAirdropAmount, token?.decimals)
                          : "0"}{" "}
                        {token?.symbol})
                      </chakra.span>
                    </chakra.p>
                    <FormErrorMessage fontSize={"xs"}>{formikProps.errors.amount}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    mt={4}
                    isInvalid={
                      !!formikProps.errors.tokenAddress && !!formikProps.touched.tokenAddress
                    }
                  >
                    <FormLabel htmlFor="merkleroot" alignItems={"baseline"}>
                      {t("airdrop.contractForm.merkleroot")}
                      {/* <Tooltip
                        hasArrow
                        label={""}
                      >
                        <QuestionIcon mb={1} ml={1} />
                      </Tooltip> */}
                    </FormLabel>
                    <HStack>
                      <Input
                        id="merkleRoot"
                        name="merkleRoot"
                        value={merkleRoot || ""}
                        isReadOnly={true}
                        isDisabled={true}
                        fontSize={"sm"}
                        placeholder="e.g. 0x0123456789012345678901234567890123456789"
                      />
                      {loading && <Spinner />}
                    </HStack>
                    <FormErrorMessage>{formikProps.errors.merkleRoot}</FormErrorMessage>
                  </FormControl>
                </chakra.div>
              </HStack>

              <>
                {token &&
                approvals.allowance >=
                  BigInt(parseInt(formikProps.values.amount) * 10 ** token.decimals) ? (
                  <Button
                    mt={4}
                    w={"full"}
                    variant="solid"
                    colorScheme="green"
                    type="submit"
                    isLoading={waitResult?.isLoading}
                    disabled={
                      !token ||
                      !parseInt(formikProps.values.amount) ||
                      !writeFn.writeContract ||
                      !formikProps.isValid ||
                      prepareFn.isPending
                    }
                  >
                    {t("airdrop.contractForm.deploy")}
                  </Button>
                ) : (
                  <Button
                    mt={4}
                    w={"full"}
                    variant="solid"
                    colorScheme="blue"
                    onClick={approvals.writeFn.write}
                    isLoading={approvals.waitResult?.isLoading}
                    disabled={
                      !token ||
                      !parseInt(formikProps.values.amount) ||
                      !approvals.writeFn.writeContract ||
                      !formikProps.isValid
                    }
                  >
                    {t("airdrop.contractForm.approve")}
                  </Button>
                )}
              </>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
