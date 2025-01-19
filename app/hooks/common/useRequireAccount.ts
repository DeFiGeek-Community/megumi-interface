"use client";
import { useAccount } from "wagmi";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export const useRequireAccount = () => {
  const account = useAccount();
  useEffect(() => {
    if (!account.address && !account.isConnecting && !account.isReconnecting) redirect("/");
  }, [account.address, account.isConnecting, account.isReconnecting]);
  return account;
};
