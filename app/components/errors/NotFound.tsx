"use client";
import { chakra, Heading, Divider, Card, CardBody, Container } from "@chakra-ui/react";

export default function NotFound() {
  return (
    <Container maxW={"container.md"} py={8}>
      <Card p={8}>
        <CardBody>
          <Heading fontSize={"2xl"}>404 Not Found</Heading>
          <Divider my={4} />
          <chakra.p>This page does not exist.</chakra.p>
        </CardBody>
      </Card>
    </Container>
  );
}
