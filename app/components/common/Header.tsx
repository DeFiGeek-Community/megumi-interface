"use client";
import {
  chakra,
  Tag,
  Box,
  Flex,
  Container,
  Heading,
  HStack,
  Avatar,
  Text,
  VStack,
  useToast,
  Divider,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import Router from "next/router";
import { useAccount, useEnsAvatar, useEnsName, useDisconnect } from "wagmi";
import { normalize } from "viem/ens";
import { useSession } from "next-auth/react";
import ConnectButton from "./ConnectButton";
import { useIsMounted } from "@/app/hooks/common/useIsMounted";
// import { useLocale } from "../../hooks/useLocale";

type HeaderProps = {
  title?: string;
};

export default function Header({ title }: HeaderProps) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { address, isConnected, connector, chain } = useAccount();
  const { data: session } = useSession();
  const { data: ensName } = useEnsName({
    address: session?.user ? session?.user.address : address,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: normalize(ensName ? ensName.toString() : ""),
  });
  const { disconnect } = useDisconnect();
  //   const { t, locale } = useLocale();

  const isMounted = useIsMounted();
  if (!isMounted) return <></>;

  return (
    <Box
      px={{ base: 0, md: 4 }}
      position={"sticky"}
      top={"0"}
      zIndex={99}
      bg={"chakra-body-bg"}
      opacity={0.975}
    >
      <Container maxW="container.2xl" px={{ base: 2, md: 4 }}>
        <Flex as="header" py="4" justifyContent="space-between" alignItems="center">
          <HStack>
            <Link href="/" textDecoration={"none"} _hover={{ textDecoration: "none" }}>
              <Heading as="h1" fontSize="xl">
                <Text
                  bgGradient="linear(to-l, #7928CA, #FF0080)"
                  bgClip="text"
                  fontSize="xl"
                  fontWeight="extrabold"
                >
                  {title ? title : "Megumi"}
                </Text>
              </Heading>
            </Link>
          </HStack>
          <Menu>
            <HStack spacing={{ base: 2, md: 4 }}>
              <MenuButton>
                <HStack>
                  {isConnected ? (
                    <>
                      {ensName && ensAvatar && <Avatar size={"sm"} src={ensAvatar} ml={1} />}
                      <VStack
                        display={{ base: "flex", md: "flex" }}
                        alignItems="flex-start"
                        spacing="1px"
                        ml="2"
                      >
                        <Text fontSize="sm" id="account">
                          <chakra.span display={{ base: "none", md: "inline" }}>
                            {ensName
                              ? `${ensName}`
                              : `${session?.user?.address?.slice(
                                  0,
                                  5,
                                )}...${session?.user?.address?.slice(-4)}`}
                            {session?.user?.address ? "でログイン中" : ""}
                          </chakra.span>
                        </Text>
                      </VStack>
                      <ChevronDownIcon />
                    </>
                  ) : (
                    <>
                      <Text fontSize={{ base: "xs", md: "sm" }} id="account">
                        CONNECT_WALLET
                      </Text>
                      <ChevronDownIcon />
                    </>
                  )}
                </HStack>
              </MenuButton>
              <MenuList zIndex={101}>
                <HStack spacing={1} px={2} display={{ base: "block", md: "none" }}>
                  {session?.user?.address && (
                    <Tag size={"sm"} ml={1}>
                      Signed in
                    </Tag>
                  )}
                </HStack>
                {session?.user && (
                  <MenuItem
                    display={{ base: "block", md: "none" }}
                    onClick={() => Router.push("/dashboard")}
                  >
                    Dashboard
                  </MenuItem>
                )}
                {isConnected && (
                  <MenuItem
                    display={{ base: "block", md: "none" }}
                    onClick={() => Router.push("/airdrops")}
                  >
                    View all airdrops
                  </MenuItem>
                )}
                <Divider display={{ base: "block", md: "none" }} />

                {isConnected && <MenuItem onClick={() => disconnect()}>Disconnect</MenuItem>}

                {!isConnected && (
                  <>
                    <Flex align="center" px="2">
                      <Divider />
                      <Text p="2" color={"gray.400"} fontSize={"xs"} whiteSpace={"nowrap"}>
                        JOIN_AIRDROP
                      </Text>
                      <Divider />
                    </Flex>
                    <chakra.div px={3} py={1}>
                      <ConnectButton requireSignIn={false} label="Connect Wallet" size="sm" />
                    </chakra.div>
                  </>
                )}

                {!session?.user && (
                  <>
                    <Flex align="center" px="2" mt="2">
                      <Divider />
                      <Text padding="2" color={"gray.400"} fontSize={"xs"} whiteSpace={"nowrap"}>
                        Manage Airdrop
                      </Text>
                      <Divider />
                    </Flex>
                    <chakra.div px={3} py={1}>
                      <ConnectButton requireSignIn={true} label="Sign In With Ethereum" size="sm" />
                    </chakra.div>
                  </>
                )}
              </MenuList>
            </HStack>
          </Menu>
        </Flex>
      </Container>
    </Box>
  );
}
