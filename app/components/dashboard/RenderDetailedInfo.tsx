import { Text } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import { RenderDetailedInfoProps } from "@/app/interfaces/dashboard";
import { useTranslation } from "react-i18next";

export default function RenderDetailedInfo({
  totalAmount,
  claimedAccounts,
  vestingEndDate,
}: RenderDetailedInfoProps) {
  const { t } = useTranslation();
  return (
    <>
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="center"
        width="100%"
        paddingTop="4"
        paddingX="2"
      >
        <Text flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
          {t("dashboard.totalAmount")}
        </Text>
        <Text flex="1" textAlign="right" fontSize="lg" fontWeight="medium">
          {totalAmount}
        </Text>
      </Row>
      <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%" paddingX="2">
        <Text flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
          {t("dashboard.claimedAccount")}
        </Text>
        <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
          {claimedAccounts}
        </Text>
      </Row>
      <Row mainAxisAlignment="space-between" crossAxisAlignment="center" width="100%" paddingX="2">
        <Text flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
          {t("dashboard.vestingDeadline")}
        </Text>
        <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
          {vestingEndDate}
        </Text>
      </Row>
    </>
  );
}
