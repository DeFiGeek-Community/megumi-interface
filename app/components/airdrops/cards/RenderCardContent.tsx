import React from "react";
import { Box, Avatar, Flex } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import RenderStatus from "@/app/components/airdrops/cards/RenderStatus";
import RenderDateContent from "@/app/components/airdrops/cards/RenderDateContent";
import RenderDetailedInfo from "@/app/components/airdrops/cards/RenderDetailedInfo";
import RenderAirdropInfo from "@/app/components/airdrops/cards/RenderAirdropInfo";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";

export default function RenderCardContent(props: DashBoardCardProps): JSX.Element {
  return (
    <Box>
      <RenderDateContent
        creationDate={props.creationDate}
        publicationDate={props.publicationDate}
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
                <RenderStatus
                  isAirdropResistered={props.resisteredAirdropStatus}
                  isContractResistered={props.resisteredContractStatus}
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
                <RenderStatus
                  isAirdropResistered={props.resisteredAirdropStatus}
                  isContractResistered={props.resisteredContractStatus}
                />
              </Row>
              <RenderAirdropInfo
                airdropTitle={props.airdropTitle}
                templeteType={props.templeteType}
              />
            </Box>
          </Row>
        </Box>
        <Box textAlign="right" width={{ base: "full", md: "40%" }}>
          <RenderDetailedInfo
            totalAmount={props.totalAmount}
            claimedAccounts={props.claimedAccounts}
            vestingEndDate={props.vestingEndDate}
          />
        </Box>
      </Flex>
    </Box>
  );
}
