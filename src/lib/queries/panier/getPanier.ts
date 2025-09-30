import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
const redis = Redis.fromEnv();

export const getPanier = async () => {
  const cookieStore = await cookies();
  const panierId = cookieStore.get("panier")?.value;
  if (!panierId) {
    return null;
  }
  const items = await redis.hgetall<Record<string, number>>(
    `panier:${panierId}`,
  );
  console.log("getPanier items", items);

  return items;
};
