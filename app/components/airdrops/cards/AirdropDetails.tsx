import {
  Box,
  Stack,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Divider,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
export default function AirdropDetails() {
  return (
    <Box width={{ base: "100%", lg: "50%" }}>
      {/* Header Section */}
      <Box borderRadius="md" boxShadow="md" p={{ base: "0", lg: "4" }} mb={4}>
        <HStack spacing={3} mb={4}>
          <Avatar size="xl" name="YMT" bg="gray.500" />
          <Box>
            <Box
              bg="gray.500"
              borderRadius="md"
              px={{ base: "1", sm: "3" }}
              py={{ base: "0.5", sm: "1" }}
              mt="1.5"
              display="inline-flex"
              alignItems="center"
            >
              <Text fontSize={{ base: "sm", sm: "md" }} marginRight="1">
                Standard
                {/* {t(`dashboard.${formatTemplateType(templateType)}`)} */}
              </Text>
              <Box
                bg="white"
                borderRadius="full"
                width={{ base: "4", sm: "5" }}
                height={{ base: "4", sm: "5" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="sm" fontWeight="bold" color="black">
                  ?
                </Text>
              </Box>
            </Box>
            <Text fontSize="3xl" fontWeight="bold">
              YMT Early Investors Airdrop
            </Text>
            <Flex alignItems="baseline" direction={{ base: "column", md: "row" }}>
            <Flex alignItems="baseline" direction="row">
              <Text fontSize="md" fontWeight="bold" mr={1}>
                500,000
              </Text>
              <Text fontSize="sm" mr={4}>
                YMT
              </Text>
              </Flex>
              <Flex alignItems="baseline" direction="row">
              <Text fontSize="md" fontWeight="bold" mr={1}>
                314
              </Text>
              <Text fontSize="sm">/ 20,214 クレーム済みアカウント</Text>
              </Flex>
            </Flex>
          </Box>
        </HStack>
        <HStack spacing={2}>
          <Box
            bg="gray.500"
            borderRadius="md"
            px={{ base: "1", sm: "3" }}
            py={{ base: "0.5", sm: "1" }}
            mt="1.5"
            display="inline-flex"
            alignItems="center"
          >
            <Text fontSize={{ base: "sm" }} marginRight="1">
              Token address
            </Text>
          </Box>
          <Text fontSize="sm" fontWeight={{ sm: "bold" }} py={{ base: "0.5", sm: "1" }} mt="1.5" mr={{ base: "0", lg: "4" }}>
            0x0000...1234
            <Icon as={ExternalLinkIcon} ml={1} mb={1} />
          </Text>
          <Box
            bg="gray.500"
            borderRadius="md"
            px={{ base: "1", sm: "3" }}
            py={{ base: "0.5", sm: "1" }}
            mt="1.5"
            display="inline-flex"
            alignItems="center"
          >
            <Text fontSize={{ base: "sm" }} marginRight="1">
              Aidrop contract
            </Text>
          </Box>
          <Text fontSize="sm" fontWeight={{ sm: "bold" }} py={{ base: "0.5", sm: "1" }} mt="1.5">
            0x0000...1234
            <Icon as={ExternalLinkIcon} ml={1} mb={1} />
          </Text>
        </HStack>
      </Box>

      {/* Status Section */}
      <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4} mb={4}>
        <VStack spacing={0.5} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="md" fontWeight="900">
              あなたの割り当て額
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">合計</Text>
            <HStack justify="flex-start">
              <Text fontSize="3xl" fontWeight="medium">
                2,351
              </Text>
              <Text fontSize="md" fontWeight="medium">
                YMT
              </Text>
            </HStack>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">ベスティング期間終了</Text>
            <Text fontSize="3xl" fontWeight="medium">
              2025-12-21
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">請求済み</Text>
            <HStack justify="flex-start">
              <Text fontSize="3xl" fontWeight="medium">
                1,021
              </Text>
              <Text fontSize="md" fontWeight="medium">
                YMT
              </Text>
            </HStack>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">請求可能額</Text>
            <HStack justify="flex-start">
              <Text fontSize="3xl" fontWeight="medium">
                325
              </Text>
              <Text fontSize="md" fontWeight="medium">
                YMT
              </Text>
            </HStack>
          </HStack>
          <Button size="sm" colorScheme="blue" width="full" mt={4}>
            請求
          </Button>
        </VStack>
      </Box>

      {/* Menu Section */}
      <Box bg="#2E3748" borderRadius="md" boxShadow="md" p={4}>
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="md" fontWeight="900">
              オーナーメニュー
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontWeight="medium">基本情報</Text>
            <Button size="sm" width="20" colorScheme="blue">
              編集する
            </Button>
          </HStack>
          <Divider />
          <HStack justify="space-between">
            <Stack>
              <Text fontWeight="medium">エアドロップリスト</Text>
              <Text fontWeight="medium" textAlign="left">
                <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
                未登録
              </Text>
            </Stack>
            <Button size="sm" width="20" colorScheme="blue">
              登録する
            </Button>
          </HStack>
          <Divider />
          <HStack justify="space-between">
            <Stack>
              <Text fontWeight="medium">コントラクト</Text>
              <Text fontWeight="medium" textAlign="left">
                <Icon as={WarningTwoIcon} mr={1} mb={1} color="yellow.500" />
                未登録
              </Text>
            </Stack>
            <Button size="sm" width="20" colorScheme="blue">
              登録する
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
