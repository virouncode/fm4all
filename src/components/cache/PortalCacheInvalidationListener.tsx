"use client";

import { useRouter } from "@/i18n/navigation";
import {
  CACHE_INVALIDATION,
  CacheInvalidationData,
} from "@/lib/cache-invalidation";
import { type CACHE_TAG_RESULT } from "@/lib/data-cache";
import { pusherClient } from "@/lib/pusher";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export type CacheInvalidationEvent = {
  tag?: CACHE_TAG_RESULT;
  tags?: CACHE_TAG_RESULT[];
  data?: CacheInvalidationData;
  timestamp: number;
};

export default function PortalCacheInvalidationListener() {
  const t = useTranslations("DevisPage");
  const router = useRouter();
  const isInvalidatingRef = useRef(false);
  const lastInvalidationTimeRef = useRef(0);
  const DEBOUNCE_DELAY = 2000;
  const MAX_PROCESSED_EVENTS = 100;
  const [processedEvents, setProcessedEvents] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const channel = pusherClient.subscribe(CACHE_INVALIDATION.CHANNEL);
    channel.bind(
      CACHE_INVALIDATION.EVENT,
      async (message: CacheInvalidationEvent) => {
        console.log("Événement d'invalidation de cache reçu:", message);

        // Vérifier si cet événement a déjà été traité
        if (processedEvents.has(message.timestamp)) {
          console.log("Événement déjà traité, ignoré:", message.timestamp);
          return;
        }

        // Vérifier si une invalidation est déjà en cours
        if (isInvalidatingRef.current) {
          console.log("Invalidation déjà en cours, ignoré");
          return;
        }

        // Vérifier si une invalidation a été effectuée récemment
        const now = Date.now();
        if (now - lastInvalidationTimeRef.current < DEBOUNCE_DELAY) {
          console.log("Invalidation trop récente, ignoré");
          return;
        }

        // Marquer l'événement comme traité
        setProcessedEvents((prev) => {
          const newSet = new Set([...prev, message.timestamp]);

          // Nettoyer l'historique si nécessaire
          if (newSet.size > MAX_PROCESSED_EVENTS) {
            // Convertir en tableau, trier par timestamp et ne garder que les plus récents
            const sortedEvents = [...newSet].sort((a, b) => b - a);
            return new Set(sortedEvents.slice(0, MAX_PROCESSED_EVENTS));
          }
          return newSet;
        });

        isInvalidatingRef.current = true;
        lastInvalidationTimeRef.current = now;

        try {
          const response = await fetch("/api/invalidate-cache", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tag: message.tag,
              tags: message.tags,
            }),
          });

          if (!response.ok) {
            throw new Error(t("erreur-lors-de-linvalidation-du-cache"));
          }
          // Rafraîchir l'interface utilisateur
          router.refresh();
        } catch (error) {
          console.error("Erreur lors de l'invalidation du cache:", error);
          // ...
        } finally {
          isInvalidatingRef.current = false;
        }
      }
    );

    // Nettoyer l'abonnement lors du démontage du composant
    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(CACHE_INVALIDATION.CHANNEL);
    };
  }, [processedEvents, router, t]);

  // Ce composant ne rend rien visuellement
  return null;
}
