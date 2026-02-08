"use client";
import { useEffect } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Tooltip,
  Input,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { CheckCircleIcon, QuestionIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useIsContractWallet } from "@/app/hooks/common/useIsContractWallet";
import { useFormik } from "formik";

type SafeAddressModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onProceed: (safeAddress: `0x${string}`) => void;
};

type SafeAddressForm = { networkId: number | undefined; safeAddress: `0x${string}` | undefined };
type SafeAddressFormError = { safeAddress?: string };

export function SafeAddressModal({ isOpen, isLoading, onClose, onProceed }: SafeAddressModalProps) {
  const { t } = useTranslation();
  const formikProps = useFormik<SafeAddressForm>({
    enableReinitialize: true,
    initialValues: { networkId: undefined, safeAddress: undefined },
    onSubmit: () => {},
    validate: (value: SafeAddressForm) => {
      const errors: SafeAddressFormError = {};
      if (!isSafe) {
        errors.safeAddress = "Invalid Safe account";
      }
      return errors;
    },
  });
  const chainId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!); // TODO
  const { isSafe, isChecking } = useIsContractWallet({
    chainId,
    address: formikProps.values.safeAddress,
  });

  useEffect(() => {
    formikProps.validateForm();
  }, [isChecking]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size={"lg"}
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common.siginInWithEthereumAsSafe")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <div>
            <form onSubmit={formikProps.handleSubmit}>
              <FormControl
                mt={4}
                isInvalid={!!formikProps.errors.safeAddress && !!formikProps.touched.safeAddress}
              >
                <FormLabel htmlFor="token" alignItems={"baseline"}>
                  {t("common.safeAddress")}
                  <Tooltip hasArrow label={t("common.safeAddressHelp")}>
                    <QuestionIcon mb={1} ml={1} />
                  </Tooltip>
                </FormLabel>
                <InputGroup>
                  {isSafe && (
                    <InputRightElement pointerEvents="none">
                      <CheckCircleIcon color="green.300" />
                    </InputRightElement>
                  )}
                  <Input
                    id="safeAddress"
                    name="safeAddress"
                    onBlur={formikProps.handleBlur}
                    onChange={async (event: React.ChangeEvent<any>) => {
                      formikProps.handleChange(event);
                    }}
                    value={formikProps.values.safeAddress ? formikProps.values.safeAddress : ""}
                    placeholder="e.g. 0x78cE186ccCd42d632aBBeA31D247a619389cb76c"
                  />
                </InputGroup>
                <FormErrorMessage>{formikProps.errors.safeAddress}</FormErrorMessage>
              </FormControl>

              <Button
                mt={8}
                w={"full"}
                variant="gold"
                isLoading={isChecking || isLoading}
                isDisabled={!formikProps.isValid}
                onClick={() => {
                  onProceed(formikProps.values.safeAddress!);
                }}
              >
                {t("common.next")}
              </Button>
            </form>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
