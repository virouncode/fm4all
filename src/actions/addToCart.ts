"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
const redis = Redis.fromEnv();

export type ServiceCategoryType =
  | "Nettoyage"
  | "RepasseSanitaire"
  | "NettoyageSamedi"
  | "NettoyageDimanche"
  | "Vitrerie"
  | "HygieneDistribEmp"
  | "HygieneDistribSavon"
  | "HygieneDistribPh"
  | "HygieneInstalDistrib"
  | "HygieneDistribDesinfectant"
  | "HygieneDistribParfum"
  | "HygieneDistribBalai"
  | "HygieneDistribPoubelle"
  | "HygieneDistribPhf"
  | "HygieneConsoTrilogie"
  | "HygieneConso";

export const setProductInCart = async ({
  productId,
  quantity,
  categoryId,
}: {
  productId: string;
  quantity: number;
  categoryId: string;
}) => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cart")?.value;
  if (!cartId) {
    cartId = crypto.randomUUID();
  }
  //Cookie refresh
  cookieStore.set({
    name: "cart",
    value: cartId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // si je veux un lien vers mon panier
    maxAge: 60 * 60 * 24 * 7,
  });

  const productIdentifier = `${categoryId}:${productId}`;

  // Supprimer tous les autres produits de la même catégorie
  const items = await redis.hgetall<Record<string, number>>(`cart:${cartId}`);
  const toRemove: string[] = [];
  for (const id of Object.keys(items || {})) {
    if (id.startsWith(`${categoryId}:`) && id !== productIdentifier) {
      toRemove.push(id);
    }
  }
  if (toRemove.length) {
    await redis.hdel(`cart:${cartId}`, ...toRemove);
  }

  if (quantity > 0) {
    await redis.hset(`cart:${cartId}`, { [productIdentifier]: quantity });
  } else {
    await redis.hdel(`cart:${cartId}`, productIdentifier);
  }
  await redis.expire(`cart:${cartId}`, 60 * 60 * 24 * 7);
};

export const removeFromCart = async ({ productId }: { productId: string }) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart")?.value;
  if (!cartId) return;

  await redis.hdel(`cart:${cartId}`, productId);
  await redis.expire(`cart:${cartId}`, 60 * 60 * 24 * 7);
};

export const deleteCart = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart")?.value;
  if (!cartId) return;

  await redis.del(`cart:${cartId}`);
  cookieStore.delete("cart");
};
