import type { GetEnsNameReturnType } from "viem/ens";
import { type Chain, localhost, mainnet, sepolia, base, baseSepolia } from "viem/chains";
import { TemplateType } from "./constants/templates";

const chains = { mainnet, sepolia, base, baseSepolia };

// For frontend -->
export const getEtherscanLink = (
  chain: Chain | undefined,
  hash: string,
  type: "tx" | "token" | "address" | "block",
): string => {
  if (typeof chain === "undefined" || typeof chain.blockExplorers === "undefined") return "";

  return `${chain.blockExplorers.default.url}/${type}/${hash}`;
};

export const getEllipsizedAddress = ({
  address,
  ensName,
}: {
  address?: `0x${string}`;
  ensName?: GetEnsNameReturnType;
}): string => {
  return ensName ? `${ensName}` : `${address?.slice(0, 5)}...${address?.slice(-4)}`;
};
// <--

// For frontend and backend-->
export const uint8ObjectToHexString = (object: { [key: string]: number }) => {
  const values = Object.values(object);
  return uint8ArrayToHexString(new Uint8Array(values));
};

export const uint8ArrayToHexString = (uint8Array: Uint8Array) => {
  return (
    "0x" +
    Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  );
};

export const isSupportedTemplate = (templateName: string) => {
  return Object.values(TemplateType)
    .map((v) => v as string)
    .includes(templateName);
};
// <--
