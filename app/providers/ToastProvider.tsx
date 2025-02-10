"use client";
import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useToast } from "@chakra-ui/react";
import TxToast from "@/app/components/common/TxToast";
import { getErrorMessage } from "../utils/shared";
import { config } from "./Web3Provider";
import { resolveSafeTx } from "../utils/safe";

type WritePromiseParams = {
  promise: Promise<`0x${string}`>;
  isSafe?: boolean;
};
type TxToastsContextType = {
  addTxPromise: (promise: WritePromiseParams) => void;
};

export const TxToastsContext = createContext<TxToastsContextType>({
  addTxPromise: () => {},
});

type ProviderProps = {
  children: ReactNode;
};

const TxToastProvider: FC<ProviderProps> = ({ children }) => {
  const { chainId } = useAccount();
  const toast = useToast({ position: "top-right", isClosable: true });
  const [txPromise, setTxPromise] = useState<WritePromiseParams[]>([]);
  const [processedPromiseIndex, setProcessedPromiseIndex] = useState<number[]>([]);
  const { t } = useTranslation();

  const addTxPromise = (promise: WritePromiseParams) => {
    setTxPromise([...txPromise, promise]);
  };

  const handlePromise = async (item: WritePromiseParams) => {
    let hash: `0x${string}`;
    try {
      hash = await item.promise;
      toast({
        title: item.isSafe ? t("common.safeTransactionProposed") : t("common.transactionSent"),
        status: "success",
        duration: 5000,
        render: (props) => (item.isSafe ? null : <TxToast txid={hash} {...props} />),
      });

      if (item.isSafe && chainId) {
        const resolvedHash = await resolveSafeTx(chainId, hash);
        if (!resolvedHash) throw new Error("Safe transaction couldn't resolved");
        hash = resolvedHash;
      }

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash,
      });

      toast({
        title: t("common.transactionConfirmed"),
        status: "success",
        duration: 5000,
      });
    } catch (e: unknown) {
      toast({
        description: getErrorMessage(e),
        status: "error",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const index = txPromise.length - 1;
    if (index < 0 || processedPromiseIndex.includes(index)) return;
    const target = txPromise[index];

    setProcessedPromiseIndex([...processedPromiseIndex, index]);

    handlePromise(target);
  }, [txPromise.length]);

  return <TxToastsContext.Provider value={{ addTxPromise }}>{children}</TxToastsContext.Provider>;
};

export default TxToastProvider;
