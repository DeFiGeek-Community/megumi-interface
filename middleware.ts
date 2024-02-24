import { withAuth } from "next-auth/middleware";
import { match } from "@formatjs/intl-localematcher";
import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { i18nextInitOptions } from "./lib/i18nConfig";

const acceptableLocales = new Set(i18nextInitOptions.supportedLngs || []);
const defaultLocale = i18nextInitOptions.lng || "en";
const authPages = ["/dashboard"];

const getUserLocale = (req: NextRequest): string => {
  const languages = new Negotiator({
    headers: { "accept-language": req.headers.get("accept-language") || "en;q=1" },
  }).languages();
  let lang = defaultLocale;
  try {
    lang = match(languages, Array.from(acceptableLocales), defaultLocale);
  } catch (e) {
    console.warn("Failed to detect user's locale. Using default locale...");
  }
  return lang;
};

const setLocale = (req: NextRequest, res: NextResponse): NextResponse<unknown> => {
  // If locale cookie is set, use it. Otherwise use default locale
  const locale =
    req.cookies.has("locale") && acceptableLocales.has(req.cookies.get("locale")!.value)
      ? req.cookies.get("locale")!.value
      : getUserLocale(req);

  // set locale cookie
  res.cookies.set({
    name: "locale",
    value: locale,
    path: "/",
  });

  return res;
};

export default async function middleware(req: NextRequest) {
  const authPathRegex = new RegExp(
    `^(${authPages.map((p) => p.replace("/", "/")).join("|")})/?$`,
    "i",
  );
  const isAuthPage = authPathRegex.test(req.nextUrl.pathname);
  let response;
  if (isAuthPage) {
    response = (await (withAuth as any)(req)) || NextResponse.next();
  } else {
    response = NextResponse.next();
  }
  return setLocale(req, response);
}

export const config = {
  matcher: ["/", "/dashboard", "/airdrops/:path*"],
};
