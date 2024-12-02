import { Text } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import { DateContentProps } from "@/app/interfaces/dashboard";
import { useTranslation } from "react-i18next";

export default function DateContent({ creationDate, publicationDate }: DateContentProps) {
  const { t } = useTranslation();
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width="100%"
      paddingX={{ base: "1", sm: "1.5" }}
    >
      <Text fontSize="sm" textAlign="right" flex="1" paddingRight={4}>
        {t("dashboard.creationDate")} {creationDate}
      </Text>
      <Text fontSize="sm" textAlign="right">
        {t("dashboard.publicationDate")} {publicationDate}
      </Text>
    </Row>
  );
}
