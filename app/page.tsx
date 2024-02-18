import { useSession } from "next-auth/react";
import styles from "./page.module.css";
import { Container } from "@chakra-ui/react";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/authOptions";

export default async function Home() {
  // const session = useSession();
  const session = await getServerSession(authOptions);
  console.log(`session: `, session);
  return <Container>Page</Container>;
}
