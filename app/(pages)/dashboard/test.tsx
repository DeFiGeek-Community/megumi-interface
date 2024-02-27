"use client";
import { Container, Button, Heading } from "@chakra-ui/react";
import { TxToastsContext } from "@/app/providers/ToastProvider";
import { useContext } from "react";
import { parseEther } from "viem";
import { useTranslation } from "react-i18next";

import { useSendTransaction, useAccount } from "wagmi";

export default function Test() {
  const { setTxid, setWritePromise } = useContext(TxToastsContext);
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

  return (
    <Container>
      <Heading>Sample transaction</Heading>
      <Button
        onClick={() => {
          const result = sendTransactionAsync({
            to: address!,
            value: parseEther("0.01"),
          });
          setWritePromise(result);
        }}
      >
        Sample transaction
      </Button>
    </Container>
  );
}
