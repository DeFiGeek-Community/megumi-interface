"use client";
import { Card, CardBody } from "@chakra-ui/react";
import React from "react";
import { Box, Avatar, Flex } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import Status from "@/app/components/airdrops/cards/Status";
import DateContent from "@/app/components/airdrops/cards/DateContent";
import DetailedInfo from "@/app/components/airdrops/cards/DetailedInfo";
import AirdropInfo from "@/app/components/airdrops/cards/AirdropInfo";

import {
  formatDate,
  formatTotalAirdropAmount,
  formatClaimedAccounts,
  formatVestingEndsAt,
} from "@/app/utils/clientHelper";
import { TemplateNames } from "@/app/lib/constants/templates";
// TODO remove mock type
import { Airdrop } from "@/app/types/airdrop";

export default function DashBoardCard({ airdrop }: { airdrop: Airdrop }) {
  let airdropContractDeployedAt = "-",
    airdropCreatedAt = "-",
    currentTotalAirdropAmount = "0",
    currentClaimedAccounts = "0 / 0",
    currentVestingEndsAt = "-",
    isRegisteredAirdrop = false,
    isRegisteredContract = false,
    isLinearVesting = false;

  airdropContractDeployedAt = formatDate(airdrop.contractDeployedAt);
  airdropCreatedAt = formatDate(airdrop.createdAt);
  currentTotalAirdropAmount = formatTotalAirdropAmount(airdrop.totalAirdropAmount);
  currentClaimedAccounts = formatClaimedAccounts(airdrop.eligibleUsersNum, airdrop.claimedUsersNum);
  if ("vestingEndsAt" in airdrop) {
    currentVestingEndsAt = formatVestingEndsAt(airdrop.vestingEndsAt);
  }
  isRegisteredAirdrop = !!airdrop.merkleTreeUploadedAt;
  isRegisteredContract = !!airdrop.contractAddress;
  isLinearVesting = airdrop.templateName === TemplateNames.LINEAR_VESTING;

  return (
    <Card width="100%">
      <CardBody paddingX={{ base: "1", sm: "5" }}>
        <Box>
          <DateContent
            creationDate={airdropCreatedAt}
            publicationDate={airdropContractDeployedAt}
          />
          <Flex
            flexDirection={{ base: "column", md: "row" }}
            justifyContent="center"
            alignItems="center"
            gap="4"
          >
            <Box width={{ base: "full", md: "60%" }}>
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
                      isAirdropRegistered={isRegisteredAirdrop}
                      isContractRegistered={isRegisteredContract}
                    />
                  </Row>
                </Box>
              </Row>
              <Row
                mainAxisAlignment="center"
                crossAxisAlignment="center"
                gap="4"
                marginTop={{ base: "2", md: "0" }}
                paddingX={{ base: "1", md: "0" }}
              >
                <Avatar size={{ base: "md", md: "lg" }} name="YMT" bg="gray.500" />
                <Box flex="1">
                  <Row
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment="center"
                    gap="2"
                    marginBottom="1"
                    display={{ base: "none", md: "flex" }}
                  >
                    <Status
                      isAirdropRegistered={isRegisteredAirdrop}
                      isContractRegistered={isRegisteredContract}
                    />
                  </Row>
                  <AirdropInfo airdropTitle={airdrop.title} templateType={airdrop.templateName} />
                </Box>
              </Row>
            </Box>
            <Box textAlign="right" width={{ base: "full", md: "40%" }}>
              <DetailedInfo
                totalAmount={currentTotalAirdropAmount}
                claimedAccounts={currentClaimedAccounts}
                isLinearVesting={isLinearVesting}
                vestingEndDate={currentVestingEndsAt}
              />
            </Box>
          </Flex>
        </Box>
      </CardBody>
    </Card>
  );
}
