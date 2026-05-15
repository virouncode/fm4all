"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { useStore, type StoreApi } from "zustand";

/**
 * Helper SSR-safe pour Zustand : crée un Provider qui instancie le store
 * une seule fois par render-tree (via useRef), un hook avec sélecteur,
 * et un accès direct au StoreApi pour les event handlers.
 *
 * Voir CLAUDE.md — "RÈGLE ABSOLUE — Zustand & SSR" pour le rationale.
 */
export function createStoreContext<T>(
  factory: () => StoreApi<T>,
  name: string,
) {
  const Context = createContext<StoreApi<T> | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const storeRef = useRef<StoreApi<T> | null>(null);
    if (storeRef.current === null) {
      storeRef.current = factory();
    }
    return (
      <Context.Provider value={storeRef.current}>{children}</Context.Provider>
    );
  }

  function useTypedStore<U>(selector: (state: T) => U): U {
    const store = useContext(Context);
    if (!store) {
      throw new Error(`${name}Provider manquant dans l'arbre React`);
    }
    return useStore(store, selector);
  }

  function useStoreApi(): StoreApi<T> {
    const store = useContext(Context);
    if (!store) {
      throw new Error(`${name}Provider manquant dans l'arbre React`);
    }
    return store;
  }

  return { Provider, useTypedStore, useStoreApi };
}
