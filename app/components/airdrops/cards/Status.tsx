import { Flex } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

export interface StatusProps {
  merkleTreeRegisteredAt: Date | null;
  contractRegisteredAt: Date | null;
}

export default function Status({
  merkleTreeRegisteredAt,
  contractRegisteredAt,
}: StatusProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <>
      <Flex
        alignItems="center"
        bg={merkleTreeRegisteredAt ? "green.100" : undefined}
        color={merkleTreeRegisteredAt ? "green.800" : "gray.400"}
        fontSize="xs"
        fontWeight="medium"
        px="2.5"
        py="0.5"
        borderRadius="full"
      >
        <CheckCircleIcon
          boxSize="3"
          marginRight="1"
          color={merkleTreeRegisteredAt ? undefined : "gray.400"}
        />
        {merkleTreeRegisteredAt
          ? t("dashboard.registeredAirdropList")
          : t("dashboard.unregisteredAirdropList")}
      </Flex>
      <Flex
        alignItems="center"
        bg={contractRegisteredAt ? "blue.100" : undefined}
        color={contractRegisteredAt ? "blue.800" : "gray.400"}
        fontSize="xs"
        fontWeight="medium"
        px="2.5"
        py="0.5"
        borderRadius="full"
      >
        <CheckCircleIcon
          boxSize="3"
          marginRight="1"
          color={contractRegisteredAt ? undefined : "gray.400"}
        />
        {contractRegisteredAt
          ? t("dashboard.registeredContract")
          : t("dashboard.unregisteredContract")}
      </Flex>
    </>
  );
}
