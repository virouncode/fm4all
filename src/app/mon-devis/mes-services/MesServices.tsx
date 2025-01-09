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
  getNettoyageQuantites,
  getNettoyageTarifs,
  getRepasseTarif,
  getVitrerieTarif,
} from "@/lib/queries/nettoyage/getNettoyage";
import { GammeType } from "@/zod-schemas/gamme";
import Total from "../Total";
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
  ]);

  const nettoyagePropositions = nettoyageTarifs
    ? nettoyageTarifs
        .map((tarif) => {
          const freqAnnuelle =
            nettoyageQuantites?.find(
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
        .sort((a, b) => a.fournisseurId - b.fournisseurId)
    : [];

  let repasseProposition = null;
  let vitrerieProposition = null;
  let samediDimancheProposition = null;

  if (nettoyageGamme && fournisseurId && nettoyageTarifs && vitrerieTarif) {
    const freqAnnuelle =
      nettoyageQuantites?.find(
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
        repasseProposition = {
          ...repasseTarif,
          freqAnnuelle,
          prixAnnuel: Math.round(
            freqAnnuelle * repasseTarif.tauxHoraire * repasseTarif.hParPassage
          ),
        };
      }
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

      <Maintenance />
      <SecuriteIncendie
        incendieQuantite={incendieQuantite}
        incendieTarifs={incendieTarifs}
      />
      <Total />
    </section>
  );
};

export default MesServices;
