import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { toast } from "@/hooks/use-toast";
import { gammes, GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
import NettoyageMobilePropositions from "../(mobile)/NettoyageMobilePropositions";
import NettoyageDesktopPropositions from "./NettoyageDesktopPropositions";

type NettoyagePropositionsProps = {
  nettoyageQuantites: SelectNettoyageQuantitesType[];
  nettoyageTarifs: SelectNettoyageTarifsType[];
  repasseTarifs: SelectRepasseTarifsType[];
  vitrerieTarifs: SelectVitrerieTarifsType[];
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
};

const NettoyagePropositions = ({
  nettoyageQuantites,
  nettoyageTarifs,
  repasseTarifs,
  vitrerieTarifs,
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneDistribInstalTarifs,
  hygieneConsosTarifs,
}: NettoyagePropositionsProps) => {
  const { client } = useContext(ClientContext);
  const { hygiene } = useContext(HygieneContext);
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const effectif = client.effectif ?? 0;
  const surface = client.surface ?? 0;

  //Calcul des propositions
  const propositions = nettoyageTarifs.map((item) => {
    const {
      id,
      fournisseurId,
      nomFournisseur,
      slogan: sloganFournisseur,
      logoUrl,
      locationUrl,
      anneeCreation,
      ca,
      effectif: effectifFournisseur,
      nbClients,
      noteGoogle,
      nbAvis,
      hParPassage,
      tauxHoraire,
      gamme,
    } = item;
    const freqAnnuelle =
      nettoyageQuantites.find((quantite) => quantite.gamme === gamme)
        ?.freqAnnuelle ?? null;
    const totalAnnuel =
      freqAnnuelle !== null ? freqAnnuelle * hParPassage * tauxHoraire : null;
    return {
      id,
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      logoUrl,
      locationUrl,
      anneeCreation,
      ca,
      effectifFournisseur,
      nbClients,
      noteGoogle,
      nbAvis,
      freqAnnuelle,
      hParPassage,
      tauxHoraire,
      gamme,
      totalAnnuel,
    };
  });

  const propositionsByFournisseurId = propositions.reduce<
    Record<
      number,
      {
        id: number;
        fournisseurId: number;
        nomFournisseur: string;
        sloganFournisseur: string | null;
        logoUrl: string | null;
        locationUrl: string | null;
        anneeCreation: number | null;
        ca: string | null;
        effectifFournisseur: string | null;
        nbClients: number | null;
        noteGoogle: string | null;
        nbAvis: number | null;
        freqAnnuelle: number | null;
        hParPassage: number;
        tauxHoraire: number;
        gamme: GammeType;
        totalAnnuel: number | null;
      }[]
    >
  >((acc, item) => {
    const { fournisseurId } = item;
    if (!acc[fournisseurId]) {
      acc[fournisseurId] = [];
    }
    // Add the item to the appropriate array
    acc[fournisseurId].push(item);
    acc[fournisseurId].sort(
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme)
    );
    return acc;
  }, {});

  //Un tableau de tableaux de propositions de nettoyage par fournisseur pour itérer
  const formattedPropositions = Object.values(propositionsByFournisseurId);

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
  }) => {
    //Je décoche la proposition
    if (
      nettoyage.infos.fournisseurId === proposition.fournisseurId &&
      nettoyage.infos.gammeSelected === proposition.gamme
    ) {
      setNettoyage((prev) => ({
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
          gammeSelected: null,
        },
        quantites: {
          ...prev.quantites,
          freqAnnuelle: null,
          hParPassage: null,
          hParPassageRepasse: null,
          cadenceCloisons: null,
          cadenceVitres: null,
        },
        prix: {
          tauxHoraire: null,
          tauxHoraireRepasse: null,
          tauxHoraireVitrerie: null,
          minFacturationVitrerie: null,
        },
      }));
      setTotalNettoyage({
        totalService: null,
        totalRepasse: null,
        totalSamedi: null,
        totalDimanche: null,
        totalVitrerie: null,
      });
      setHygiene((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
        },
        prix: {
          prixDistribEmp: null,
          prixDistribEmpPoubelle: null,
          prixDistribSavon: null,
          prixDistribPh: null,
          prixDistribDesinfectant: null,
          prixDistribParfum: null,
          prixDistribBalai: null,
          prixDistribPoubelle: null,
          prixInstalDistrib: null,
          paParPersonneEmp: null,
          paParPersonneSavon: null,
          paParPersonnePh: null,
          paParPersonneDesinfectant: null,
        },
      }));
      setTotalHygiene({
        totalTrilogie: null,
        totalDesinfectant: null,
        totalParfum: null,
        totalBalai: null,
        totalPoubelle: null,
        totalInstallation: null,
      });
      return;
    }
    //Je coche la proposition
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      logoUrl,
      freqAnnuelle,
      gamme,
      hParPassage,
      tauxHoraire,
      totalAnnuel,
    } = proposition;

    if (fournisseurId !== nettoyage.infos.fournisseurId) {
      toast({
        title: "Fournisseur sélectionné",
        description: `Vous avez choisi ${nomFournisseur} pour le nettoyage, ce prestataire ou son partenaire assurera la prestation Hygiène sanitaire`,
      });
    }

    //NETTOYAGE
    const repasseTarif = repasseTarifs.find(
      (tarif) => tarif.fournisseurId === fournisseurId && tarif.gamme === gamme
    );
    const hParPassageRepasse = repasseTarif?.hParPassage ?? null;
    const tauxHoraireRepasse = repasseTarif?.tauxHoraire ?? null;
    const vitrerieTarif = vitrerieTarifs.find(
      (tarif) => tarif.fournisseurId === fournisseurId
    );
    const tauxHoraireVitrerie = vitrerieTarif?.tauxHoraire ?? null;
    const minFacturationVitrerie = vitrerieTarif?.minFacturation ?? null;
    const cadenceVitres = vitrerieTarif?.cadenceVitres ?? null;
    const cadenceCloisons = vitrerieTarif?.cadenceCloisons ?? null;

    setNettoyage((prev) => ({
      infos: {
        ...prev.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        logoUrl,
        gammeSelected: gamme,
      },
      quantites: {
        ...prev.quantites,
        freqAnnuelle,
        hParPassage,
        hParPassageRepasse,
        cadenceCloisons,
        cadenceVitres,
      },
      prix: {
        tauxHoraire,
        tauxHoraireRepasse,
        tauxHoraireVitrerie,
        minFacturationVitrerie,
      },
    }));

    const totalRepasse =
      nettoyage.infos.repasseSelected &&
      freqAnnuelle !== null &&
      hParPassageRepasse !== null &&
      tauxHoraireRepasse !== null
        ? freqAnnuelle * hParPassageRepasse * tauxHoraireRepasse
        : null;
    const totalSamedi = nettoyage.infos.samediSelected
      ? 52 * tauxHoraire * hParPassage
      : null;
    const totalDimanche = nettoyage.infos.dimancheSelected
      ? 52 * tauxHoraire * hParPassage * 1.2
      : null;
    const totalVitrerie =
      nettoyage.infos.vitrerieSelected &&
      cadenceVitres !== null &&
      cadenceCloisons !== null &&
      tauxHoraireVitrerie !== null
        ? nettoyage.quantites.nbPassagesVitrerie *
          Math.max(
            ((surface * 0.15) / cadenceVitres) * tauxHoraireVitrerie +
              ((surface * 0.15) / cadenceCloisons) * tauxHoraireVitrerie,
            minFacturationVitrerie ?? 0
          )
        : null;
    const totalService = totalAnnuel;
    setTotalNettoyage({
      totalService,
      totalRepasse,
      totalSamedi,
      totalDimanche,
      totalVitrerie,
    });
    //HYGIENE
    const hygieneFournisseurId = fournisseurId === 9 ? 12 : fournisseurId;
    const hygieneFournisseurNom = fournisseurId === 9 ? "EPCH" : nomFournisseur;
    const distribsTarifsFournisseur = hygieneDistribTarifs.filter(
      (tarif) => tarif.fournisseurId === hygieneFournisseurId
    );
    const consosTarifFournisseur = hygieneConsosTarifs.find(
      (tarif) => tarif.fournisseurId === hygieneFournisseurId
    );
    const prixDistribEmp =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "emp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribEmpPoubelle =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "poubelleEmp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribSavon =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "savon" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribPh =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "ph" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribDesinfectant =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "desinfectant" &&
          tarif.gamme === hygiene.infos.desinfectantGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribParfum =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "parfum" &&
          tarif.gamme === hygiene.infos.parfumGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribBalai =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "balai" &&
          tarif.gamme === hygiene.infos.balaiGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribPoubelle =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "poubelle" &&
          tarif.gamme === hygiene.infos.poubelleGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? null;

    const paParPersonneEmp = consosTarifFournisseur?.paParPersonneEmp ?? null;
    const paParPersonneSavon =
      consosTarifFournisseur?.paParPersonneSavon ?? null;
    const paParPersonnePh = consosTarifFournisseur?.paParPersonnePh ?? null;
    const paParPersonneDesinfectant =
      consosTarifFournisseur?.paParPersonneDesinfectant ?? null;

    const prixInstalDistrib =
      hygieneDistribInstalTarifs.find(
        (tarif) => tarif.fournisseurId === hygieneFournisseurId
      )?.prixInstallation ?? null;

    const nbDistribEmp =
      hygiene.quantites.nbDistribEmp ?? hygieneDistribQuantite.nbDistribEmp;
    const nbDistribEmpPoubelle = nbDistribEmp;
    const nbDistribSavon =
      hygiene.quantites.nbDistribSavon ?? hygieneDistribQuantite.nbDistribSavon;
    const nbDistribPh =
      hygiene.quantites.nbDistribPh ?? hygieneDistribQuantite.nbDistribPh;
    const nbDistribDesinfectant =
      hygiene.quantites.nbDistribDesinfectant ??
      hygieneDistribQuantite.nbDistribDesinfectant;
    const nbDistribParfum =
      hygiene.quantites.nbDistribParfum ??
      hygieneDistribQuantite.nbDistribParfum;
    const nbDistribBalai =
      hygiene.quantites.nbDistribBalai ?? hygieneDistribQuantite.nbDistribBalai;
    const nbDistribPoubelle =
      hygiene.quantites.nbDistribPoubelle ??
      hygieneDistribQuantite.nbDistribPoubelle;

    setHygiene((prev) => ({
      infos: {
        ...prev.infos,
        fournisseurId: hygieneFournisseurId,
        nomFournisseur: hygieneFournisseurNom,
        sloganFournisseur:
          hygieneFournisseurNom === "EPCH"
            ? "Le spécialiste de l'hygiène"
            : sloganFournisseur,
        logoUrl:
          hygieneFournisseurNom === "EPCH"
            ? "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_epch-Iy9QGTogt8KMcKbWGFrKzjQ6jqlEHS.webp"
            : logoUrl,
      },
      quantites: {
        nbDistribEmp,
        nbDistribEmpPoubelle,
        nbDistribSavon,
        nbDistribPh,
        nbDistribDesinfectant,
        nbDistribParfum,
        nbDistribBalai,
        nbDistribPoubelle,
      },
      prix: {
        prixDistribEmp,
        prixDistribEmpPoubelle,
        prixDistribSavon,
        prixDistribPh,
        prixDistribDesinfectant,
        prixDistribParfum,
        prixDistribBalai,
        prixDistribPoubelle,
        prixInstalDistrib,
        paParPersonneEmp,
        paParPersonneSavon,
        paParPersonnePh,
        paParPersonneDesinfectant,
      },
    }));

    const totalEmp =
      nbDistribEmp && prixDistribEmp !== null && paParPersonneEmp !== null
        ? nbDistribEmp * prixDistribEmp + paParPersonneEmp * effectif
        : 0;

    const totalPoubellEmp =
      nbDistribEmpPoubelle && prixDistribEmpPoubelle !== null
        ? nbDistribEmpPoubelle * prixDistribEmpPoubelle
        : 0;

    const totalSavon =
      nbDistribSavon && prixDistribSavon !== null && paParPersonneSavon !== null
        ? nbDistribSavon * prixDistribSavon + paParPersonneSavon * effectif
        : 0;

    const totalPh =
      nbDistribPh && prixDistribPh !== null && paParPersonnePh !== null
        ? nbDistribPh * prixDistribPh + paParPersonnePh * effectif
        : 0;

    const totalTrilogie = hygiene.infos.trilogieGammeSelected
      ? totalEmp + totalPoubellEmp + totalSavon + totalPh || null
      : null;

    const totalDesinfectant =
      hygiene.infos.desinfectantGammeSelected &&
      prixDistribDesinfectant !== null &&
      paParPersonneDesinfectant !== null &&
      nbDistribDesinfectant
        ? nbDistribDesinfectant * prixDistribDesinfectant +
          paParPersonneDesinfectant * effectif
        : null;
    const totalParfum =
      hygiene.infos.parfumGammeSelected &&
      prixDistribParfum !== null &&
      nbDistribParfum
        ? nbDistribParfum * prixDistribParfum
        : null;
    const totalBalai =
      hygiene.infos.balaiGammeSelected &&
      prixDistribBalai !== null &&
      nbDistribBalai
        ? nbDistribBalai * prixDistribBalai
        : null;
    const totalPoubelle =
      hygiene.infos.poubelleGammeSelected &&
      prixDistribPoubelle !== null &&
      nbDistribPoubelle
        ? nbDistribPoubelle * prixDistribPoubelle
        : null;
    setTotalHygiene({
      totalTrilogie,
      totalDesinfectant,
      totalParfum,
      totalBalai,
      totalPoubelle,
      totalInstallation: prixInstalDistrib,
    });
  };
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <NettoyageMobilePropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
    />
  ) : (
    <NettoyageDesktopPropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
    />
  );
};

export default NettoyagePropositions;
