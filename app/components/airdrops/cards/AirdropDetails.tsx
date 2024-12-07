import { Box, VStack, HStack, Text, Button, Avatar, Badge, Divider } from "@chakra-ui/react"

export default function AirdropDetails() {
  return (
    <Box maxW="md" mx="auto" p={4}>
      {/* Header Section */}
      <Box bg="white" borderRadius="md" boxShadow="md" p={4} mb={4}>
        <HStack spacing={3} mb={2}>
          <Avatar size="md" bg="gray.200" />
          <Box>
            <Text fontWeight="semibold">YMT Early Investors Airdrop</Text>
            <Text fontSize="sm" color="gray.600">500,000 YMT</Text>
          </Box>
        </HStack>
        <HStack spacing={2}>
          <Badge>Token: ymt-12</Badge>
          <Badge>Details: ymt-12</Badge>
        </HStack>
      </Box>

      {/* Status Section */}
      <Box bg="white" borderRadius="md" boxShadow="md" p={4} mb={4}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">合計</Text>
            <Text fontWeight="medium">2,351 YMT</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">ベスティング期間終了</Text>
            <Text fontWeight="medium">2025-12-21</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">残高</Text>
            <Text fontWeight="medium">1,021 YMT</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">最小残高</Text>
            <Text fontWeight="medium">325 YMT</Text>
          </HStack>
          <Button size="sm" colorScheme="blue" width="full">
            詳細
          </Button>
        </VStack>
      </Box>

      {/* Menu Section */}
      <Box bg="white" borderRadius="md" boxShadow="md" p={4}>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="medium">基本情報</Text>
            <Button size="sm" variant="outline" width="20">
              詳細
            </Button>
          </HStack>
          <Divider />
          <HStack justify="space-between">
            <Text fontWeight="medium">エアドロップリスト</Text>
            <Button size="sm" variant="outline" width="20">
              詳細
            </Button>
          </HStack>
          <Divider />
          <HStack justify="space-between">
            <Text fontWeight="medium">コンタクト</Text>
            <Button size="sm" variant="outline" width="20">
              詳細
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}