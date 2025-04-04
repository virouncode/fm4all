import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? ["https://www.fm4all.com", "https://fm4all.com"]
      : ["http://localhost:3000"];

  if (origin && allowedOrigins.includes(origin)) {
    const response = NextResponse.next(); //
    // Set CORS headers for the response
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Content-Type", "application/json");
    response.headers.set("Access-Control-Allow-Methods", "GET");
    return response;
  }
  // Si pas d'origine ou origine non autorisée, appliquer simplement le middleware d'internationalisation
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
