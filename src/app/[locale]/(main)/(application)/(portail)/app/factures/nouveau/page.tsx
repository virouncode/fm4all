import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { db } from "@/db";
import { entrepriseRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEntrepriseWithDetailsById } from "@/server/queries/entreprises.query";
import { getUserPrestataireAdhesion } from "@/server/queries/userAdhesions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { getFactureById } from "@/server/queries/factures.query";
import { getAllServices, getServicesByPrestataire } from "@/server/queries/services.query";
import { cookies } from "next/headers";
import { FactureNouvelleClient } from "./FactureNouvelleClient";

type SearchParamsType = {
  editId?: string;
};

type FactureNouvellePageProps = {
  searchParams: Promise<SearchParamsType>;
};

export default async function FactureNouvellePage({ searchParams }: FactureNouvellePageProps) {
  const params = await searchParams;

  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user;

  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // Seuls prestataire et plateforme peuvent créer des factures
  if (posture !== "prestataire" && posture !== "plateforme") {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  let emetteurId: string | null = null;

  if (posture === "prestataire") {
    const prestataireAdhesion = await getUserPrestataireAdhesion({
      userId: currentUser.id,
    });
    if (!prestataireAdhesion) {
      redirect({ href: "/auth/unauthorized", locale: "fr" });
    }
    emetteurId = prestataireAdhesion!.entrepriseId;
  } else {
    // plateforme — l'émetteur est toujours FM4ALL (entreprise avec rôle "plateforme")
    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole?.role) {
      redirect({ href: "/auth/unauthorized", locale: "fr" });
    }
    const [platformEntrepriseRole] = await db
      .select({ entrepriseId: entrepriseRoles.entrepriseId })
      .from(entrepriseRoles)
      .where(eq(entrepriseRoles.role, "plateforme"))
      .limit(1);
    if (platformEntrepriseRole) {
      emetteurId = platformEntrepriseRole.entrepriseId;
    }
  }

  // Mode édition : chargement de la facture existante
  let factureExistante = null;
  if (params.editId) {
    factureExistante = await getFactureById(params.editId);
    if (!factureExistante || factureExistante.statut !== "brouillon") {
      redirect({ href: "/app/factures", locale: "fr" });
    }
    // Vérifier que l'utilisateur est bien l'émetteur
    if (emetteurId && factureExistante!.emetteurEntrepriseId !== emetteurId) {
      redirect({ href: "/auth/unauthorized", locale: "fr" });
    }
  }

  // Charger les infos de l'émetteur
  let emetteur = null;
  if (emetteurId) {
    const entreprise = await getEntrepriseWithDetailsById(emetteurId);
    if (entreprise) {
      emetteur = {
        id: entreprise.id,
        nom: entreprise.nom,
        siret: entreprise.siret,
        numeroTva: entreprise.numeroTva ?? null,
        logoStorageKey: entreprise.logoStorageKey ?? null,
      };
    }
  }

  // Charger les services disponibles pour cet émetteur
  const services = emetteurId
    ? posture === "prestataire"
      ? await getServicesByPrestataire(emetteurId)
      : await getAllServices()
    : [];

  return (
    <FactureNouvelleClient
      emetteur={emetteur}
      factureExistante={factureExistante}
      posture={posture as "prestataire" | "plateforme"}
      services={services.map((s) => ({ id: s.id, nom: s.nom }))}
    />
  );
}
