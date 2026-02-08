"use client";
import { Card, CardBody } from "@chakra-ui/react";
import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import Status from "@/app/components/airdrops/cards/Status";
import DateContent from "@/app/components/airdrops/cards/DateContent";
import DetailedInfo from "@/app/components/airdrops/cards/DetailedInfo";
import AirdropInfo from "@/app/components/airdrops/cards/AirdropInfo";
import type { AirdropHex } from "@/app/types/airdrop";
import { TokenLogo } from "@/app/components/common/TokenLogo";
import { Link } from "@/app/components/common/Link";

export default function AirdropCard({
  airdrop,
  isOwner = false,
}: {
  airdrop: AirdropHex;
  isOwner?: boolean;
}) {
  const dateContentParams = isOwner
    ? { createdAt: airdrop.createdAt, contractRegisteredAt: airdrop.contractRegisteredAt }
    : { contractRegisteredAt: airdrop.contractRegisteredAt };
  return (
    <Link
      href={`/airdrops/${airdrop.chainId}/${airdrop.id}`}
      transition={"filter"}
      transitionDuration={"0.3s"}
      w={{ base: "100%" }}
      _hover={{
        textDecoration: "none",
        filter: "brightness(115%)",
      }}
    >
      <Card
        width="100%"
        bg="brand.bg.card"
        borderColor="brand.border.subtle"
        borderWidth="1px"
        borderRadius="16px"
        backdropFilter="blur(10px)"
        transition="all 0.3s ease"
        _hover={{
          borderColor: "brand.border.medium",
          boxShadow: "0 0 20px rgba(252, 200, 98, 0.15)",
        }}
      >
        <CardBody paddingX={{ base: "1", sm: "5" }}>
          <Box>
            <DateContent {...dateContentParams} />
            <Flex
              flexDirection={{ base: "column", md: "row" }}
              justifyContent="center"
              alignItems="center"
              gap="4"
            >
              <Box width={{ base: "full", md: "60%" }}>
                {isOwner && (
                  <Row
                    mainAxisAlignment="center"
                    crossAxisAlignment="center"
                    gap="4"
                    marginTop="3"
                    display={{ base: "block", md: "none" }}
                  >
                    <Box flex="1">
                      <Row
                        mainAxisAlignment="flex-start"
                        crossAxisAlignment="center"
                        gap="2"
                        marginBottom="1"
                      >
                        <Status
                          merkleTreeRegisteredAt={airdrop.merkleTreeRegisteredAt}
                          contractRegisteredAt={airdrop.contractRegisteredAt}
                        />
                      </Row>
                    </Box>
                  </Row>
                )}
                <Row
                  mainAxisAlignment="center"
                  crossAxisAlignment="center"
                  gap="4"
                  marginTop={{ base: "2", md: "0" }}
                  paddingX={{ base: "1", md: "0" }}
                >
                  <TokenLogo
                    tokenName={airdrop.tokenName}
                    tokenLogo={airdrop.tokenLogo}
                    airdropTitle={airdrop.title}
                  />
                  <Box flex="1">
                    {isOwner && (
                      <Row
                        mainAxisAlignment="flex-start"
                        crossAxisAlignment="center"
                        gap="2"
                        marginBottom="1"
                        display={{ base: "none", md: "flex" }}
                      >
                        <Status
                          merkleTreeRegisteredAt={airdrop.merkleTreeRegisteredAt}
                          contractRegisteredAt={airdrop.contractRegisteredAt}
                        />
                      </Row>
                    )}
                    <AirdropInfo
                      airdropTitle={airdrop.title}
                      templateNamesType={airdrop.templateName}
                    />
                  </Box>
                </Row>
              </Box>
              <Box textAlign="right" width={{ base: "full", md: "50%" }}>
                <DetailedInfo
                  totalAirdropAmount={airdrop.totalAirdropAmount}
                  eligibleUsersNum={airdrop.eligibleUsersNum}
                  claimedUsersNum={airdrop.claimedUsersNum}
                  templateName={airdrop.templateName}
                  vestingEndsAt={airdrop.vestingEndsAt}
                  tokenName={airdrop.tokenName}
                  tokenSymbol={airdrop.tokenSymbol}
                  tokenDecimals={airdrop.tokenDecimals}
                />
              </Box>
            </Flex>
          </Box>
        </CardBody>
      </Card>
    </Link>
  );
}
