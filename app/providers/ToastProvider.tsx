"use client";
import { Dispatch, FC, ReactNode, SetStateAction, createContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWaitForTransactionReceipt } from "wagmi";
import { useToast } from "@chakra-ui/react";
import TxToast from "@/app/components/common/TxToast";

export type TxToastsContextType = {
  txid?: `0x${string}`;
  // TX hash you want to wait for
  setTxid: Dispatch<SetStateAction<`0x${string}` | undefined>>;
  // TX write promise you want to wait for. ex) return value of sendTransactionAsync or writeContractAsync
  setWritePromise: Dispatch<SetStateAction<Promise<`0x${string}`> | undefined>>;
};

export const TxToastsContext = createContext<TxToastsContextType>({
  setTxid: () => {},
  setWritePromise: () => {},
});

type ProviderProps = {
  children: ReactNode;
};

const TxToastProvider: FC<ProviderProps> = ({ children }) => {
  const toast = useToast({ position: "top-right", isClosable: true });
  const [txid, setTxid] = useState<`0x${string}`>();
  const [writePromise, setWritePromise] = useState<Promise<`0x${string}`>>();
  const result = useWaitForTransactionReceipt({ hash: txid });
  const { t } = useTranslation();

  useEffect(() => {
    if (writePromise) {
      writePromise
        .then((hash: `0x${string}`) => {
          toast({
            title: t("common.transactionSent"),
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
    <TxToastsContext.Provider value={{ txid, setTxid, setWritePromise }}>
      {children}
    </TxToastsContext.Provider>
  );
};

export default TxToastProvider;
