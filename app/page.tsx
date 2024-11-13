import styles from "./page.module.css";
import NextLink from "next/link";
import { Container, Heading, HStack, Link } from "@/app/components/common/chakra-ui";
import DashBoard from "@/app/components/airdrops/DashBoard";
export default async function Home() {
  return (
    <Container maxW={"container.lg"} py={8}>
      <Heading fontSize={{ base: "xl", md: "3xl" }}>エアドロップ一覧</Heading>
      <HStack spacing={8} py={8} w={"full"} flexWrap={"wrap"}>
        <Link
          as={NextLink}
          _hover={{ opacity: 0.75 }}
          href={`/airdrops/${process.env.NEXT_PUBLIC_CHAIN_ID}/02183055-e991-f6e0-9efb-3bf10e405037`}
        >
          ・TXJPホルダーPNDエアドロップ
        </Link>
      </HStack>
      <DashBoard />
    </Container>
  );
}
