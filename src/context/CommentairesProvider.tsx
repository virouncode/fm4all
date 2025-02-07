"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { CommentairesType } from "@/zod-schemas/commentaires";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const CommentairesContext = createContext<{
  commentaires: CommentairesType;
  setCommentaires: Dispatch<SetStateAction<CommentairesType>>;
}>({
  commentaires: null,
  setCommentaires: () => {},
});

const CommentairesProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [commentaires, setCommentaires] = useState<CommentairesType>(null);

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedCommentaires = localStorage.getItem("commentaires");
      if (storedCommentaires) {
        setCommentaires(JSON.parse(storedCommentaires));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `commentaires` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("commentaires", JSON.stringify(commentaires));
    }
  }, [commentaires, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <CommentairesContext.Provider value={{ commentaires, setCommentaires }}>
      {children}
    </CommentairesContext.Provider>
  );
};

export default CommentairesProvider;
