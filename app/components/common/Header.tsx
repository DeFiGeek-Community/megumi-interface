"use client";
import { useState, useContext, useEffect } from "react";
import {
  chakra,
  Tag,
  Box,
  Flex,
  Container,
  Heading,
  Button,
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
  ChevronDownIcon,
} from "./chakra-ui";
import Router from "next/router";
import { useAccount, useEnsAvatar, useEnsName, useDisconnect } from "wagmi";
import { normalize } from "viem/ens";
import { useSession } from "next-auth/react";
import ConnectButton from "./ConnectButton";
// import { useLocale } from "../../hooks/useLocale";
// import CurrentUserContext from "../../contexts/CurrentUserContext";
// import SignInButton from "../shared/SignInButton";
// import ProviderLogo from "../shared/ProviderLogo";
// import ConnectButton from "../shared/connectButton";
// import { ConnectButton } from "@rainbow-me/rainbowkit";

type HeaderProps = {
  title?: string;
};

export default function Header({ title }: HeaderProps) {
  //   const { chain } = useNetwork();
  const toast = useToast({ position: "top-right", isClosable: true });
  //   const { currentUser, mutate } = useContext(CurrentUserContext);
  const { address, isConnected, connector, chain } = useAccount();
  const { data: session } = useSession();
  //   const { data: ensName } = useEnsName({
  //     address: session?.user ? currentUser.address : address,
  //   });
  //   const { data: ensAvatar } = useEnsAvatar({
  //     name: normalize(ensName?.toString()),
  //   });
  //   const [addressString, setAddressString] = useState<string>("");
  //   const { disconnect } = useDisconnect();
  //   const { t, locale } = useLocale();

  //   useEffect(() => {
  //     const _address = currentUser ? currentUser.address : address;
  //     setAddressString(`${_address?.slice(0, 5)}...${_address?.slice(-4)}`);
  //   }, [currentUser, address]);

  return (
    <Box
      px={{ base: 0, md: 4 }}
      position={"sticky"}
      top={"0"}
      zIndex={100}
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
          <HStack spacing={{ base: 2, md: 4 }}>
            {/* <ConnectButton requireAuthentication={false} chainStatus="icon" />
            <ConnectButton chainStatus="icon" /> */}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
