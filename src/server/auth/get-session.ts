import { headers } from "next/headers";
import { auth, AuthSessionType } from "./auth";

export const getSession = async (): Promise<AuthSessionType | null> => {
  return auth.api.getSession({
    headers: await headers(),
  });
};
