"use client";
import { useAccount } from "wagmi";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  chakra,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  ToastProps,
  CloseButton,
  Link,
} from "@chakra-ui/react";
import { getEtherscanLink } from "@/app/lib/utils";

export type TxSentToast = {
  txid: `0x${string}`;
} & ToastProps;

export default function TxSentToast({
  status,
  variant = "solid",
  colorScheme,
  id,
  title,
  isClosable,
  onClose,
  description,
  icon,
  txid,
}: TxSentToast) {
  const ids = id
    ? {
        root: `toast-${id}`,
        title: `toast-${id}-title`,
        description: `toast-${id}-description`,
      }
    : undefined;
  const { chain } = useAccount();

  return (
    <Alert
      addRole={false}
      status={status}
      variant={variant}
      colorScheme={colorScheme}
      id={ids?.root}
      alignItems="start"
      borderRadius="md"
      boxShadow="lg"
      paddingEnd={8}
      textAlign="start"
      width="auto"
    >
      <AlertIcon>{icon}</AlertIcon>
      <chakra.div flex="1" maxWidth="100%">
        {title && <AlertTitle id={ids?.title}>{title}</AlertTitle>}
        <AlertDescription display="block">
          {description}
          {chain && (
            <Link href={getEtherscanLink(chain, txid, "tx")} target={"_blank"}>
              Etherscan <ExternalLinkIcon ml={1} />
            </Link>
          )}
        </AlertDescription>
      </chakra.div>
      {isClosable && (
        <CloseButton size="sm" onClick={onClose} position="absolute" insetEnd={1} top={1} />
      )}
    </Alert>
  );
}
