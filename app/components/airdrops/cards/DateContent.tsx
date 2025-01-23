import { Text } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/app/utils/clientHelper";

export interface DateContentProps {
  createdAt: Date;
  contractRegisteredAt: Date | null;
}

export default function DateContent({ createdAt, contractRegisteredAt }: DateContentProps) {
  const { t } = useTranslation();
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      paddingX={{ base: "1", sm: "1.5" }}
    >
      <Text fontSize="sm" textAlign="right" flex="1" paddingRight={4}>
        {t("dashboard.creationDate")} {formatDate(createdAt, "yyyy/MM/dd")}
      </Text>
      <Text fontSize="sm" textAlign="right">
        {t("dashboard.publicationDate")} {formatDate(contractRegisteredAt, "yyyy/MM/dd")}
      </Text>
    </Row>
  );
}
