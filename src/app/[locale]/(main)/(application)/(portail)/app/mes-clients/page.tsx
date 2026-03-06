import { db } from "@/db";
import { userPrestataireAdhesions } from "@/db/schema/users";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { and, eq } from "drizzle-orm";
import { Building2 } from "lucide-react";
import { MesClientsClient } from "./MesClientsClient";

export default async function MesClientsPage() {
  const session = await getSession();
  if (!session?.user) redirect({ href: "/auth/login", locale: "fr" });

  const currentUser = session!.user;
  const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst(
    {
      where: and(
        eq(userPrestataireAdhesions.userId, currentUser.id),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    },
  );
  if (!prestataireAdhesion)
    redirect({ href: "/auth/unauthorized", locale: "fr" });

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="flex flex-shrink-0 items-center gap-2">
        <Building2 className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Mes clients</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <MesClientsClient />
      </div>
    </div>
  );
}
