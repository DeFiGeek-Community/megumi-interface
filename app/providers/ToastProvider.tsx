"use client";
import { Dispatch, FC, ReactNode, SetStateAction, createContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWaitForTransactionReceipt } from "wagmi";
import { useToast } from "@chakra-ui/react";
import TxToast from "@/app/components/common/TxToast";
import { useSafeWaitForTransactionReceipt } from "../hooks/safe/useSafeWaitForTransactionReceipt";

type WritePromiseParams = {
  promise: Promise<`0x${string}`>;
  isSafe?: boolean;
};
type TxToastsContextType = {
  txid?: `0x${string}`;
  // TX hash you want to wait for
  setTxid: Dispatch<SetStateAction<`0x${string}` | undefined>>;
  // TX write promise you want to wait for. ex) return value of sendTransactionAsync or writeContractAsync
  setWritePromise: Dispatch<SetStateAction<WritePromiseParams | null>>;
  writePromise: WritePromiseParams | null;
  waitResult: ReturnType<typeof useWaitForTransactionReceipt> | null;
};

export const TxToastsContext = createContext<TxToastsContextType>({
  setTxid: () => {},
  setWritePromise: () => {},
  writePromise: null,
  waitResult: null,
});

type ProviderProps = {
  children: ReactNode;
};

const TxToastProvider: FC<ProviderProps> = ({ children }) => {
  const toast = useToast({ position: "top-right", isClosable: true });
  const [txid, setTxid] = useState<`0x${string}`>();
  const [writePromise, setWritePromise] = useState<WritePromiseParams | null>(null);
  const result = useSafeWaitForTransactionReceipt({
    hash: txid,
    isSafe: !!writePromise?.isSafe,
    query: { enabled: !!writePromise },
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (writePromise) {
      writePromise.promise
        .then((hash: `0x${string}`) => {
          toast({
            title: writePromise.isSafe
              ? t("common.safeTransactionProposed")
              : t("common.transactionSent"),
            status: "success",
            duration: 5000,
            render: (props) => <TxToast txid={hash} {...props} />,
          });
          setTxid(hash);
        })
        .catch((e) => {
          toast({
            description: e.message,
            status: "error",
            duration: 5000,
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writePromise]);

  useEffect(() => {
    if (result.isSuccess) {
      toast({
        title: t("common.transactionConfirmed"),
        status: "success",
        duration: 5000,
      });
    }
    if (result.isError) {
      toast({
        description: result.error.message,
        status: "error",
        duration: 5000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.isSuccess, result.isError]);
  return (
    <TxToastsContext.Provider
      value={{ txid, setTxid, setWritePromise, writePromise, waitResult: result }}
    >
      {children}
    </TxToastsContext.Provider>
  );
};

export default TxToastProvider;
