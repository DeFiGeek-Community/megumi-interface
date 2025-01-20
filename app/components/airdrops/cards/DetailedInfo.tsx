import { chakra, Text } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import { useTranslation } from "react-i18next";
import { TemplateNames, TemplateNamesType } from "@/app/lib/constants/templates";
import { formatAmount, formatClaimedAccounts, formatDate } from "@/app/utils/clientHelper";

export interface DetailedInfoProps {
  totalAirdropAmount: string | null;
  eligibleUsersNum: number | undefined;
  claimedUsersNum: number | undefined;
  templateName: TemplateNamesType;
  vestingEndsAt: Date | null;
  tokenName: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number | null;
}

export default function DetailedInfo({
  totalAirdropAmount,
  eligibleUsersNum,
  claimedUsersNum,
  templateName,
  vestingEndsAt,
  tokenName,
  tokenSymbol,
  tokenDecimals,
}: DetailedInfoProps) {
  const { t } = useTranslation();
  return (
    <>
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-end"
        width="100%"
        paddingTop={{ base: "0.5", md: "4" }}
        paddingX="2"
        pb={2}
      >
        <Text flex="1" textAlign="right" fontSize="xs" fontWeight="medium">
          {t("dashboard.totalAmount")}
        </Text>
        <Text flex="1" textAlign="right" fontSize="xl" fontWeight="bold" lineHeight={1}>
          {totalAirdropAmount
            ? formatAmount(BigInt(totalAirdropAmount), tokenDecimals || undefined, 2)
            : "-"}{" "}
          <chakra.span fontSize={"sm"} fontWeight="medium">
            {tokenSymbol}
          </chakra.span>
        </Text>
      </Row>
      <Row
        mainAxisAlignment="space-between"
        crossAxisAlignment="flex-end"
        width="100%"
        paddingX="2"
        pb={2}
      >
        <Text flex="1" textAlign="right" fontSize="xs" fontWeight="medium" lineHeight={1.2}>
          {t("dashboard.claimedAccount")}
        </Text>
        <Text flex="1" textAlign="right" fontSize="xl" fontWeight="bold" lineHeight={1}>
          {formatClaimedAccounts(eligibleUsersNum, claimedUsersNum)}
        </Text>
      </Row>
      {templateName === TemplateNames.LinearVesting && (
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
          paddingX="2"
        >
          <Text flex="1" textAlign="right" fontSize="xs" fontWeight="medium">
            {t("dashboard.vestingDeadline")}
          </Text>
          <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
            {formatDate(vestingEndsAt, "yyyy/MM/dd")}
          </Text>
        </Row>
      )}
    </>
  );
}
