import { Flex } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { RenderStatusProps } from "@/app/interfaces/dashboard";
import { useTranslation } from "react-i18next";

export default function RenderStatus({
  isAirdropResistered,
  isContractResistered,
}: RenderStatusProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <>
      <Flex
        alignItems="center"
        bg={isAirdropResistered ? "green.100" : undefined}
        color={isAirdropResistered ? "green.800" : "gray.400"}
        fontSize="xs"
        fontWeight="medium"
        px="2.5"
        py="0.5"
        borderRadius="full"
      >
        <CheckCircleIcon
          boxSize="3"
          marginRight="1"
          color={isAirdropResistered ? undefined : "gray.400"}
        />
        {isAirdropResistered
          ? t("dashboard.registeredAirdropList")
          : t("dashboard.unregisteredAirdropList")}
      </Flex>
      <Flex
        alignItems="center"
        bg={isContractResistered ? "blue.100" : undefined}
        color={isContractResistered ? "blue.800" : "gray.400"}
        fontSize="xs"
        fontWeight="medium"
        px="2.5"
        py="0.5"
        borderRadius="full"
      >
        <CheckCircleIcon
          boxSize="3"
          marginRight="1"
          color={isContractResistered ? undefined : "gray.400"}
        />
        {isContractResistered
          ? t("dashboard.registeredContract")
          : t("dashboard.unregisteredContract")}
      </Flex>
    </>
  );
}
