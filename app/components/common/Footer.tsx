"use client";
import { Box, Flex, Container, Text, Link, chakra, Select, Image, Tooltip } from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import gitbook from "@/public/images/gitbook.svg";
import discord from "@/public/images/discord-mark-white.png";
import SvgCommunityLogoBlack from "./CommunityLogoBlack";
import GradientDivider from "./GradientDivider";
import SocialLink from "./SocialLink";

export default function Footer() {
  const { i18n } = useTranslation();
  return (
    <Box
      px={{ base: 0, md: 4 }}
      pb={4}
      top={"0"}
      zIndex={100}
      bg="brand.bg.primary"
      position="relative"
      borderTop="1px solid"
      borderColor="brand.border.subtle"
    >
      <GradientDivider variant="top" />
      <Container maxW="container.2xl" px={{ base: 2, md: 4 }}>
        <Flex py="4" justifyContent="space-between" alignItems="center">
          <chakra.div flex={1}></chakra.div>
          <Flex flex={2} py="4" gridGap={4} justifyContent="center" alignItems="center">
            <SocialLink
              href="https://defigeek.xyz/"
              label="DeFiGeek Community JAPAN"
              icon={<SvgCommunityLogoBlack width="2.5rem" height="2.5rem" />}
            />
            <SocialLink
              href="https://discord.gg/FQYXqVBEnh"
              label="Discord"
              imageSrc={discord.src}
            />
            <SocialLink
              href="https://github.com/DeFiGeek-Community/"
              label="GitHub"
              icon={<AiFillGithub />}
            />
            {/* <SocialLink
              href="https://docs.megumi.xyz"
              label="GitBook"
              imageSrc={gitbook.src}
            /> */}
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
          <Text
            as="span"
            bgGradient="linear(to-r, #FFD4A8, #F5A962, #FCC862, #EDB36F)"
            bgClip="text"
          >
            © DeFiGeek Community JAPAN
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
