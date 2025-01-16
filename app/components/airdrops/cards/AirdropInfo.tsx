import { Box, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { formatTemplateType } from "@/app/utils/clientHelper";
import type { TemplateType } from "@/app/types/airdrop";

export interface AirdropInfoProps {
  airdropTitle: string;
  templateType: TemplateType;
}

export default function AirdropInfo({ airdropTitle, templateType }: AirdropInfoProps) {
  const { t } = useTranslation();
  return (
    <>
      <Text fontSize={{ base: "25px", sm: "30px" }} fontWeight={{ base: "600", sm: "400" }}>
        {airdropTitle}
      </Text>
      <Box
        bg="gray.500"
        borderRadius="md"
        px={{ base: "1", sm: "3" }}
        py={{ base: "0.5", sm: "1" }}
        mt="1.5"
        display="inline-flex"
        alignItems="center"
      >
        <Text fontSize={{ base: "sm", sm: "md" }} marginRight="1">
          {t(`dashboard.${formatTemplateType(templateType)}`)}
        </Text>
        <Box
          bg="white"
          borderRadius="full"
          width={{ base: "4", sm: "5" }}
          height={{ base: "4", sm: "5" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="sm" fontWeight="bold" color="black">
            ?
          </Text>
        </Box>
      </Box>
    </>
  );
}
