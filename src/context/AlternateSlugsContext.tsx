"use client";

import { LocaleType } from "@/i18n/routing";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Les paramètres de route de la page courante dans CHAQUE langue, tels que
 * Sanity les connaît (`translation.metadata`). Exemple pour un article :
 *   { fr: { slug: "securite-incendie", subSlug: "securite-incendie-erp-conformite-ia" },
 *     en: { slug: "fire-safety",       subSlug: "fire-safety-erp-compliance-ai" } }
 *
 * La page qui sait ses jumelles les publie avec `<AlternateSlugs />` ; le bouton
 * de langue les lit et n'a plus besoin de la table manuelle
 * (`redirects/*SlugMappings.ts`), qui reste le repli des pages non jumelées.
 *
 * Pourquoi un contexte et pas une prop : le bouton vit dans le Header, monté
 * par le layout, deux niveaux au-dessus de la page qui connaît la réponse.
 */
export type AlternateSlugsType = Partial<
  Record<LocaleType, Record<string, string>>
>;

type AlternateSlugsContextType = {
  alternates: AlternateSlugsType | null;
  setAlternates: (value: AlternateSlugsType | null) => void;
};

const AlternateSlugsContext = createContext<AlternateSlugsContextType | null>(
  null,
);

export function AlternateSlugsProvider({ children }: { children: ReactNode }) {
  const [alternates, setAlternates] = useState<AlternateSlugsType | null>(
    null,
  );
  return (
    <AlternateSlugsContext.Provider value={{ alternates, setAlternates }}>
      {children}
    </AlternateSlugsContext.Provider>
  );
}

/** `null` quand aucune page n'a publié ses jumelles (ou hors Provider). */
export function useAlternateSlugs(): AlternateSlugsType | null {
  return useContext(AlternateSlugsContext)?.alternates ?? null;
}

/**
 * À rendre dans une page qui connaît ses jumelles. Publie à l'affichage,
 * retire au démontage : une page sans jumelles ne doit jamais hériter de
 * celles de la précédente.
 */
export function AlternateSlugs({ value }: { value: AlternateSlugsType }) {
  const ctx = useContext(AlternateSlugsContext);
  const setAlternates = ctx?.setAlternates;
  const serialized = JSON.stringify(value);
  useEffect(() => {
    if (!setAlternates) return;
    setAlternates(JSON.parse(serialized) as AlternateSlugsType);
    return () => setAlternates(null);
  }, [setAlternates, serialized]);
  return null;
}
