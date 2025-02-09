"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { isAddress } from "viem";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { useTranslation } from "react-i18next";
import {
  Button,
  HStack,
  chakra,
  FormErrorMessage,
  FormControl,
  Input,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Menu,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useFetchAbi } from "@/app/hooks/abi/useFetchAbi";
import { AddIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ContractEvents } from "@/app/types/snapshots";

type SnapshotFormProps = {
  chainId: number;
  isOpen: boolean;
  onClose: () => void;
  setContractEvents: Dispatch<SetStateAction<FormValues | null>>;
  initialData: FormValues | null;
};

type FormValues = ContractEvents;

export default function SnapshotOptionFormModal({
  chainId,
  isOpen,
  onClose,
  setContractEvents,
  initialData,
}: SnapshotFormProps) {
  const { t } = useTranslation();
  const handleSubmit = async (data: FormValues) => {
    setContractEvents(data);
    onClose();
  };

  const validate = (value: FormValues) => {
    const errors: any = {};

    if (!value.contractAddress || !isAddress(value.contractAddress)) {
      errors.contractAddress = "Contract address is invalid";
    }

    if (value.targetEvents.length === 0) {
      errors.targetEvents = "Event information is required";
    }

    for (let i = 0; i < value.targetEvents.length; i++) {
      if (
        !value.targetEvents[i].abi ||
        !value.targetEvents[i].addressKey ||
        !value.targetEvents[i].amountKey ||
        !value.targetEvents[i].tokenAddressKey
      ) {
        errors.targetEvents = "Event information is required";
      }
    }

    return errors;
  };
  const initialValues: FormValues = initialData ?? {
    contractAddress: "",
    targetEvents: [],
  };

  const formikProps = useFormik<FormValues>({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: handleSubmit,
    validate: (value: FormValues) => validate(value),
  });
  const { data, loading, error } = useFetchAbi(chainId, formikProps.values.contractAddress);
  const [events, setEvents] = useState<{ [key: string]: any }[]>([]);

  useEffect(() => {
    if (!data) return;
    const filteredData = data.filter((item) => item.type === "event") ?? [];
    setEvents(filteredData);
  }, [data]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      blockScrollOnMount={false}
      size={"4xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("airdrop.snapshotForm.heading")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
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
                    {t("airdrop.snapshotForm.contractAddress")}
                  </FormLabel>
                  <HStack spacing={2} flexDirection={{ base: "column", md: "row" }}>
                    <Input
                      id="contractAddress"
                      name="contractAddress"
                      onBlur={formikProps.handleBlur}
                      onChange={formikProps.handleChange}
                      value={formikProps.values.contractAddress}
                      fontSize={"sm"}
                      placeholder="e.g. 0x0123456789012345678901234567890123456789"
                    />
                  </HStack>
                  <FormErrorMessage>{formikProps.errors.contractAddress}</FormErrorMessage>
                </FormControl>

                <FormikProvider value={formikProps}>
                  <FormControl
                    mt={4}
                    isInvalid={
                      !!formikProps.errors.targetEvents && !!formikProps.touched.targetEvents
                    }
                  >
                    <FieldArray
                      name="targetEvents"
                      render={(arrayHelpers) => (
                        <>
                          <FormLabel fontSize={"xs"} htmlFor="targetEvents" alignItems={"baseline"}>
                            {t("airdrop.snapshotForm.targetEvents")}
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={<AddIcon />}
                                variant="outline"
                                size={"xs"}
                                ml={2}
                              />
                              <MenuList>
                                <MenuItem
                                  isDisabled={formikProps.values.targetEvents.length > 4}
                                  onClick={() =>
                                    arrayHelpers.push({
                                      index: "",
                                      abi: "",
                                      tokenAddressKey: "",
                                      addressKey: "",
                                      amountKey: "",
                                      sub: false,
                                    })
                                  }
                                >
                                  {t("airdrop.snapshotForm.addIncrementEvent")}
                                </MenuItem>
                                <MenuItem
                                  isDisabled={formikProps.values.targetEvents.length > 4}
                                  onClick={() =>
                                    arrayHelpers.push({
                                      index: "",
                                      abi: "",
                                      tokenAddressKey: "",
                                      addressKey: "",
                                      amountKey: "",
                                      sub: true,
                                    })
                                  }
                                >
                                  {t("airdrop.snapshotForm.addDecrementEvent")}
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </FormLabel>
                          <TableContainer>
                            <Table>
                              {formikProps.values.targetEvents.length > 0 && (
                                <Thead>
                                  <Tr>
                                    <Th></Th>
                                    <Th>{t("airdrop.snapshotForm.eventName")}</Th>
                                    <Th>{t("airdrop.snapshotForm.tokenAddress")}</Th>
                                    <Th>{t("airdrop.snapshotForm.userAddress")}</Th>
                                    <Th>{t("airdrop.snapshotForm.amount")}</Th>
                                    <Th></Th>
                                  </Tr>
                                </Thead>
                              )}
                              <Tbody>
                                {formikProps.values.targetEvents.map((targetEvent, index) => (
                                  <Tr key={index}>
                                    <Td py={1} px={2} whiteSpace={"nowrap"}>
                                      <Flex
                                        justifyContent={"center"}
                                        fontWeight={"bold"}
                                        fontSize={"lg"}
                                        color={
                                          formikProps.values.targetEvents[index].sub
                                            ? "red.400"
                                            : "green.400"
                                        }
                                      >
                                        {formikProps.values.targetEvents[index].sub ? " - " : " + "}
                                      </Flex>
                                    </Td>
                                    <Td py={1} px={2}>
                                      <Select
                                        w={"full"}
                                        id={`targetEvents[${index}].index`}
                                        name={`targetEvents[${index}].index`}
                                        value={targetEvent.index}
                                        onBlur={formikProps.handleBlur}
                                        onChange={(event) => {
                                          const targetIndex = parseInt(event.target.value);
                                          formikProps.setFieldValue(`targetEvents[${index}]`, {
                                            index: targetIndex,
                                            abi: events[targetIndex],
                                            tokenAddressKey: "",
                                            addressKey: "",
                                            amountKey: "",
                                            sub: targetEvent.sub,
                                          });
                                        }}
                                        fontSize={"sm"}
                                        placeholder=""
                                        isDisabled={loading}
                                        icon={loading ? <Spinner /> : <ChevronDownIcon />}
                                      >
                                        <option></option>
                                        {events.map((event, index) => (
                                          <option key={index} value={index}>
                                            {event.name}
                                          </option>
                                        ))}
                                      </Select>
                                    </Td>
                                    <Td py={1} px={2}>
                                      <Select
                                        w={"full"}
                                        id={`targetEvents[${index}].tokenAddressKey`}
                                        name={`targetEvents[${index}].tokenAddressKey`}
                                        value={targetEvent.tokenAddressKey}
                                        onBlur={formikProps.handleBlur}
                                        onChange={formikProps.handleChange}
                                        fontSize={"sm"}
                                        placeholder=""
                                        isDisabled={loading}
                                        icon={loading ? <Spinner /> : <ChevronDownIcon />}
                                      >
                                        <option></option>
                                        {!!String(targetEvent.index) &&
                                          events.length > 0 &&
                                          events[targetEvent.index].inputs.map(
                                            (event: any, index: number) => (
                                              <option key={index} value={event.name}>
                                                {event.name}
                                              </option>
                                            ),
                                          )}
                                      </Select>
                                    </Td>
                                    <Td py={1} px={2}>
                                      <Select
                                        w={"full"}
                                        id={`targetEvents[${index}].addressKey`}
                                        name={`targetEvents[${index}].addressKey`}
                                        value={targetEvent.addressKey}
                                        onBlur={formikProps.handleBlur}
                                        onChange={formikProps.handleChange}
                                        fontSize={"sm"}
                                        placeholder=""
                                        isDisabled={loading}
                                        icon={loading ? <Spinner /> : <ChevronDownIcon />}
                                      >
                                        <option></option>
                                        {!!String(targetEvent.index) &&
                                          events.length > 0 &&
                                          events[targetEvent.index].inputs.map(
                                            (event: any, index: number) => (
                                              <option key={index} value={event.name}>
                                                {event.name}
                                              </option>
                                            ),
                                          )}
                                      </Select>
                                    </Td>
                                    <Td py={1} px={2}>
                                      <Select
                                        w={"full"}
                                        id={`targetEvents[${index}].amountKey`}
                                        name={`targetEvents[${index}].amountKey`}
                                        value={targetEvent.amountKey}
                                        onBlur={formikProps.handleBlur}
                                        onChange={formikProps.handleChange}
                                        fontSize={"sm"}
                                        placeholder=""
                                        isDisabled={loading}
                                        icon={loading ? <Spinner /> : <ChevronDownIcon />}
                                      >
                                        <option></option>
                                        {!!String(targetEvent.index) &&
                                          events.length > 0 &&
                                          events[targetEvent.index].inputs.map(
                                            (event: any, index: number) => (
                                              <option key={index} value={event.name}>
                                                {event.name}
                                              </option>
                                            ),
                                          )}
                                      </Select>
                                    </Td>
                                    <Td py={1} px={2}>
                                      <Button onClick={() => arrayHelpers.remove(index)}>x</Button>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </>
                      )}
                    />
                    {typeof formikProps.errors.targetEvents === "string" && (
                      <FormErrorMessage>{formikProps.errors.targetEvents}</FormErrorMessage>
                    )}
                  </FormControl>
                </FormikProvider>
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
                {t("airdrop.snapshotForm.register")}
              </Button>
            </>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
