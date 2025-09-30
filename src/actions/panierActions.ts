"use server";

import { actionClient } from "@/lib/safe-actions";
import { insertOffreSchema, InsertOffreSchemaType } from "@/zod-schemas/offre";
import { Redis } from "@upstash/redis";
import { flattenValidationErrors } from "next-safe-action";
import { cookies } from "next/headers";
const redis = Redis.fromEnv();
const DEFAULT_TTL = 60 * 60 * 24 * 7; // 7 days
const REFRESH_THRESHOLD = 60 * 60 * 24; // 24h

export const setOffreDansPanierAction = actionClient
  .metadata({ actionName: "setOffreDansPanierAction" })
  .schema(insertOffreSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: offre }: { parsedInput: InsertOffreSchemaType }) => {
      const cookieStore = await cookies();
      let panierId = cookieStore.get("panier")?.value;

      if (!panierId) {
        panierId = crypto.randomUUID();
        cookieStore.set({
          name: "panier",
          value: panierId,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }

      const key = `panier:${panierId}`;
      const offreIdentifier = `${offre.categorieId}:${offre.offreId}`;
      const quantite = Math.max(0, Math.floor(offre.quantite));
      const items = await redis.hgetall<Record<string, number>>(key);

      //Autres offres de la catégorie à retirer
      const toRemove: string[] = [];
      for (const id of Object.keys(items || {})) {
        if (id.startsWith(`${offre.categorieId}:`) && id !== offreIdentifier) {
          toRemove.push(id);
        }
      }

      //Transaction
      const tx = redis.multi();
      if (toRemove.length) tx.hdel(key, ...toRemove);
      if (quantite > 0) {
        tx.hset(key, { [offreIdentifier]: quantite });
      } else {
        tx.hdel(key, offreIdentifier);
      }
      //Mise à jour du ttl si proche de l'expiration
      let ttl = await redis.ttl(key);
      if (ttl === -2 || ttl === -1 || ttl < REFRESH_THRESHOLD) {
        tx.expire(key, DEFAULT_TTL);
      }
      const res = await tx.exec();
      if (!res) throw new Error("Redis transaction aborted");
      return { panierId };
    },
  );

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
