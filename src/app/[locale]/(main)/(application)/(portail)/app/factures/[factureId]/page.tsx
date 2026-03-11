import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { getFactureById } from "@/server/queries/factures.query";
import { hasAccessToEntreprise } from "@/server/queries/userAdhesions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { getFacturePermissionsType } from "@/server/utils/facturesPermissions.utils";
import { FactureDetailClient } from "./FactureDetailClient";

type FactureDetailPageProps = {
  params: Promise<{ factureId: string }>;
};

export default async function FactureDetailPage({ params }: FactureDetailPageProps) {
  const { factureId } = await params;

  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user;

  const facture = await getFactureById(factureId);
  if (!facture) {
    redirect({ href: "/app/factures", locale: "fr" });
  }

  // Vérification accès
  const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
  if (!plateformeRole?.role) {
    const [asEmetteur, asDestinataire] = await Promise.all([
      hasAccessToEntreprise(currentUser.id, facture!.emetteurEntrepriseId),
      hasAccessToEntreprise(currentUser.id, facture!.destinataireEntrepriseId),
    ]);
    if (!asEmetteur && !asDestinataire) {
      redirect({ href: "/auth/unauthorized", locale: "fr" });
    }
  }

  const permissions = await getFacturePermissionsType({
    userId: currentUser.id,
    factureId,
  });

  return (
    <FactureDetailClient
      facture={facture!}
      permissions={permissions}
    />
  );
}
