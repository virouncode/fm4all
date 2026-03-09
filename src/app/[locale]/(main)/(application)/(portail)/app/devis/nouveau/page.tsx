import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { getEntrepriseWithDetailsById } from "@/server/queries/entreprises.query";
import { getUserPrestataireAdhesion } from "@/server/queries/userAdhesions.query";
import { getServicesByPrestataire } from "@/server/queries/services.query";
import { cookies } from "next/headers";
import { DevisNouveauClient } from "./DevisNouveauClient";

export default async function DevisNouveauPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user;

  // Cette page est réservée aux prestataires en posture prestataire
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;
  if (posture !== "prestataire") {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  const prestataireAdhesion = await getUserPrestataireAdhesion({
    userId: currentUser.id,
  });

  if (!prestataireAdhesion) {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  const entreprise = await getEntrepriseWithDetailsById(
    prestataireAdhesion!.entrepriseId,
  );

  if (!entreprise) {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  const emetteur = {
    id: entreprise!.id,
    nom: entreprise!.nom,
    siret: entreprise!.siret,
    numeroTva: entreprise!.numeroTva ?? null,
    emailContact: entreprise!.emailContact ?? null,
    phoneContact: entreprise!.phoneContact ?? null,
    prenomContact: entreprise!.prenomContact ?? null,
    nomContact: entreprise!.nomContact ?? null,
    logoStorageKey: entreprise!.logoStorageKey ?? null,
  };

  const services = await getServicesByPrestataire(entreprise!.id);

  return <DevisNouveauClient emetteur={emetteur} services={services} />;
}
