"use client";
import { Box, Flex, Container, Text, Link, chakra, Select, Image, Tooltip } from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import gitbook from "@/public/images/gitbook.svg";
import discord from "@/public/images/discord-mark-white.png";
import SvgCommunityLogoBlack from "./CommunityLogoBlack";

export default function Footer() {
  const { i18n } = useTranslation();
  return (
    <Box 
      px={{ base: 0, md: 4 }} 
      pb={4} 
      top={"0"} 
      zIndex={100} 
      bg={"#0E192B"}
      position="relative"
      borderTop="1px solid"
      borderColor="rgba(245, 169, 98, 0.08)"
      _before={{
        content: '""',
        position: "absolute",
        top: "-1px",
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent 0%, rgba(255, 212, 168, 0.3) 20%, rgba(252, 200, 98, 0.4) 50%, rgba(245, 169, 98, 0.3) 80%, transparent 100%)",
        opacity: 0.5,
      }}
    >
      <Container maxW="container.2xl" px={{ base: 2, md: 4 }}>
        <Flex py="4" justifyContent="space-between" alignItems="center">
          <chakra.div flex={1}></chakra.div>
          <Flex flex={2} py="4" gridGap={4} justifyContent="center" alignItems="center">
            <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>DeFiGeek Community JAPAN</Text>}>
              <Link
                href="https://defigeek.xyz/"
                target={"_blank"}
                fontSize={"3xl"}
                width={"40px"}
                _hover={{ opacity: 0.8 }}
              >
                <SvgCommunityLogoBlack width="2.5rem" height="2.5rem" />
              </Link>
            </Tooltip>
            <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>Discord</Text>}>
              <Link
                href="https://discord.gg/FQYXqVBEnh"
                target={"_blank"}
                fontSize={"3xl"}
                opacity={0.85}
                width={"40px"}
                _hover={{ opacity: 0.6 }}
                padding={"0.3125rem"}
              >
                <Image w={"30px"} src={discord.src} />
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
            {/* <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>GitBook</Text>}>
              <Link
                href="https://docs.megumi.xyz"
                target={"_blank"}
                fontSize={"3xl"}
                _hover={{ opacity: 0.8 }}
                padding={"0.3125rem"}
              >
                <Image w={"30px"} h={"30px"} src={gitbook.src} />
              </Link>
            </Tooltip> */}
          </Flex>
          <chakra.div flex={1}>
            <Select
              w={"100px"}
              size={"xs"}
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              float={"right"}
            >
              <option value={"ja"}>Japanese</option>
              <option value={"en"}>English</option>
            </Select>
          </chakra.div>
        </Flex>
        <Flex justifyContent={"center"} fontSize={"sm"} color={"rgba(255, 255, 255, 0.5)"}>
          <Text as="span" bgGradient="linear(to-r, #FFD4A8, #F5A962, #FCC862, #EDB36F)" bgClip="text">
            © DeFiGeek Community JAPAN
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
