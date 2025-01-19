"use client";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import {
  Center,
  Container,
  Heading,
  Spinner,
  TabPanel,
  TabPanels,
  useToast,
} from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { Box, Button, Flex, Tab, TabList, Tabs, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { TemplateNames } from "@/app/lib/constants/templates";
import { useCreateAirdrop } from "@/app/hooks/airdrops/useCreateAirdrop";
import MyAirdrops from "@/app/components/dashboard/myAirdrops";
import EligibleAirdrops from "@/app/components/dashboard/eligibleAirdrops";

export default function Dashboard() {
  const { address, isConnecting, isReconnecting, chainId } = useRequireAccount();
  const { data: session } = useSession();
  const isMounted = useIsMounted();
  const { t } = useTranslation();
  const { createAirdrop } = useCreateAirdrop();

  const toast = useToast({ position: "top-right", isClosable: true });

  if (!isMounted || !address || !chainId)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  return (
    <Container maxW={"container.xl"}>
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
                  <Flex justifyContent="flex-end" mb="6" mt="2">
                    <Button
                      leftIcon={<AddIcon />}
                      bg="gray.500"
                      _hover={{ bg: "gray.600" }}
                      fontSize={{ base: "sm", sm: "md" }}
                      onClick={() => {
                        // Create sample airdrop
                        createAirdrop({
                          params: {
                            chainId: parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!),
                            title: "test",
                            templateName: TemplateNames.Standard,
                            tokenAddress: "0x5055d837992bE5e1fE193F180B22B232099017d8",
                            tokenLogo: "https://example.com/logo.png",
                          },
                          onSuccess: () => {
                            toast({
                              title: "Airdrop created",
                              status: "success",
                            });
                          },
                          onError: (e) => {
                            toast({
                              title: `${e}`,
                              status: "error",
                            });
                          },
                        });
                      }}
                    >
                      {t("dashboard.createAirdrop")}
                    </Button>
                  </Flex>
                  <MyAirdrops chainId={chainId} />
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
