"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { CommentairesType } from "@/zod-schemas/commentaires.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type CommentairesStore = {
  commentaires: CommentairesType;
  setCommentaires: (
    value: CommentairesType | ((prev: CommentairesType) => CommentairesType),
  ) => void;
  reset: () => void;
};

const createCommentairesStore = (): StoreApi<CommentairesStore> =>
  create<CommentairesStore>()(
    persist(
      (set) => ({
        commentaires: null,
        setCommentaires: (value) =>
          set((state) => ({
            commentaires:
              typeof value === "function" ? value(state.commentaires) : value,
          })),
        reset: () => set(() => ({ commentaires: null })),
      }),
      { name: "commentaires" },
    ),
  );

const ctx = createStoreContext<CommentairesStore>(
  createCommentairesStore,
  "Commentaires",
);

export const CommentairesStoreProvider = ctx.Provider;
export const useCommentairesStore = ctx.useTypedStore;
export const useCommentairesStoreApi = ctx.useStoreApi;
