"use client";
import styles from "./page.module.css";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Flex, Stack, Container, Heading, Button, chakra } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import MerkleTree from "@/app/lib/constants/merkle-tree.json";
import StandardABI from "@/app/lib/constants/abis/Standard.json";
import { CONTRACT_ADDRESSES } from "@/app/lib/constants/contracts";
import ConnectButton from "@/app/components/common/ConnectButton";
import { TxToastsContext } from "@/app/providers/ToastProvider";

export default function Airdrop({ params }: { params: { chainId: string; id: string } }) {
  const TOKEN_SYMBOL = "PND";
  const UUID = "02183055-e991-f6e0-9efb-3bf10e405037";
  const { t } = useTranslation();
  const { address, isConnected: isConnectedRaw, chainId } = useAccount();

  // TODO define as a hook --->
  const getClaimParameters = useCallback(() => {
    if (!address || !(address in MerkleTree.claims)) return [];
    const { index, amount, proof } = MerkleTree.claims[address as keyof typeof MerkleTree.claims];
    return [index, address, amount, proof];
  }, [address]);
  const { data, isError, isSuccess, failureReason } = useSimulateContract({
    address: chainId ? CONTRACT_ADDRESSES[chainId].PND_AIRDROP : "0x",
    abi: StandardABI,
    functionName: "claim",
    args: getClaimParameters(),
    value: parseEther("0.0002"),
  });
  const { writeContractAsync, status } = useWriteContract();
  const { setWritePromise } = useContext(TxToastsContext);
  const {} = useWaitForTransactionReceipt();
  // <---

  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  useEffect(() => {
    setIsClaimed(!!failureReason && failureReason.message.includes("Error: AlreadyClaimed()"));
  }, [failureReason]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  useEffect(() => setIsConnected(isConnectedRaw), [isConnectedRaw]);

  // Get token
  const { data: tokenData, isLoading: isLoadingToken } = useReadContract({
    address: chainId ? CONTRACT_ADDRESSES[chainId].PND_AIRDROP : "0x",
    abi: StandardABI,
    functionName: "token",
  });

  // Get token balance on airdrop contract
  const { data: balanceOnContract } = useBalance({
    address: chainId ? CONTRACT_ADDRESSES[chainId].PND_AIRDROP : "0x",
    token: !!tokenData ? (tokenData as `0x${string}`) : "0x",
  });
  // console.log("Token balance on contract: ", balanceOnContract?.value.toString());

  const handleWrite = async () => {
    try {
      setWritePromise(writeContractAsync(data!.request));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (params.id !== UUID) {
    return (
      <Container py={8} textAlign={"center"}>
        <Heading>404 Not Fount</Heading>
        <chakra.div>エアドロップがありません</chakra.div>
      </Container>
    );
  }

  return (
    <Container py={8} textAlign={"center"}>
      <Heading>TXJPホルダーPNDエアドロップ</Heading>
      <Flex py={8} justifyContent={"center"}>
        <Stack alignItems={"center"}>
          {isConnected && getClaimParameters().length > 0 && (
            <>
              <chakra.div>{t("airdrop.eligible")} 🎉</chakra.div>
              <chakra.div>
                <chakra.span fontSize={"2xl"}>
                  {(BigInt((getClaimParameters() as any)[2]) / BigInt(10 ** 18)).toString()}
                </chakra.span>
                <chakra.span fontSize={"md"}> {TOKEN_SYMBOL}</chakra.span>
              </chakra.div>
            </>
          )}{" "}
          {isConnected && getClaimParameters().length === 0 && (
            <chakra.div>{t("airdrop.notEligible")} 😔</chakra.div>
          )}
          {isConnected ? (
            <>
              <Button
                mt={4}
                isDisabled={!Boolean(data?.request) || status === "pending"}
                isLoading={status === "pending"}
                onClick={() => handleWrite()}
                colorScheme={"green"}
              >
                {isClaimed ? t("airdrop.claimed") : t("airdrop.claim")}
              </Button>
              {!isClaimed &&
                !!balanceOnContract &&
                balanceOnContract.value < BigInt((getClaimParameters() as any)[2]) && (
                  <chakra.p color="red">
                    <WarningIcon mr={2} />
                    Airdrop contract does not have enough token.
                  </chakra.p>
                )}
            </>
          ) : (
            <chakra.div>
              <ConnectButton requireSignIn={false} label={t("common.connectWallet")} size="sm" />
            </chakra.div>
          )}
          <chakra.span fontSize={"sm"} color={"grey"}>
            ※ {t("airdrop.feeNotice")}
          </chakra.span>
        </Stack>
      </Flex>
    </Container>
  );
}
