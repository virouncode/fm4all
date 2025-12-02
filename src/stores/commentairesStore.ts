"use client";

import { CommentairesType } from "@/zod-schemas/commentaires";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CommentairesStore = {
  commentaires: CommentairesType;
  setCommentaires: (
    value: CommentairesType | ((prev: CommentairesType) => CommentairesType),
  ) => void;
  reset: () => void;
};

export const useCommentairesStore = create<CommentairesStore>()(
  persist(
    (set) => ({
      commentaires: null,
      setCommentaires: (value) =>
        set((state) => ({
          commentaires:
            typeof value === "function" ? value(state.commentaires) : value,
        })),
      reset: () => set({ commentaires: null }),
    }),
    { name: "commentaires" },
  ),
);
