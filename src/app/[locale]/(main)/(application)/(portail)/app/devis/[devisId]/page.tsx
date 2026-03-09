import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { getDevisById } from "@/server/queries/devis.query";
import { getServicesByPrestataire } from "@/server/queries/services.query";
import { hasAccessToEntreprise } from "@/server/queries/userAdhesions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { Handshake } from "lucide-react";
import { DevisDetailClient } from "./DevisDetailClient";

type DevisDetailPageProps = {
  params: Promise<{ devisId: string; locale: string }>;
};

export default async function DevisDetailPage({ params }: DevisDetailPageProps) {
  const { devisId } = await params;

  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user;

  const devisRow = await getDevisById(devisId);
  if (!devisRow) {
    redirect({ href: "/app/devis", locale: "fr" });
  }

  // Vérifier accès (plateforme OU emetteur OU propriétaire)
  const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
  if (!plateformeRole?.role) {
    const [asEmetteur, asProprietaire] = await Promise.all([
      hasAccessToEntreprise(currentUser.id, devisRow!.emetteurEntrepriseId),
      hasAccessToEntreprise(currentUser.id, devisRow!.proprietaireEntrepriseId),
    ]);
    if (!asEmetteur && !asProprietaire) {
      redirect({ href: "/auth/unauthorized", locale: "fr" });
    }
  }

  const isEmetteur = plateformeRole?.role
    ? false // plateforme = read-only, pas emetteur
    : await hasAccessToEntreprise(currentUser.id, devisRow!.emetteurEntrepriseId);

  const isProprietaire = plateformeRole?.role
    ? false
    : await hasAccessToEntreprise(currentUser.id, devisRow!.proprietaireEntrepriseId);

  const permissions = {
    canEdit: isEmetteur && devisRow!.statut === "brouillon",
    canEmettre: isEmetteur && devisRow!.statut === "brouillon",
    canSigner: isProprietaire && devisRow!.statut === "emis",
    canRefuser: isProprietaire && devisRow!.statut === "emis",
    isReadOnly: !!plateformeRole?.role,
  };

  const services = await getServicesByPrestataire(devisRow!.emetteurEntrepriseId);

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-4 flex flex-shrink-0 items-center gap-2">
        <Handshake className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">
          {devisRow!.numero ?? `Devis – ${devisRow!.titre}`}
        </h1>
      </div>

      <DevisDetailClient devis={devisRow!} permissions={permissions} services={services} pdfStorageKey={devisRow!.pdfStorageKey} />
    </div>
  );
}
