import type { Metadata } from "next";
import { Container, Heading } from "@/app/components/common/chakra-ui";
import AllAirdrops from "@/app/components/airdrops/AllAirdrops";
import styles from "./page.module.css";
import { DEFAULT_METADATA } from "@/app/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return DEFAULT_METADATA;
}

export default async function Home() {
  return (
    <Container maxW={"container.lg"} py={8}>
      <Heading mb={4} fontSize={{ base: "xl", md: "3xl" }}>
        エアドロップ一覧
      </Heading>
      <AllAirdrops chainId={parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!)} />
      {/* <HStack spacing={8} py={8} w={"full"} flexWrap={"wrap"}>
        <Link
          as={NextLink}
          _hover={{ opacity: 0.75 }}
          href={`/airdrops/${process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID}/02183055-e991-f6e0-9efb-3bf10e405037`}
        >
          ・TXJPホルダーPNDエアドロップ
        </Link>
      </HStack> */}
    </Container>
  );
}
