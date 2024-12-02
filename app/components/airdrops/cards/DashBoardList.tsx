"use client";
import { Box, Button, Flex, Tab, TabList, Tabs, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import Airdrops from "./Airdrops";

export default function DashBoardList() {
  const { t } = useTranslation();
  return (
    <Box margin="0 auto" py={{ base: "3", md: "6" }}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom="4">
        <Tabs width={{ base: "387px", md: "400px" }}>
          <TabList>
            <Tab flex="1" fontSize={{ base: "sm", sm: "md" }}>
              {t("dashboard.yourAirdrops")}
            </Tab>
            <Tab flex="1" fontSize={{ base: "sm", sm: "md" }}>
              {t("dashboard.targetAirdrops")}
            </Tab>
          </TabList>
        </Tabs>
      </Flex>
      <Flex justifyContent="flex-end" marginBottom="6">
        <Button
          leftIcon={<AddIcon />}
          bg="gray.500"
          _hover={{ bg: "gray.600" }}
          fontSize={{ base: "sm", sm: "md" }}
        >
          {t("dashboard.createAirdrop")}
        </Button>
      </Flex>
      <VStack spacing="4">
        <Airdrops />
      </VStack>
    </Box>
  );
}
