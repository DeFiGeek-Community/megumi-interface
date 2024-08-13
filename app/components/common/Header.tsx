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
  Divider,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useAccount, useEnsAvatar, useEnsName, useDisconnect } from "wagmi";
import { normalize } from "viem/ens";
import { useSession } from "next-auth/react";
import ConnectButton from "./ConnectButton";
import { getEllipsizedAddress } from "@/app/lib/utils";
import { useEffect, useState } from "react";

type HeaderProps = {
  title?: string;
};

export default function Header({ title }: HeaderProps) {
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
      bg={"chakra-body-bg"}
      opacity={0.975}
    >
      <Container maxW="container.2xl" px={{ base: 2, md: 4 }}>
        <Flex as="header" py="4" justifyContent="space-between" alignItems="center">
          <HStack>
            <Link
              as={NextLink}
              href="/"
              textDecoration={"none"}
              _hover={{ textDecoration: "none" }}
            >
              <Heading as="h1" fontSize="xl">
                <Text
                  bgGradient="linear(to-l, #7928CA, #FF0080)"
                  bgClip="text"
                  fontSize="xl"
                  fontWeight="extrabold"
                >
                  {title ? title : t("appName")}
                </Text>
              </Heading>
            </Link>
          </HStack>
          <Menu>
            <HStack spacing={{ base: 2, md: 4 }}>
              {/* {isConnected && (
                <Link as={NextLink} href="/dashboard" _hover={{ textDecor: "none" }}>
                  <Button
                    display={{ base: "none", md: "block" }}
                    variant="ghost"
                    size={{ base: "xs", md: "sm" }}
                  >
                    {t("dashboard.title")}
                  </Button>
                </Link>
              )} */}
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
                    {/* <Link as={NextLink} href="/dashboard" _hover={{ textDecor: "none" }}>
                      <MenuItem display={{ base: "block", md: "none" }}>
                        {t("dashboard.title")}
                      </MenuItem>
                    </Link> */}
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
                    <chakra.div px={3} py={1}>
                      <ConnectButton
                        requireSignIn={false}
                        label={t("common.connectWallet")}
                        size="sm"
                      />
                    </chakra.div>
                  </>
                )}

                {/* {!session?.user && (
                  <>
                    <Flex align="center" px="2" mt="2">
                      <Divider />
                      <Text padding="2" color={"gray.400"} fontSize={"xs"} whiteSpace={"nowrap"}>
                        {t("common.manageAirdrop")}
                      </Text>
                      <Divider />
                    </Flex>
                    <chakra.div px={3} py={1}>
                      <ConnectButton
                        requireSignIn={true}
                        label={t("common.signInWithEthereum")}
                        size="sm"
                      />
                    </chakra.div>
                  </>
                )} */}
              </MenuList>
            </HStack>
          </Menu>
        </Flex>
      </Container>
    </Box>
  );
}
