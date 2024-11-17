import { Box, Text } from "@chakra-ui/react";
import { RenderAirdropInfoProps } from "@/app/interfaces/dashboard";
import { useTranslation } from "react-i18next";

export default function RenderAirdropInfo({
  airdropTitle,
  vestingType,
  isMobile,
}: RenderAirdropInfoProps) {
  const { t } = useTranslation();
  return (
    <>
      <Text fontSize={isMobile ? "25px" : "30px"} fontWeight={isMobile ? "600" : "400"}>
        {airdropTitle}
      </Text>
      <Box
        bg="gray.500"
        borderRadius="md"
        px={isMobile ? "1" : "3"}
        py={isMobile ? "0.5" : "1"}
        mt="1.5"
        display="inline-flex"
        alignItems="center"
      >
        <Text fontSize={isMobile ? "sm" : "md"} marginRight="1">
          {vestingType==="Linear vesting"&&t("dashboard.linearVesting")}
          {vestingType==="Standard"&&t("dashboard.standard")}
        </Text>
        <Box
          bg="white"
          borderRadius="full"
          width={isMobile ? "4" : "5"}
          height={isMobile ? "4" : "5"}
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
