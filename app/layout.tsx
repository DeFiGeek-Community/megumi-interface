import type { Metadata } from "next";
import Providers from "../components/providers/Providers";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
