"use client";

import { useCallback, useRef } from "react";

type UseIntersectionOptions = {
  isLoading: boolean; // tu es en train de charger une page
  hasMore: boolean; // il reste encore des éléments à charger
  onLoadMore: () => Promise<void> | void; // callback appelé quand on atteint le sentinel
  rootMargin?: string;
  threshold?: number;
  disabled?: boolean; // pour désactiver complètement le comportement
};

const useIntersection = <TElement extends HTMLElement | null>({
  isLoading,
  hasMore,
  onLoadMore,
  rootMargin = "0px",
  threshold = 0.1,
  disabled = false,
}: UseIntersectionOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rootRef = useRef<TElement>(null);

  const targetRef = useCallback(
    (node: Element | null) => {
      if (disabled) return;

      // On nettoie l'ancien observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      const options: IntersectionObserverInit = {
        root: rootRef.current,
        rootMargin,
        threshold,
      };

      observerRef.current = new IntersectionObserver(async (entries) => {
        const entry = entries[0];

        if (!entry.isIntersecting) return;
        if (isLoading) return;
        if (!hasMore) return;

        try {
          await onLoadMore();
        } catch (error) {
          console.error("Error loading more data:", error);
        }
      }, options);

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [disabled, hasMore, isLoading, onLoadMore, rootMargin, threshold],
  );

  return { rootRef, targetRef };
};

export default useIntersection;
