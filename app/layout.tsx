import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/authOptions";
import Providers from "./providers/Providers";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import "./globals.css";

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
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
