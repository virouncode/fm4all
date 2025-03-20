import { createI18nMiddleware } from "next-international/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getEquivalentPath, isValidPathForLocale } from "./lib/routes";

// const allowedOrigins =
//   process.env.NODE_ENV === "production"
//     ? [
//         "https://fm4all-git-staging-virouncodes-projects.vercel.app",
//         "https://www.fm4all.com",
//         "https://fm4all.com",
//       ]
//     : ["http://localhost:3000"];

const I18nMiddleware = createI18nMiddleware({
  locales: ["fr", "en"],
  defaultLocale: "fr",
});

export function middleware(req: NextRequest) {
  // const origin = req.headers.get("origin");
  // if (origin && allowedOrigins.includes(origin)) {
  //   const response = NextResponse.next(); //
  //   // Set CORS headers for the response
  //   response.headers.set("Access-Control-Allow-Origin", origin);
  //   response.headers.set("Content-Type", "application/json");
  //   response.headers.set("Access-Control-Allow-Methods", "GET");
  //   return response;
  // }
  // return NextResponse.next();
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const pathnameSegments = pathname.split("/").filter(Boolean);
  const locale = pathnameSegments[0];
  if (locale !== "fr" && locale !== "en") {
    return I18nMiddleware(req);
  }
  const pathWithoutLocale = "/" + pathnameSegments.slice(1).join("/");
  if (isValidPathForLocale(pathWithoutLocale, locale)) {
    return I18nMiddleware(req);
  }
  const equivalentPath = getEquivalentPath(
    pathWithoutLocale,
    locale as "en" | "fr"
  );
  url.pathname = `/${locale}${equivalentPath}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
