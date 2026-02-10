import { headers } from "next/headers";
import { auth, AuthSession } from "./auth";

export const getSession = async (): Promise<AuthSession | null> => {
  return auth.api.getSession({
    headers: await headers(),
  });
};
