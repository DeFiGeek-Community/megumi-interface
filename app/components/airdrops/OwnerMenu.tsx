"use client";
import { useTranslation } from "react-i18next";
import { Stack, HStack, Text, Button, VStack, Box, Divider, Icon } from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";

export default function OwnerMenu() {
  const { t } = useTranslation();
  return (
    <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4}>
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="900">
            {t("airdrop.ownerMenu")}
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontWeight="medium">{t("airdrop.basicInformation")}</Text>
          <Button size="sm" width="20" colorScheme="blue">
            {t("airdrop.edit")}
          </Button>
        </HStack>
        <Divider />
        <HStack justify="space-between">
          <Stack>
            <Text fontWeight="medium">{t("airdrop.airdropList")}</Text>
            <Text fontWeight="medium" textAlign="left">
              <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
              {t("airdrop.unregistered")}
            </Text>
          </Stack>
          <Button size="sm" width="20" colorScheme="blue">
            {t("airdrop.register")}
          </Button>
        </HStack>
        <Divider />
        <HStack justify="space-between">
          <Stack>
            <Text fontWeight="medium">{t("airdrop.contract")}</Text>
            <Text fontWeight="medium" textAlign="left">
              <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
              {t("airdrop.unregistered")}
            </Text>
          </Stack>
          <Button size="sm" width="20" colorScheme="blue">
            {t("airdrop.register")}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
