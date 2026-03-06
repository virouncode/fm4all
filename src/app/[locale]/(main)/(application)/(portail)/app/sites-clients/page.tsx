import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { MapPin } from "lucide-react";
import { SitesClientsClient } from "./SitesClientsClient";

export default async function SitesClientsPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user;
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  if (!platformRole?.role) {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  return (
    <div className="container mx-auto px-6 py-4">
      <div className="mb-6 flex items-center gap-2">
        <MapPin className="text-primary size-6" />
        <h1 className="text-2xl font-bold">Sites clients</h1>
      </div>
      <SitesClientsClient />
    </div>
  );
}
