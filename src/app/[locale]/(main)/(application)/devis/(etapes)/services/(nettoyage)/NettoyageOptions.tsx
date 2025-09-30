import { MAJORATION_DIMANCHE } from "@/constants/constants";
import { getFournisseur } from "@/lib/queries/fournisseurs/getFournisseurs";
import {
  getNettoyageOffre,
  getNettoyageProduit,
  getRepasseOffre,
  getRepasseProduit,
  getVitrerieOffre,
  getVitrerieProduitForFournisseur,
} from "@/lib/queries/nettoyage/getNettoyage";
import { getPanier } from "@/lib/queries/panier/getPanier";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { getTranslations } from "next-intl/server";
import NettoyageOptionsPropositions from "./(desktop)/NettoyageOptionsPropositions";

type NettoyageOptionsProps = {
  nettoyageQuantites: SelectNettoyageQuantitesType[];
};

const NettoyageOptions = async ({
  nettoyageQuantites,
}: NettoyageOptionsProps) => {
  const tNettoyage = await getTranslations("DevisPage.services.nettoyage");
  const panier = await getPanier();
  const nettoyageOffreId = Object.keys(panier ?? {})
    .find((k) => k.startsWith("Nettoyage:"))
    ?.split(":")[1];

  if (!nettoyageOffreId) return null;
  const nettoyageOffre = await getNettoyageOffre(parseInt(nettoyageOffreId));
  if (!nettoyageOffre) return null;
  const nettoyageProduit = await getNettoyageProduit(nettoyageOffre.produitId);
  if (!nettoyageProduit) return null;

  const fournisseurId = nettoyageProduit.fournisseurId;
  const fournisseur = await getFournisseur(fournisseurId);
  if (!fournisseur) return null;
  const gamme = nettoyageProduit.gamme;
  const color = getFm4AllColor(gamme);
  const surface = nettoyageProduit.surface;
  const freqAnnuelle = nettoyageQuantites.find(
    (q) => q.surface === surface && q.gamme === gamme,
  )?.freqAnnuelle;

  const repasseProduit = await getRepasseProduit(fournisseurId, surface, gamme);

  let repasseOffre = null;
  if (repasseProduit) repasseOffre = await getRepasseOffre(repasseProduit.id);

  const repasseProposition =
    repasseOffre && repasseProduit
      ? {
          id: repasseOffre.id,
          hParPassage: repasseProduit?.hParPassage,
          freqAnnuelle: freqAnnuelle,
          prixAnnuel: freqAnnuelle
            ? freqAnnuelle *
              repasseProduit.hParPassage *
              repasseOffre.tauxHoraire
            : null,
        }
      : null;

  const samediProposition = {
    id: nettoyageOffre.id,
    prixAnnuel: 52 * nettoyageProduit.hParPassage * nettoyageOffre.tauxHoraire,
    hParPassage: nettoyageProduit.hParPassage,
  };

  const dimancheProposition = {
    id: nettoyageOffre.id,
    prixAnnuel:
      52 *
      nettoyageProduit.hParPassage *
      nettoyageOffre.tauxHoraire *
      MAJORATION_DIMANCHE,
    hParPassage: nettoyageProduit.hParPassage,
  };

  const vitrerieProduit = await getVitrerieProduitForFournisseur(fournisseurId);

  let vitrerieOffre = null;
  if (vitrerieProduit)
    vitrerieOffre = await getVitrerieOffre(vitrerieProduit.id);

  const vitrerieProposition =
    vitrerieOffre && vitrerieProduit
      ? {
          id: vitrerieOffre.id,
          tauxHoraire: vitrerieOffre.tauxHoraire,
          cadenceCloisons: vitrerieProduit.cadenceCloisons,
          cadenceVitres: vitrerieProduit.cadenceVitres,
          minFacturation: vitrerieProduit.minFacturation,
          fraisDeplacement: vitrerieProduit.fraisDeplacement,
        }
      : null;

  //Offres déjà dans le panier

  const initialSelectedRepasseId = Object.keys(panier ?? {})
    .find((k) => k.startsWith("NettoyageRepasse:"))
    ?.split(":")[1];
  const initialSelectedSamediId = Object.keys(panier ?? {})
    .find((k) => k.startsWith("NettoyageSamedi:"))
    ?.split(":")[1];
  const initialSelectedDimancheId = Object.keys(panier ?? {})
    .find((k) => k.startsWith("NettoyageDimanche:"))
    ?.split(":")[1];
  const initialSelectedVitrerieId = Object.keys(panier ?? {})
    .find((k) => k.startsWith("NettoyageVitrerie:"))
    ?.split(":")[1];

  let initialSelectedNbPassagesVitrerie = undefined;
  if (
    panier &&
    Object.keys(panier ?? {}).find(
      (k) => k === `NettoyageVitrerie:${initialSelectedVitrerieId}`,
    )
  )
    initialSelectedNbPassagesVitrerie = panier
      ? panier[`NettoyageVitrerie:${initialSelectedVitrerieId}`]
      : undefined;

  return (
    <div className="w-full flex-1 overflow-auto">
      {!nettoyageOffre ? (
        <div className="flex h-full items-center justify-center text-base lg:text-lg">
          <p className="text-fm4alldestructive text-center">
            {tNettoyage("veuillez-d-abord-selectionner-une-offre-de-nettoyage")}
          </p>
        </div>
      ) : (
        <NettoyageOptionsPropositions
          samediProposition={samediProposition}
          dimancheProposition={dimancheProposition}
          repasseProposition={repasseProposition}
          vitrerieProposition={vitrerieProposition}
          color={color}
          initialSelectedRepasseId={initialSelectedRepasseId}
          initialSelectedSamediId={initialSelectedSamediId}
          initialSelectedDimancheId={initialSelectedDimancheId}
          initialSelectedVitrerieId={initialSelectedVitrerieId}
          initialSelectedNbPassagesVitrerie={initialSelectedNbPassagesVitrerie}
        />
      )}
    </div>
  );
};

export default NettoyageOptions;
