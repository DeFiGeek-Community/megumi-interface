import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/authOptions";
import Providers from "./providers/Providers";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import i18next from "./lib/i18nConfig";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = i18next.t;
  return {
    title: `${t("appName")} | ${t("tagline")}`,
    description: t("tagline"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value ?? i18next.options.lng;
  const header = Object.values(headers());
  const setCookieString = Boolean(header) && header.length > 0 ? header[0]["set-cookie"] : "";
  const localeMatch = Boolean(setCookieString) && setCookieString.match(/locale=([^;]+)/);

  if (localeMatch) {
    // Just set in middleware
    const locale = (localeMatch[1] as string).toLowerCase();
    await i18next.changeLanguage(locale);
  } else {
    await i18next.changeLanguage(locale);
  }

  return (
    <html lang={i18next.language} data-theme="dark" style={{ colorScheme: "dark" }}>
      <body>
        <Providers session={session} locale={i18next.language}>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
