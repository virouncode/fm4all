"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const LangContext = createContext<{
  lang: "fr" | "en";
  setLang: Dispatch<SetStateAction<"fr" | "en">>;
}>({
  lang: "fr",
  setLang: () => {},
});

const LangProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [lang, setLang] = useState<"fr" | "en">("fr");

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedLang = localStorage.getItem("lang");
      if (storedLang) {
        setLang(storedLang as "fr" | "en");
      }
    }
  }, [isMounted]);

  // Save to localStorage when `hygiene` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("lang", lang);
    }
  }, [lang, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
};

export default LangProvider;
