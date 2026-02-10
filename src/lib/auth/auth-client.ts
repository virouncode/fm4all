"use client";

import type { auth } from "@/server/auth/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // si ton auth est sur le même domaine (Next), tu peux omettre baseURL
  // baseURL: "/api/auth",
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signOut, signUp, useSession, sendVerificationEmail } =
  authClient;
