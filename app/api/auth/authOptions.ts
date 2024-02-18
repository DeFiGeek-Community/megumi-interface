import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

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

          // TODO
          // Add provider to accept EIP-1271 sig
          // https://medium.com/mighty-bear-games/how-to-handle-gnosis-safe-connection-and-signature-e4b8e62cf14d
          const result = await siwe.verify(
            {
              signature: credentials?.signature || "",
              domain: nextAuthUrl.host,
              nonce: await getCsrfToken({ req: { headers: req.headers } }),
            }, // { provider: PROVIDER }
          );

          if (result.success) {
            return {
              id: siwe.address,
            };
          }
          return null;
        } catch (e) {
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
