"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
const redis = Redis.fromEnv();

export const removeFromCart = async ({ productId }: { productId: string }) => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cart")?.value;
  if (!cartId) {
    return;
  }
  await redis.hdel(`cart:${cartId}`, productId);
};
