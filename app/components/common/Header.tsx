"use client";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { normalize } from "viem/ens";
import { useAccount, useEnsAvatar, useEnsName, useDisconnect } from "wagmi";
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
  Divider,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useToast,
  Image,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import ConnectButton from "@/app/components/common/ConnectButton";
import { getEllipsizedAddress } from "@/app/utils/clientHelper";
import SafeSignInButton from "./SafeSignInButton";
import safeLogo from "@/public/images/safe.png";

type HeaderProps = {
  title?: string;
};

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { address, isConnected: isConnectedRaw, chain } = useAccount();
  const { data: session } = useSession();
  const { data: ensName } = useEnsName({
    address: session?.user ? session.user.address : address,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: normalize(ensName ? ensName.toString() : ""),
  });
  const { disconnect } = useDisconnect();
  const { t, i18n } = useTranslation();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  useEffect(() => setIsConnected(isConnectedRaw), [isConnectedRaw]);

  return (
    <Box
      px={{ base: 0, md: 4 }}
      position={"sticky"}
      top={"0"}
      zIndex={99}
      bg="#0E192B"
      borderBottom="1px solid"
      borderColor="rgba(252, 200, 98, 0.1)"
    >
      <Container maxW="container.2xl" px={{ base: 2, md: "144px" }}>
        <Flex as="header" py="4" justifyContent="space-between" alignItems="center">
          <HStack>
            <Link
              as={NextLink}
              href="/"
              textDecoration={"none"}
              _hover={{ textDecoration: "none" }}
            >
              <Image width="170px" height="32px" src="/megumi-logo.svg" alt="Megumi Logo" />
            </Link>
          </HStack>
          <Box>
            <Menu>
              <HStack spacing={{ base: 2, md: 4 }}>
                {isConnected && (
                  <Link as={NextLink} href="/dashboard" _hover={{ textDecor: "none" }}>
                    <Button
                      display={{ base: "none", md: "block" }}
                      variant="ghost"
                      size={{ base: "xs", md: "sm" }}
                    >
                      {t("dashboard.title")}
                    </Button>
                  </Link>
                )}
                <Link as={NextLink} href="/" _hover={{ textDecor: "none" }}>
                  <Button
                    variant="ghost"
                    display={{ base: "none", md: "block" }}
                    size={{ base: "xs", md: "sm" }}
                  >
                    {t("common.viewAllAirdrops")}
                  </Button>
                </Link>
                <Link as={NextLink} href="/" _hover={{ textDecor: "none" }}>
                  <Button
                    variant="ghost"
                    display={{ base: isConnected ? "none" : "block", md: "none" }}
                    size={{ base: "xs", md: "sm" }}
                  >
                    {t("common.viewAllAirdrops")}
                  </Button>
                </Link>
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
                            {session?.user?.address ? (
                              i18n.language === "ja" ? (
                                <>
                                  {getEllipsizedAddress({ ensName, address })}
                                  <chakra.span display={{ base: "none", md: "inline" }}>
                                    でログイン中
                                  </chakra.span>
                                </>
                              ) : (
                                <>
                                  <chakra.span display={{ base: "none", md: "inline" }}>
                                    Signed in as
                                  </chakra.span>{" "}
                                  {getEllipsizedAddress({ ensName, address })}
                                </>
                              )
                            ) : (
                              getEllipsizedAddress({ ensName, address })
                            )}
                          </Text>
                          {session?.user?.safeAddress && (
                            <Flex alignItems={"center"}>
                              <Image
                                width={"12px"}
                                height={"12px"}
                                alt={"Safe account"}
                                src={safeLogo.src}
                              />
                              <chakra.span fontSize={"sm"} lineHeight={1} ml={2}>
                                {session?.user?.safeAddress.slice(0, 6)}...
                                {session?.user?.safeAddress.slice(-6)}
                              </chakra.span>
                            </Flex>
                          )}
                        </VStack>
                        <ChevronDownIcon />
                      </>
                    ) : (
                      <>
                        <Text fontSize={{ base: "xs", md: "sm" }} id="account">
                          {t("common.connectWallet")}
                        </Text>
                        <ChevronDownIcon />
                      </>
                    )}
                  </HStack>
                </MenuButton>
                <MenuList zIndex={101}>
                  {isConnected && (
                    <>
                      <HStack spacing={1} px={2} display={{ base: "block", md: "none" }}>
                        <Tag size={"sm"}>
                          {typeof chain === "undefined" ? "Unsupported Chain" : chain?.name}
                        </Tag>
                        {session?.user?.address && (
                          <Tag size={"sm"} ml={1}>
                            Signed in
                          </Tag>
                        )}
                      </HStack>
                      <Link as={NextLink} href="/dashboard" _hover={{ textDecor: "none" }}>
                        <MenuItem display={{ base: "block", md: "none" }}>
                          {t("dashboard.title")}
                        </MenuItem>
                      </Link>
                      <Link as={NextLink} href="/" _hover={{ textDecor: "none" }}>
                        <MenuItem display={{ base: "block", md: "none" }}>
                          {t("common.viewAllAirdrops")}
                        </MenuItem>
                      </Link>
                    </>
                  )}

                  {isConnected && <Divider display={{ base: "block", md: "none" }} />}

                  {isConnected && (
                    <MenuItem onClick={() => disconnect()}>{t("common.disconnect")}</MenuItem>
                  )}

                  {!isConnected && (
                    <>
                      <Flex align="center" px="2">
                        <Divider />
                        <Text p="2" color={"gray.400"} fontSize={"xs"} whiteSpace={"nowrap"}>
                          {t("common.joinAirdrop")}
                        </Text>
                        <Divider />
                      </Flex>
                      <VStack px={3} py={1} spacing={3}>
                        <chakra.span w={"full"}>
                          <ConnectButton
                            requireSignIn={false}
                            label={t("common.connectWallet")}
                            size="sm"
                          />
                        </chakra.span>
                      </VStack>
                    </>
                  )}

                  {!session?.user && (
                    <>
                      <Flex align="center" px="2" mt="2">
                        <Divider />
                        <Text padding="2" color={"gray.400"} fontSize={"xs"} whiteSpace={"nowrap"}>
                          {t("common.manageAirdrop")}
                        </Text>
                        <Divider />
                      </Flex>
                      <VStack px={3} py={1} spacing={3}>
                        <chakra.span w={"full"}>
                          <ConnectButton
                            requireSignIn={true}
                            label={t("common.signInWithEthereum")}
                            size="sm"
                          />
                        </chakra.span>
                        <SafeSignInButton
                          id="safe-sign-in-with-ethereum-connection"
                          size={"sm"}
                          w="full"
                          onSignInError={(error: string) => {
                            toast({
                              description: error,
                              status: "error",
                              duration: 5000,
                            });
                          }}
                        />
                      </VStack>
                    </>
                  )}
                </MenuList>
              </HStack>
            </Menu>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
