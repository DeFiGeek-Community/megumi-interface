import { Flex } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { StatusProps } from "@/app/interfaces/dashboard";
import { useTranslation } from "react-i18next";

export default function Status({
  isAirdropRegistered,
  isContractRegistered,
}: StatusProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <>
      <Flex
        alignItems="center"
        bg={isAirdropRegistered ? "green.100" : undefined}
        color={isAirdropRegistered ? "green.800" : "gray.400"}
        fontSize="xs"
        fontWeight="medium"
        px="2.5"
        py="0.5"
        borderRadius="full"
      >
        <CheckCircleIcon
          boxSize="3"
          marginRight="1"
          color={isAirdropRegistered ? undefined : "gray.400"}
        />
        {isAirdropRegistered
          ? t("dashboard.registeredAirdropList")
          : t("dashboard.unregisteredAirdropList")}
      </Flex>
      <Flex
        alignItems="center"
        bg={isContractRegistered ? "blue.100" : undefined}
        color={isContractRegistered ? "blue.800" : "gray.400"}
        fontSize="xs"
        fontWeight="medium"
        px="2.5"
        py="0.5"
        borderRadius="full"
      >
        <CheckCircleIcon
          boxSize="3"
          marginRight="1"
          color={isContractRegistered ? undefined : "gray.400"}
        />
        {isContractRegistered
          ? t("dashboard.registeredContract")
          : t("dashboard.unregisteredContract")}
      </Flex>
    </>
  );
}
