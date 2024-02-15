import type { FC, ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const connectors = [
  injected(),
  walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID! }),
];

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  multiInjectedProviderDiscovery: true,
  connectors,
  transports: {
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_TOKEN}`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_TOKEN}`),
  },
});

type Web3ProviderProps = {
  children: ReactNode;
};

const Web3Provider: FC<Web3ProviderProps> = ({ children }) => {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
};

export default Web3Provider;
