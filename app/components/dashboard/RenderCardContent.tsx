import React from "react";
import { Box, Avatar } from "@chakra-ui/react";
import { Column, Row } from "@/app/lib/chakra/chakraUtils";
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
  isMobile,
}: DashBoardCardProps & { isMobile: boolean }): JSX.Element {
  return (
    <>
      {!isMobile ? (
        <>
          <RenderDateContent
            creationDate={creationDate}
            publicationDate={publicationDate}
            isMobile={isMobile}
          />
          <Row mainAxisAlignment="center" crossAxisAlignment="center" gap="4">
            <Box width="60%">
              <Row mainAxisAlignment="center" crossAxisAlignment="center" gap="4">
                <Avatar size="lg" name="YMT" bg="gray.500" />
                <Box flex="1">
                  <Row
                    mainAxisAlignment="flex-start"
                    crossAxisAlignment="center"
                    gap="2"
                    marginBottom="1"
                  >
                    <RenderStatus isResistered={resisteredStatus} />
                  </Row>
                  <RenderAirdropInfo
                    airdropTitle={airdropTitle}
                    vestingType={vestingType}
                    isMobile={isMobile}
                  />
                </Box>
              </Row>
            </Box>
            <Box textAlign="right" width="40%">
              <RenderDetailedInfo
                totalAmount={totalAmount}
                claimedAccounts={claimedAccounts}
                vestingEndDate={vestingEndDate}
              />
            </Box>
          </Row>
        </>
      ) : (
        <>
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
            <RenderDateContent
              creationDate={creationDate}
              publicationDate={publicationDate}
              isMobile={isMobile}
            />
            <Row mainAxisAlignment="center" crossAxisAlignment="center" gap="4" marginTop="3">
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
              marginTop="2"
              paddingX="1"
            >
              <Box width="100%">
                <Row mainAxisAlignment="center" crossAxisAlignment="center" gap="4">
                  <Avatar size="md" name="YMT" bg="gray.500" />
                  <Box flex="1">
                    <RenderAirdropInfo
                      airdropTitle={airdropTitle}
                      vestingType={vestingType}
                      isMobile={isMobile}
                    />
                  </Box>
                </Row>
              </Box>
            </Row>
            <RenderDetailedInfo
              totalAmount={totalAmount}
              claimedAccounts={claimedAccounts}
              vestingEndDate={vestingEndDate}
            />
          </Column>
        </>
      )}
    </>
  );
}
