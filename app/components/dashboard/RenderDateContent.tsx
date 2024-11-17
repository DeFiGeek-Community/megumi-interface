import { Text } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import { RenderDateContentProps } from "@/app/interfaces/dashboard";
import { useTranslation } from "react-i18next";

export default function RenderDateContent({
  creationDate,
  publicationDate,
  isMobile,
}: RenderDateContentProps) {
  const { t } = useTranslation();
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width={isMobile ? "100%" : undefined}
      paddingX={isMobile ? "1" : undefined}
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
