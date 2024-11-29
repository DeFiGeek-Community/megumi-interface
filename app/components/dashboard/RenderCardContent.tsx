import React from "react";
import { Box, Avatar, Flex } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import RenderStatus from "@/app/components/dashboard/RenderStatus";
import RenderDateContent from "@/app/components/dashboard/RenderDateContent";
import RenderDetailedInfo from "@/app/components/dashboard/RenderDetailedInfo";
import RenderAirdropInfo from "@/app/components/dashboard/RenderAirdropInfo";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";

export default function RenderCardContent({
  creationDate,
  publicationDate,
  airdropTitle,
  vestingType,
  totalAmount,
  claimedAccounts,
  vestingEndDate,
  resisteredStatus,
}: DashBoardCardProps): JSX.Element {
  return (
    <Box>
      <RenderDateContent creationDate={creationDate} publicationDate={publicationDate} />
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
                <RenderStatus isResistered={resisteredStatus} />
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
                <RenderStatus isResistered={resisteredStatus} />
              </Row>
              <RenderAirdropInfo airdropTitle={airdropTitle} vestingType={vestingType} />
            </Box>
          </Row>
        </Box>
        <Box textAlign="right" width={{ base: "full", md: "40%" }}>
          <RenderDetailedInfo
            totalAmount={totalAmount}
            claimedAccounts={claimedAccounts}
            vestingEndDate={vestingEndDate}
          />
        </Box>
      </Flex>
    </Box>
  );
}
