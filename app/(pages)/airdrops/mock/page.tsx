"use client";
import { Center, Container, Heading, Spinner, VStack, Box } from "@chakra-ui/react";
import { useRequireAccount } from "@/app/hooks/common/useRequireAccount";
import AirdropDetails from "@/app/components/airdrops/cards/AirdropDetails";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
import { useTranslation } from "react-i18next";
import { TemplateType, Airdrop } from "@/app/interfaces/dashboard";

export default function AirdropPage() {
  const { address, isConnecting, isReconnecting } = useRequireAccount();
  const isMounted = useIsMounted();
  const { t } = useTranslation();
  const airdrops: Airdrop[] = [
    {
      id: "asdf",
      title: "Vesting",
      templateName: TemplateType.LINEAR_VESTING,
      owner: "0x",
      tokenAddress: "0x",
      createdAt: 1731897560,
      merkleTreeUploadedAt: 1731897560,
      contractAddress: "0x",
      totalAirdropAmount: BigInt(0.005 * 1e18),
      eligibleUsersNum: 1000,
      claimedUsersNum: 40,
      contractDeployedAt: 1731897560,
      vestingEndsAt: 1731897560,
    },
    {
      id: "zxcv",
      title: "Standard",
      templateName: TemplateType.STANDARD,
      owner: "0x",
      tokenAddress: "0x",
      createdAt: 1731897560,
      merkleTreeUploadedAt: undefined,
      contractAddress: undefined,
      totalAirdropAmount: BigInt(0.005 * 1e18),
      eligibleUsersNum: 1000,
      claimedUsersNum: 40,
      contractDeployedAt: 1731897560,
    },
  ];
  if (!isMounted || !address)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  return (
    <Container maxW={"container.xl"} mb={4}>
      <VStack spacing="4">
        <Box width={{ base: "100%", lg: "50%" }} ml={4}>
          <Heading fontSize="3xl">Airdrop</Heading>
        </Box>
        <AirdropDetails />
      </VStack>
    </Container>
  );
}
