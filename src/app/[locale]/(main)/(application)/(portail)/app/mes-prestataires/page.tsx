import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { db } from "@/db";
import { userClientAdhesions } from "@/db/schema/users";
import { and, eq } from "drizzle-orm";
import { MesPrestatairesClient } from "./MesPrestatairesClient";

export default async function MesPrestatairesPage() {
  const session = await getSession();
  if (!session?.user) redirect({ href: "/auth/login", locale: "fr" });

  const currentUser = session!.user;
  const clientAdhesion = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, currentUser.id),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });
  if (!clientAdhesion) redirect({ href: "/auth/unauthorized", locale: "fr" });

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <h1 className="mb-6 flex-shrink-0 text-2xl font-bold">
        Mes prestataires
      </h1>
      <div className="flex-1 overflow-hidden">
        <MesPrestatairesClient />
      </div>
    </div>
  );
}
