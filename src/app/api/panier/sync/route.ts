import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
const redis = Redis.fromEnv();
const DEFAULT_TTL = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  const { panierId } = await request.json();
  if (!panierId) return new Response("panierId is required", { status: 400 });
  const key = `panier:${panierId}`;
  const ttl = await redis.ttl(key);
  const maxAge = ttl <= 0 ? DEFAULT_TTL : ttl;
  const cookieStore = await cookies();

  cookieStore.set({
    name: "panier",
    value: panierId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge, // synchro exacte avec Redis
  });
  return new Response(null, { status: 204 });
}
