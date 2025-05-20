import type { CACHE_TAG, CACHE_TAG_RESULT } from "@/lib/data-cache";
import { pusherServer } from "@/lib/pusher";

const CACHE_CHANNEL = "cache-invalidation";
const CACHE_EVENT = "invalidate-tag";

//TODO mieux typer CacheInvalidationData

export type CacheInvalidationData = Record<string, string | number | null>;

export async function invalidateCacheTag(tag: CACHE_TAG | CACHE_TAG_RESULT) {
  try {
    await pusherServer.trigger(CACHE_CHANNEL, CACHE_EVENT, {
      tag,
      timestamp: Date.now(),
    });
    console.log(`Cache invalidé avec succès pour le tag: ${tag}`);
    return true;
  } catch (error) {
    console.error(
      `Erreur lors de l'invalidation du cache pour le tag: ${tag}`,
      error
    );
    return false;
  }
}

export async function invalidateCacheTags(
  tags: (CACHE_TAG | CACHE_TAG_RESULT)[]
) {
  try {
    await pusherServer.trigger(CACHE_CHANNEL, CACHE_EVENT, {
      tags,
      timestamp: Date.now(),
    });
    console.log(`Cache invalidé avec succès pour les tags: ${tags.join(", ")}`);
    return true;
  } catch (error) {
    console.error(
      `Erreur lors de l'invalidation du cache pour les tags: ${tags.join(", ")}`,
      error
    );
    return false;
  }
}

// Exporter les constantes pour le client
export const CACHE_INVALIDATION = {
  CHANNEL: CACHE_CHANNEL,
  EVENT: CACHE_EVENT,
};

export async function invalidateCacheTagsWithData(
  tags: (CACHE_TAG | CACHE_TAG_RESULT)[],
  data: CacheInvalidationData
) {
  try {
    await pusherServer.trigger(CACHE_CHANNEL, CACHE_EVENT, {
      tags,
      data,
      timestamp: Date.now(),
    });
    console.log(
      `Cache invalidé avec succès pour les tags: ${tags.join(", ")} avec données`
    );
    return true;
  } catch (error) {
    console.error(
      `Erreur lors de l'invalidation du cache pour les tags: ${tags.join(", ")}`,
      error
    );
    return false;
  }
}
