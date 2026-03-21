import { toast } from "@/hooks/use-toast";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { gammes, GammeType } from "@/zod-schemas/gamme.schema";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs.schema";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs.schema";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs.schema";
import { SelectHygieneMinFacturationType } from "@/zod-schemas/hygieneMinFacturation.schema";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites.schema";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse.schema";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs.schema";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie.schema";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
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
  hygieneMinFacturation: SelectHygieneMinFacturationType[];
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
  hygieneMinFacturation,
}: NettoyagePropositionsProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const hygiene = useHygieneStore((s) => s.hygiene);
  const { nettoyage, setNettoyage } = useNettoyageStore(
    useShallow((s) => ({
      nettoyage: s.nettoyage,
      setNettoyage: s.setNettoyage,
    })),
  );
  const setHygiene = useHygieneStore((s) => s.setHygiene);
  //Calcul des propositions
  const propositions = nettoyageTarifs.map((item) => {
    const {
      id,
      entrepriseId,
      nomPrestataire,
      slogan: sloganPrestataire,
      logoStorageKey,
      anneeCreation,
      ca,
      effectifPrestataire,
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
      entrepriseId,
      nomPrestataire,
      sloganPrestataire,
      logoStorageKey,
      anneeCreation,
      ca,
      effectifPrestataire,
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
      string,
      {
        id: string;
        entrepriseId: string;
        nomPrestataire: string;
        sloganPrestataire: string | null;
        logoStorageKey: string | null;
        anneeCreation: number | null;
        ca: string | null;
        effectifPrestataire: string | null;
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
    const { entrepriseId } = item;
    if (!acc[entrepriseId]) {
      acc[entrepriseId] = [];
    }
    // Add the item to the appropriate array
    acc[entrepriseId].push(item);
    acc[entrepriseId].sort(
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme),
    );
    return acc;
  }, {});

  //Un tableau de tableaux de propositions de nettoyage par fournisseur pour itérer
  const formattedPropositions = Object.values(propositionsByFournisseurId);

  const handleClickProposition = (proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
      nettoyage.infos.entrepriseId === proposition.entrepriseId &&
      nettoyage.infos.gammeSelected === proposition.gamme
    ) {
      setNettoyage((prev) => ({
        infos: {
          ...prev.infos,
          tarifSelectedId: null,
          entrepriseId: null,
          nomPrestataire: null,
          sloganPrestataire: null,
          logoStorageKey: null,
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
          fraisDeplacementVitrerie: null,
        },
      }));
      setHygiene((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          entrepriseId: null,
          nomPrestataire: null,
          sloganPrestataire: null,
          logoStorageKey: null,
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
          minFacturation: null,
        },
      }));
      return;
    }
    //Je coche la proposition
    const {
      id,
      entrepriseId,
      nomPrestataire,
      sloganPrestataire,
      logoStorageKey,
      freqAnnuelle,
      gamme,
      hParPassage,
      tauxHoraire,
    } = proposition;

    if (entrepriseId !== nettoyage.infos.entrepriseId) {
      toast({
        title: t("fournisseur-selectionne"),
        description: tNettoyage(
          "vous-avez-choisi-nomfournisseur-pour-le-nettoyage-ce-prestataire-ou-son-partenaire-assurera-la-prestation-hygiene-sanitaire",
          { nomPrestataire },
        ),
      });
    }

    //NETTOYAGE
    const repasseTarif = repasseTarifs.find(
      (tarif) => tarif.entrepriseId === entrepriseId && tarif.gamme === gamme,
    );
    const hParPassageRepasse = repasseTarif?.hParPassage ?? null;
    const tauxHoraireRepasse = repasseTarif?.tauxHoraire ?? null;
    const vitrerieTarif = vitrerieTarifs.find(
      (tarif) => tarif.entrepriseId === entrepriseId,
    );
    const tauxHoraireVitrerie = vitrerieTarif?.tauxHoraire ?? null;
    const minFacturationVitrerie = vitrerieTarif?.minFacturation ?? null;
    const fraisDeplacementVitrerie = vitrerieTarif?.fraisDeplacement ?? null;
    const cadenceVitres = vitrerieTarif?.cadenceVitres ?? null;
    const cadenceCloisons = vitrerieTarif?.cadenceCloisons ?? null;

    setNettoyage((prev) => ({
      infos: {
        ...prev.infos,
        tarifSelectedId: id,
        entrepriseId,
        nomPrestataire,
        sloganPrestataire,
        logoStorageKey,
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
        fraisDeplacementVitrerie,
      },
    }));

    //HYGIENE
    const hygieneFournisseurId = entrepriseId;
    const hygieneFournisseurNom = nomPrestataire;
    const distribsTarifsFournisseur = hygieneDistribTarifs.filter(
      (tarif) => tarif.entrepriseId === hygieneFournisseurId,
    );
    const consosTarifFournisseur = hygieneConsosTarifs.find(
      (tarif) => tarif.entrepriseId === hygieneFournisseurId,
    );
    const minFacturationFournisseur = hygieneMinFacturation.find(
      (tarif) => tarif.entrepriseId === hygieneFournisseurId,
    );
    const prixDistribEmp =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "emp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected,
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribEmpPoubelle =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "poubelleEmp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected,
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribSavon =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "savon" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected,
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribPh =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "ph" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected,
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribDesinfectant =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "desinfectant" &&
          tarif.gamme === hygiene.infos.desinfectantGammeSelected,
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribParfum =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "parfum" &&
          tarif.gamme === hygiene.infos.parfumGammeSelected,
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribBalai =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "balai" &&
          tarif.gamme === hygiene.infos.balaiGammeSelected,
      )?.[hygiene.infos.dureeLocation] ?? null;
    const prixDistribPoubelle =
      distribsTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "poubelle" &&
          tarif.gamme === hygiene.infos.poubelleGammeSelected,
      )?.[hygiene.infos.dureeLocation] ?? null;
    const minFacturation = minFacturationFournisseur?.minFacturation ?? null;

    const paParPersonneEmp = consosTarifFournisseur?.paParPersonneEmp ?? null;
    const paParPersonneSavon =
      consosTarifFournisseur?.paParPersonneSavon ?? null;
    const paParPersonnePh = consosTarifFournisseur?.paParPersonnePh ?? null;
    const paParPersonneDesinfectant =
      consosTarifFournisseur?.paParPersonneDesinfectant ?? null;

    const prixInstalDistrib =
      hygieneDistribInstalTarifs.find(
        (tarif) => tarif.entrepriseId === hygieneFournisseurId,
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
        entrepriseId: hygieneFournisseurId,
        nomPrestataire: hygieneFournisseurNom,
        sloganPrestataire:
          hygieneFournisseurNom === "EPCH"
            ? "Le spécialiste de l'hygiène"
            : sloganPrestataire,
        logoStorageKey:
          hygieneFournisseurNom === "EPCH"
            ? "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_epch-Iy9QGTogt8KMcKbWGFrKzjQ6jqlEHS.webp"
            : logoStorageKey,
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
        minFacturation,
      },
    }));

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
