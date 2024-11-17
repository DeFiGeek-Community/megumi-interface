import { Text } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import { RenderDateContentProps } from "@/app/interfaces/dashboard";

export default function RenderDateContent({
  creationDate,
  publicationDate,
  isMobile,
}: RenderDateContentProps) {
  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      width={isMobile ? "100%" : undefined}
      paddingX={isMobile ? "1" : undefined}
    >
      <Text fontSize="sm" textAlign="right" flex="1" paddingRight={4}>
        作成日: {creationDate}
      </Text>
      <Text fontSize="sm" textAlign="right">
        公開日: {publicationDate}
      </Text>
    </Row>
  );
}
