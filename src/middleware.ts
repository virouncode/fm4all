import { NextRequest, NextResponse } from "next/server";

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://www.fm4all.com", "https://fm4all.com"]
    : ["http://localhost:3000"];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    const response = NextResponse.next(); //
    // Set CORS headers for the response
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Content-Type", "application/json");
    response.headers.set("Access-Control-Allow-Methods", "GET");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
