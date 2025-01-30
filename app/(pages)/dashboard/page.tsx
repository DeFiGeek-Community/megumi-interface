"use client";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import { Center, Container, Heading, Spinner, TabPanel, TabPanels } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { Box, Flex, Tab, TabList, Tabs } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import MyAirdrops from "@/app/components/dashboard/myAirdrops";
import EligibleAirdrops from "@/app/components/dashboard/eligibleAirdrops";

export default function Dashboard() {
  const { address, isConnecting, isReconnecting, chainId } = useRequireAccount();
  const { data: session } = useSession();
  const isMounted = useIsMounted();
  const { t } = useTranslation();

  if (!isMounted || !address || !chainId)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  return (
    <Container maxW={"container.lg"}>
      <Heading fontSize={{ base: "xl", md: "3xl" }}>Dashboard</Heading>
      <Box margin="0 auto" py={{ base: "3", md: "6" }}>
        <Flex w={"full"} justifyContent="space-between" alignItems="center" marginBottom="4">
          <Tabs w={"full"}>
            <TabList>
              {session && (
                <Tab fontSize={{ base: "sm", sm: "md" }}>{t("dashboard.yourAirdrops")}</Tab>
              )}
              <Tab fontSize={{ base: "sm", sm: "md" }}>{t("dashboard.targetAirdrops")}</Tab>
            </TabList>
            <TabPanels>
              {session && (
                <TabPanel>
                  <MyAirdrops chainId={chainId} signedInUser={session.user.address} />
                </TabPanel>
              )}
              <TabPanel>
                <EligibleAirdrops chainId={chainId} address={address} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Box>
    </Container>
  );
}
