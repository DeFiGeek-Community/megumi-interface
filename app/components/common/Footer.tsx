"use client";
import {
  Box,
  Flex,
  Container,
  HStack,
  Text,
  Link,
  chakra,
  Select,
  Image,
  Tooltip,
} from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";
import gitbook from "@/public/images/gitbook.svg";
// import { useLocale } from "../../hooks/useLocale";
import SvgCommunityLogoBlack from "./CommunityLogoBlack";

export default function Footer() {
  // const { t, setLocale, locale } = useLocale();
  const t = (key: string) => key; // TODO
  const setLocale = (locale: "ja" | "en") => {}; // TODO
  const locale = "ja"; // TODO
  return (
    <Box px={{ base: 0, md: 4 }} pb={4} top={"0"} zIndex={100} bg={"gray.900"} opacity={0.975}>
      <Container maxW="container.2xl" px={{ base: 2, md: 4 }}>
        <Flex py="4" justifyContent="space-between" alignItems="center">
          <chakra.div flex={1}></chakra.div>
          <Flex flex={2} py="4" gridGap={4} justifyContent="center" alignItems="center">
            <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>DeFiGeek Community JAPAN</Text>}>
              <Link
                href="https://defigeek.xyz/"
                target={"_blank"}
                fontSize={"3xl"}
                _hover={{ opacity: 0.8 }}
              >
                <SvgCommunityLogoBlack width="2.5rem" height="2.5rem" />
              </Link>
            </Tooltip>
            <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>GitHub</Text>}>
              <Link
                href="https://github.com/DeFiGeek-Community/"
                target={"_blank"}
                fontSize={"3xl"}
                _hover={{ opacity: 0.8 }}
                padding={"0.3125rem"}
              >
                <AiFillGithub />
              </Link>
            </Tooltip>
            <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>GitBook</Text>}>
              <Link
                href="https://docs.megumi.xyz"
                target={"_blank"}
                fontSize={"3xl"}
                _hover={{ opacity: 0.8 }}
                padding={"0.3125rem"}
              >
                <Image w={"30px"} h={"30px"} src={gitbook.src} alt="GitBook" />
              </Link>
            </Tooltip>
          </Flex>
          <chakra.div flex={1}>
            <Select
              w={"100px"}
              size={"xs"}
              value={locale}
              onChange={(e) => setLocale(e.target.value as "ja" | "en")}
              float={"right"}
            >
              <option value={"ja"}>Japanese</option>
              <option value={"en"}>English</option>
            </Select>
          </chakra.div>
        </Flex>
        <Flex justifyContent={"center"}>
          <HStack fontSize={"xs"} spacing={1} color={"gray.400"}>
            <chakra.span>Current interface version: </chakra.span>
            <Link
              href={`https://github.com/DeFiGeek-Community/megumi-interface/commit/${process.env.NEXT_PUBLIC_GIT_ID}`}
              target={"_blank"}
            >
              {`${process.env.NEXT_PUBLIC_GIT_ID?.substring(0, 7)}`}
            </Link>
          </HStack>
        </Flex>
        <Flex justifyContent={"center"} fontSize={"sm"} color={"gray.400"}>
          © DeFiGeek Community JAPAN
        </Flex>
      </Container>
    </Box>
  );
}
