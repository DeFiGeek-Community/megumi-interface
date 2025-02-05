import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import { getSupportedChain } from "@/app/utils/chain";
import { getContract, isAddress, PublicClient } from "viem";
import { getViemProvider } from "@/app/utils/shared";
import SafeABI from "@/app/lib/constants/abis/Safe.json";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "siwe",
      name: "siwe",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

          const chain = getSupportedChain(Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID));
          if (!chain) throw new Error("Requested chain is not supported");

          const chainName = chain.name.toLowerCase();
          const provider = new ethers.JsonRpcProvider(
            ["foundry", "hardhat", "localhost"].includes(chainName)
              ? `http://localhost:8545`
              : `https://${chainName}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
          );

          const result = await siwe.verify(
            {
              signature: credentials?.signature || "",
              domain: nextAuthUrl.host,
              nonce: await getCsrfToken({ req: { headers: req.headers } }),
            },
            { provider },
          );

          if (result.data.resources && isAddress(result.data.resources[0])) {
            // Sign in as a Safe address owner
            const safeAddress = result.data.resources[0];
            const publicClient = getViemProvider(chain.id) as PublicClient;
            const safeAccount = getContract({
              address: safeAddress,
              abi: SafeABI,
              client: publicClient,
            });
            const isOwner = await safeAccount.read.isOwner([result.data.address]);
            if (!isOwner) return null;
          } else {
            // To ensure that resources are emply
            delete result.data.resources;
          }

          if (result.success) {
            return {
              id: siwe.address,
              resources: result.data.resources,
            };
          }
          return null;
        } catch (e) {
          // TODO show error
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.resources?.[0]) {
        token.safeAddress = user.resources[0] as `0x${string}`;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.address = token.sub as `0x${string}`;
      session.user.safeAddress = token.safeAddress;
      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
  },
};
