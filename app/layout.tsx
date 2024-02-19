import type { Metadata } from "next";
import Providers from "./providers/Providers";
import { getServerSession } from "next-auth";
import "./globals.css";
import Header from "./components/common/Header";
import { authOptions } from "./api/auth/authOptions";

export const metadata: Metadata = {
  title: "Megumi",
  description: "Airdrop tool",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: "dark" }}>
      <body>
        <Providers session={session}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
