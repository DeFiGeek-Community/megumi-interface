"use client";
import { Box, Avatar, Card, CardBody, Flex, Text } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { Column, Row, useIsMobile } from "@/app/lib/chakra/chakraUtils";
import { DashBoardCardProps } from "@/app/interfaces/dashboard";
import RenderStatus from "@/app/components/dashboard/RenderStatus";
import RenderDateContent from "@/app/components/dashboard/RenderDateContent";

export default function DashBoardCard({
  creationDate,
  publicationDate,
  airdropTitle,
  totalAmount,
  claimedAccounts,
  vestingEndDate,
  resisteredStatus,
}: DashBoardCardProps) {
  const isMobile = useIsMobile();

  const renderDetailedInfo = () => {
    return (
      <>
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
          paddingTop="4"
          paddingX="2"
        >
          <Text flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
            エアドロップ総額
          </Text>
          <Text flex="1" textAlign="right" fontSize="lg" fontWeight="medium">
            {totalAmount}
          </Text>
        </Row>
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
          paddingX="2"
        >
          <Text flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
            クレーム済みアカウント
          </Text>
          <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
            {claimedAccounts}
          </Text>
        </Row>
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="center"
          width="100%"
          paddingX="2"
        >
          <Text flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
            ベスティング期限終了
          </Text>
          <Text flex="1" textAlign="right" fontWeight="medium" fontSize="lg">
            {vestingEndDate}
          </Text>
        </Row>
      </>
    );
  };

  const renderAirdropInfo = () => {
    return (
      <>
        <Text fontSize={isMobile ? "25px" : "30px"} fontWeight={isMobile ? "600" : "400"}>
          {airdropTitle}
        </Text>
        <Box
          bg="gray.500"
          borderRadius="md"
          px={isMobile ? "1" : "3"}
          py={isMobile ? "0.5" : "1"}
          mt="1.5"
          display="inline-flex"
          alignItems="center"
        >
          <Text fontSize={isMobile ? "sm" : "md"} marginRight="1">
            {resisteredStatus === true ? "Linear vesting" : "Standard"}
          </Text>
          <Box
            bg="white"
            borderRadius="full"
            width={isMobile ? "4" : "5"}
            height={isMobile ? "4" : "5"}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" fontWeight="bold" color="black">
              ?
            </Text>
          </Box>
        </Box>
      </>
    );
  };

  const renderCardContent = () => {
    return (
      <>
        {!isMobile ? (
          <>
            <RenderDateContent creationDate={creationDate} publicationDate={publicationDate} isMobile={isMobile}/>
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
                    {renderAirdropInfo()}
                  </Box>
                </Row>
              </Box>
              <Box textAlign="right" width="40%">
                {renderDetailedInfo()}
              </Box>
            </Row>
          </>
        ) : (
          <>
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
            <RenderDateContent creationDate={creationDate} publicationDate={publicationDate} isMobile={isMobile}/>
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
                    {renderAirdropInfo()}
                    </Box>
                  </Row>
                </Box>
              </Row>
              {renderDetailedInfo()}
            </Column>
          </>
        )}
      </>
    );
  };

  return (
    <Card width="100%">
      <CardBody paddingX={isMobile ? "1" : undefined}>{renderCardContent()}</CardBody>
    </Card>
  );
}
