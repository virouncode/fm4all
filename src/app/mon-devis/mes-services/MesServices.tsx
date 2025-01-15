import {
  getHygieneConsosTarif,
  getHygieneDistribQuantites,
  getHygieneDistribTarifs,
  getHygieneInstalDistribTarif,
} from "@/lib/queries/hygiene/getHygiene";
import {
  getIncendieQuantite,
  getIncendieTarifs,
} from "@/lib/queries/incendie/getIncendie";
import {
  getMaintenanceQuantites,
  getMaintenanceTarifs,
} from "@/lib/queries/maintenance/getMaintenance";
import {
  getNettoyageQuantites,
  getNettoyageTarifs,
  getRepasseTarif,
  getVitrerieTarif,
} from "@/lib/queries/nettoyage/getNettoyage";
import { GammeType } from "@/zod-schemas/gamme";
import Link from "next/link";
import Hygiene from "./(hygiene)/Hygiene";
import HygieneOptions from "./(hygiene)/HygieneOptions";
import SecuriteIncendie from "./(incendie)/SecuriteIncendie";
import Maintenance from "./(maintenance)/Maintenance";
import Nettoyage from "./(nettoyage)/Nettoyage";
import NettoyageOptions from "./(nettoyage)/NettoyageOptions";

type MesServicesProps = {
  surface: string;
  effectif: string;
  fournisseurId?: string;
  nettoyageGamme?: GammeType;
};

const MesServices = async ({
  surface,
  effectif,
  fournisseurId,
  nettoyageGamme,
}: MesServicesProps) => {
  const [
    nettoyageQuantites,
    nettoyageTarifs,
    repasseTarif,
    vitrerieTarif,
    hygieneDistribQuantites,
    hygieneDistribTarifs,
    hygieneDistribInstalTarif,
    hygieneConsosTarif,
    incendieQuantite,
    incendieTarifs,
    maintenanceQuantites,
    maintenanceTarifs,
  ] = await Promise.all([
    getNettoyageQuantites(surface),
    getNettoyageTarifs(surface),
    getRepasseTarif(surface, fournisseurId, nettoyageGamme),
    getVitrerieTarif(fournisseurId),
    getHygieneDistribQuantites(effectif),
    getHygieneDistribTarifs(fournisseurId),
    getHygieneInstalDistribTarif(effectif, fournisseurId),
    getHygieneConsosTarif(effectif, fournisseurId),
    getIncendieQuantite(surface),
    getIncendieTarifs(surface),
    getMaintenanceQuantites(surface),
    getMaintenanceTarifs(surface),
  ]);

  if (
    !nettoyageTarifs ||
    nettoyageTarifs.length === 0 ||
    !nettoyageQuantites ||
    nettoyageQuantites.length === 0
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          Nous n&apos;avons pas trouvé de tarifs de nettoyage.{" "}
          <Link href="/mon-devis/mes-locaux" className="underline">
            Veuillez réessayer
          </Link>
          .
        </p>
      </section>
    );
  }
  //Propositions de service de nettoyage
  //L'id de la proposition sera l'id du tarif : pour une surface donnéee, un tarif = une proposition
  const nettoyagePropositions = nettoyageTarifs
    .map((tarif) => {
      const freqAnnuelle =
        nettoyageQuantites.find(
          (item) =>
            item.gamme === tarif.gamme && item.surface === parseInt(surface)
        )?.freqAnnuelle || 0;
      const hParPassage = tarif.hParPassage;
      const tauxHoraire = tarif.tauxHoraire;
      return {
        ...tarif,
        freqAnnuelle,
        prixAnnuel: Math.round(freqAnnuelle * hParPassage * tauxHoraire),
      };
    })
    .sort((a, b) => a.fournisseurId - b.fournisseurId);

  //Proposition des options
  let repasseProposition = null;
  let vitrerieProposition = null;
  let samediDimancheProposition = null;

  if (nettoyageGamme && fournisseurId && vitrerieTarif) {
    const freqAnnuelle =
      nettoyageQuantites.find(
        (item) =>
          item.gamme === nettoyageGamme && item.surface === parseInt(surface)
      )?.freqAnnuelle || 0;
    const nettoyageTarif = nettoyageTarifs.find(
      (tarif) =>
        tarif.gamme === nettoyageGamme &&
        tarif.fournisseurId === parseInt(fournisseurId) &&
        tarif.surface === parseInt(surface)
    );
    if (nettoyageTarif) {
      if (repasseTarif) {
        //L'id de la proposition sera l'id du tarif de repasse : pour une surface donnée, un tarif = une proposition
        repasseProposition = {
          ...repasseTarif,
          freqAnnuelle,
          prixAnnuel: Math.round(
            freqAnnuelle * repasseTarif.tauxHoraire * repasseTarif.hParPassage
          ),
        };
      }
      //L'id de la proposition sera l'id du tarif de vitrerie : pour une surface donnée, un tarif = une proposition
      vitrerieProposition = {
        ...vitrerieTarif,
        prixParPassage: Math.round(
          Math.max(
            ((parseInt(surface) * 0.15) / vitrerieTarif.cadenceVitres) *
              vitrerieTarif.tauxHoraire +
              ((parseInt(surface) * 0.15) / vitrerieTarif.cadenceCloisons) *
                vitrerieTarif.tauxHoraire,
            vitrerieTarif.minFacturation
          )
        ),
      };
      //L'id de la proposition sera l'id du tarif de nettoyage : pour une surface donnée, un tarif = une proposition
      samediDimancheProposition = {
        ...nettoyageTarif,
        prixAnnuelSamedi: Math.round(
          52 * nettoyageTarif.tauxHoraire * nettoyageTarif.hParPassage
        ),
        prixAnnuelDimanche: Math.round(
          52 * nettoyageTarif.tauxHoraire * nettoyageTarif.hParPassage * 1.2
        ),
      };
    }
  }

  return (
    <section className="flex-1 overflow-hidden">
      <Nettoyage nettoyagePropositions={nettoyagePropositions} />
      <NettoyageOptions
        repasseProposition={repasseProposition}
        vitrerieProposition={vitrerieProposition}
        samediDimancheProposition={samediDimancheProposition}
      />
      <Hygiene
        distribQuantites={hygieneDistribQuantites}
        distribTarifs={hygieneDistribTarifs}
        distribInstalTarif={hygieneDistribInstalTarif}
        consosTarif={hygieneConsosTarif}
      />
      <HygieneOptions
        distribQuantites={hygieneDistribQuantites}
        distribTarifs={hygieneDistribTarifs}
        consosTarif={hygieneConsosTarif}
      />
      <Maintenance
        maintenanceQuantites={maintenanceQuantites}
        maintenanceTarifs={maintenanceTarifs}
      />
      <SecuriteIncendie
        incendieQuantite={incendieQuantite}
        incendieTarifs={incendieTarifs}
      />
    </section>
  );
};

export default MesServices;
