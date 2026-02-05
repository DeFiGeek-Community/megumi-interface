import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/authOptions";
import Providers from "./providers/Providers";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import BackgroundDecorations from "./components/common/BackgroundDecorations";
import i18next from "./lib/i18nConfig";
import { Box } from "@chakra-ui/react";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = i18next.t;
  const title = `${t("appName")} | ${t("tagline")}`;
  const description = t("tagline");

  return {
    metadataBase: new URL("https://megumi.defigeek.xyz/"),
    title,
    description,
    icons: {
      icon: "/favicons/icon-32x32.png",
      shortcut: "/favicons/favicon.ico",
      apple: "/favicons/apple-touch-icon.png",
    },
    manifest: "/favicons/manifest.json",
    openGraph: {
      title,
      description,
      siteName: t("appName"),
      images: [
        {
          url: "/favicons/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/favicons/og-image.png"],
    },
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
      {/* 
      Adding className="chakra-ui-dark" to avoid warning
      https://github.com/chakra-ui/chakra-ui/issues/7040#issuecomment-1655818781
       */}
      <body className="chakra-ui-dark pattern-dots">
        <Providers session={session} locale={i18next.language}>
          <BackgroundDecorations />
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            minHeight="100vh"
            position="relative"
            zIndex={1}
          >
            <Header />
            <Box flex="1" pt="4">
              <main>{children}</main>
            </Box>
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
  );
}
