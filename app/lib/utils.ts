export const getEtherscanLink = (
  chain: string,
  hash: string,
  type: "tx" | "token" | "address" | "block",
): string => {
  return `https://${chain === "mainnet" ? "" : `${chain}.`}etherscan.io/${type}/${hash}`;
};
