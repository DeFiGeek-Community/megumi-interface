import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import { getSupportedChain } from "@/app/lib/chain";

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

          if (result.success) {
            return {
              id: siwe.address,
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
    async session({ session, token }: { session: any; token: any }) {
      session.user.address = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
  },
};
