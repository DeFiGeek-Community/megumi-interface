import { Flex } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { RenderStatusProps } from "@/app/interfaces/dashboard";

export default function RenderStatus({ isResistered }: RenderStatusProps): JSX.Element {
  return (
    <>
      <Flex
        alignItems="center"
        bg={isResistered ? "green.100" : undefined}
        color={isResistered ? "green.800" : "gray.400"}
        fontSize="xs"
        fontWeight="medium"
        px="2.5"
        py="0.5"
        borderRadius="full"
      >
        <CheckCircleIcon
          boxSize="3"
          marginRight="1"
          color={isResistered ? undefined : "gray.400"}
        />
        {isResistered?"エアドロップリスト登録済":"エアドロップリスト未登録"}
      </Flex>
      <Flex
        alignItems="center"
        bg={isResistered ? "blue.100" : undefined}
        color={isResistered ? "blue.800" : "gray.400"}
        fontSize="xs"
        fontWeight="medium"
        px="2.5"
        py="0.5"
        borderRadius="full"
      >
        <CheckCircleIcon
          boxSize="3"
          marginRight="1"
          color={isResistered ? undefined : "gray.400"}
        />
        {isResistered?"コントラクト登録済":"コントラクト未登録"}
      </Flex>
    </>
  );
};