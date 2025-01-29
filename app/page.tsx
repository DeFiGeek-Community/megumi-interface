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
      <AllAirdrops chainId={parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!)} />
    </Container>
  );
}
