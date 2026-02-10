import "server-only";

import type { AuthSession } from "@/server/auth/auth";
import { getSession } from "@/server/auth/get-session";

export async function requireAuth(): Promise<{
  session: AuthSession | null;
  userId: string | null;
}> {
  const session = await getSession();
  return {
    session,
    userId: session?.user?.id ?? null,
  };
}
