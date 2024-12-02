import React from "react";
import { Box, Avatar, Flex } from "@chakra-ui/react";
import { Row } from "@/app/lib/chakra/chakraUtils";
import Status from "@/app/components/airdrops/cards/Status";
import DateContent from "@/app/components/airdrops/cards/DateContent";
import DetailedInfo from "@/app/components/airdrops/cards/DetailedInfo";
import AirdropInfo from "@/app/components/airdrops/cards/AirdropInfo";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";

export default function CardContent(props: DashBoardCardProps): JSX.Element {
  return (
    <Box>
      <DateContent
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
                <Status
                  isAirdropResistered={props.isResisteredAirdrop}
                  isContractResistered={props.isResisteredContract}
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
                  isAirdropResistered={props.isResisteredAirdrop}
                  isContractResistered={props.isResisteredContract}
                />
              </Row>
              <AirdropInfo
                airdropTitle={props.airdropTitle}
                templeteType={props.templeteType}
              />
            </Box>
          </Row>
        </Box>
        <Box textAlign="right" width={{ base: "full", md: "40%" }}>
          <DetailedInfo
            totalAmount={props.totalAmount}
            claimedAccounts={props.claimedAccounts}
            vestingEndDate={props.vestingEndDate}
          />
        </Box>
      </Flex>
    </Box>
  );
}
