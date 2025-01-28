import type { FC, ReactNode } from "react";
import { fallback, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import i18next from "@/app/lib/i18nConfig";
import { getDefaultChain } from "@/app/utils/chain";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const t = i18next.t;

const metadata = {
  name: ` ${t("appName")} | ${t("tagline")}`,
  description: t("common.connectWallet"),
  url: process.env.NEXT_PUBLIC_APP_ORIGIN!,
  icons: [],
};

const chain = getDefaultChain();
const chains = [chain] as const;

const config = defaultWagmiConfig({
  // connectors,
  chains, // required
  projectId, // required
  metadata, // required
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: false, // Optional - true by default
  // ...wagmiOptions, // Optional - Override createConfig parameters
  transports: {
    [mainnet.id]: fallback([
      http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
      http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
    ]),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
  },
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
});

type Web3ProviderProps = {
  children: ReactNode;
};

const Web3Provider: FC<Web3ProviderProps> = ({ children }) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
