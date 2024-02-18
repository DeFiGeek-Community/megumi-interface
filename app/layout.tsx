import type { Metadata } from "next";
import Providers from "./providers/Providers";
import { getServerSession } from "next-auth";
import "./globals.css";
import Header from "./components/common/Header";

export const metadata: Metadata = {
  title: "Megumi",
  description: "Airdrop tool",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
