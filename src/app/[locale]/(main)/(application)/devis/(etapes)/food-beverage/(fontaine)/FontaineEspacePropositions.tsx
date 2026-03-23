import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { TypesEauType } from "@/constants/typesEau";
import { typesPoseArray, TypesPoseType } from "@/constants/typesPose";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { roundNbPersonnesFontaine } from "@/lib/utils/roundNbPersonnesFontaine";
import { useDevisProgressStore } from "@/stores/devis/devisProgressStore";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { FontaineEspaceType } from "@/zod-schemas/fontaines.schema";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles.schema";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs.schema";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import FontaineDesktopEspacePropositions from "./(desktop)/FontaineDesktopEspacePropositions";
import FontaineMobileEspacePropositions from "./(mobile)/FontaineMobileEspacePropositions";
import { getTypeFontaine } from "./getTypeFontaine";

type FontaineEspacePropositionsProps = {
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
  espace: FontaineEspaceType;
};

const FontaineEspacePropositions = ({
  fontainesModeles,
  fontainesTarifs,
  espace,
}: FontaineEspacePropositionsProps) => {
  const t = useTranslations("DevisPage");
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const prospect = useProspectStore((s) => s.prospect);
  const setDevisProgress = useDevisProgressStore((s) => s.setDevisProgress);
  const { fontaines, setFontaines } = useFontainesStore(
    useShallow((s) => ({
      fontaines: s.fontaines,
      setFontaines: s.setFontaines,
    })),
  );
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const router = useRouter();
  //Calcul des propositions
  const fontainesEspacesIds = fontaines.espaces.map(
    (espace) => espace.infos.espaceId,
  );
  const effectif = prospect.effectif ?? 0;
  const nbPersonnes =
    espace.quantites.nbPersonnes ??
    (effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      : effectif);
  const tarifs = fontainesTarifs.filter(
    (tarif) =>
      tarif.nbPersonnes === roundNbPersonnesFontaine(nbPersonnes) &&
      tarif.type === getTypeFontaine(espace.infos.typeEau),
  );
  const fournisseursCompatiblesIds = [
    ...new Set(
      tarifs
        ?.filter((tarif) => tarif[fontaines.infos.dureeLocation] !== null)
        .map(({ entrepriseId }) => entrepriseId),
    ),
  ];

  if (
    fontaines.infos.entrepriseId &&
    fontainesEspacesIds[0] !== espace.infos.espaceId &&
    !fournisseursCompatiblesIds.includes(fontaines.infos.entrepriseId)
  ) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border">
        <p className="max-w-prose text-center text-base">
          {tFontaines(
            "le-fournisseur-choisi-precedemment-ne-propose-pas-doffre-pour-ces-criteres-veuillez-changer-le-type-deau-ou-le-nombre-de-personnes",
          )}
        </p>
      </div>
    );
  }

  const fournisseursIds =
    fontaines.infos.entrepriseId &&
    fontainesEspacesIds[0] !== espace.infos.espaceId
      ? [fontaines.infos.entrepriseId] //1 seul fournisseur
      : tarifs?.map(({ entrepriseId }) => entrepriseId); //tous les fournisseurs

  const propositions = tarifs
    .filter(({ entrepriseId }) => fournisseursIds.includes(entrepriseId))
    .map((tarif) => {
      const prixLoc = tarif[fontaines.infos.dureeLocation] ?? null;
      const prixInstal = tarif.fraisInstallation ?? null;
      const prixMaintenance = tarif.paMaintenance ?? null;
      const prixUnitaireConsoFiltres = tarif.paConsoFiltres ?? null;
      const prixUnitaireConsoCO2 = tarif.paConsoCO2 ?? null;
      const prixUnitaireConsoEauChaude = tarif.paConsoEauChaude ?? null;
      const totalLoc =
        prixLoc !== null && prixMaintenance !== null
          ? prixLoc + prixMaintenance
          : null;
      const totalConso =
        nbPersonnes *
        ((prixUnitaireConsoFiltres ?? 0) +
          (prixUnitaireConsoCO2 ?? 0) +
          (prixUnitaireConsoEauChaude ?? 0));
      const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
      const totalInstallation = prixInstal !== null ? prixInstal : null;
      const modele =
        fontainesModeles.find((modele) => modele.id === tarif.fontaineId)
          ?.modele ?? null;
      const marque =
        fontainesModeles.find((modele) => modele.id === tarif.fontaineId)
          ?.marque ?? null;
      const imageStorageKey = tarif.imageStorageKey ?? null;

      return {
        id: tarif.id,
        entrepriseId: tarif.entrepriseId,
        nomPrestataire: tarif.nomPrestataire,
        sloganPrestataire: tarif.sloganPrestataire,
        logoStorageKey: tarif.logoStorageKey,
        anneeCreation: tarif.anneeCreation,
        ca: tarif.ca,
        effectifPrestataire: tarif.effectifPrestataire,
        nbClients: tarif.nbClients,
        noteGoogle: tarif.noteGoogle,
        nbAvis: tarif.nbAvis,
        modele,
        marque,
        imageStorageKey,
        infos: tarif.infos,
        typePose: tarif.typePose,
        reconditionne: tarif.reconditionne,
        prixLoc,
        prixInstal,
        prixMaintenance,
        prixUnitaireConsoFiltres,
        prixUnitaireConsoCO2,
        prixUnitaireConsoEauChaude,
        totalAnnuel,
        totalInstallation,
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
        modele: string | null;
        marque: string | null;
        imageStorageKey: string | null;
        infos: string | null;
        typePose: TypesPoseType;
        reconditionne: boolean | null;
        prixLoc: number | null;
        prixInstal: number | null;
        prixMaintenance: number | null;
        prixUnitaireConsoFiltres: number | null;
        prixUnitaireConsoCO2: number | null;
        prixUnitaireConsoEauChaude: number | null;
        totalAnnuel: number | null;
        totalInstallation: number | null;
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
      (a, b) =>
        typesPoseArray.indexOf(a.typePose) - typesPoseArray.indexOf(b.typePose),
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
    modele: string | null;
    marque: string | null;
    imageStorageKey: string | null;
    infos: string | null;
    typePose: TypesPoseType;
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => {
    const {
      entrepriseId,
      modele,
      marque,
      typePose,
      reconditionne,
      prixLoc,
      prixInstal,
      prixMaintenance,
      prixUnitaireConsoFiltres,
      prixUnitaireConsoCO2,
      prixUnitaireConsoEauChaude,
    } = proposition;
    //Je décoche
    if (
      espace.infos.poseSelected === typePose &&
      fontaines.infos.entrepriseId === entrepriseId
    ) {
      setFontaines((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  poseSelected: null,
                  marque: null,
                  modele: null,
                  reconditionne: false,
                },
                prix: {
                  prixLoc: null,
                  prixInstal: null,
                  prixMaintenance: null,
                  prixUnitaireConsoFiltres: null,
                  prixUnitaireConsoCO2: null,
                  prixUnitaireConsoEauChaude: null,
                },
              }
            : item,
        ),
      }));
    } else {
      //Je coche
      setFontaines((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  poseSelected: typePose,
                  marque,
                  modele,
                  reconditionne,
                },
                prix: {
                  prixLoc,
                  prixInstal,
                  prixMaintenance,
                  prixUnitaireConsoFiltres,
                  prixUnitaireConsoCO2,
                  prixUnitaireConsoEauChaude,
                },
              }
            : item,
        ),
      }));
    }
  };

  const handleClickFirstEspaceProposition = (proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    modele: string | null;
    marque: string | null;
    imageStorageKey: string | null;
    infos: string | null;
    typePose: TypesPoseType;
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => {
    const {
      entrepriseId,
      nomPrestataire,
      sloganPrestataire,
      logoStorageKey,
      modele,
      marque,
      typePose,
      reconditionne,
      prixLoc,
      prixInstal,
      prixMaintenance,
      prixUnitaireConsoFiltres,
      prixUnitaireConsoCO2,
      prixUnitaireConsoEauChaude,
    } = proposition;
    //======================= JE DECOCHE ======================//
    if (
      espace.infos.poseSelected === typePose &&
      fontaines.infos.entrepriseId === entrepriseId
    ) {
      setFontaines((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          entrepriseId: null,
          nomPrestataire: null,
          sloganPrestataire: null,
          logoStorageKey: null,
        },
        espaces: prev.espaces.map((item) => ({
          ...item,
          infos: {
            ...item.infos,
            poseSelected:
              item.infos.espaceId === espace.infos.espaceId
                ? null
                : item.infos.poseSelected,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          prix: {
            prixLoc: null,
            prixInstal: null,
            prixMaintenance: null,
            prixUnitaireConsoFiltres: null,
            prixUnitaireConsoCO2: null,
            prixUnitaireConsoEauChaude: null,
          },
        })),
      }));
    } else {
      //======================== JE COCHE ======================//
      //Pour chaque espace et le the si gammeCafeSelected je mets à jour les prix et le total
      const newFontainesInfos = {
        ...fontaines.infos,
        entrepriseId,
        nomPrestataire,
        sloganPrestataire,
        logoStorageKey,
      };
      const newEspace: FontaineEspaceType[] = [];
      fontaines.espaces.forEach((item) => {
        if (item.infos.espaceId === espace.infos.espaceId) {
          //1ER LOT
          newEspace.push({
            ...item,
            infos: {
              ...item.infos,
              poseSelected: typePose,
              marque,
              modele,
              reconditionne,
            },
            prix: {
              prixLoc,
              prixInstal,
              prixMaintenance,
              prixUnitaireConsoFiltres,
              prixUnitaireConsoCO2,
              prixUnitaireConsoEauChaude,
            },
          });
          return;
        }
        //AUTRES LOTS
        if (!item.infos.poseSelected) {
          //pas de selection
          newEspace.push(item);
          return;
        }
        //selection existante je recalcule tout
        const itemNbPersonnes =
          item.quantites.nbPersonnes ??
          (effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
            ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
            : effectif);
        const itemMachinesTarifFournisseur = fontainesTarifs.find(
          (tarif) =>
            tarif.nbPersonnes === roundNbPersonnesFontaine(itemNbPersonnes) &&
            tarif.type === getTypeFontaine(item.infos.typeEau) &&
            tarif.typePose === item.infos.poseSelected &&
            tarif[fontaines.infos.dureeLocation] !== null &&
            tarif.entrepriseId === entrepriseId,
        );
        if (!itemMachinesTarifFournisseur) {
          newEspace.push(item);
          return;
        }

        const itemPrixLoc =
          itemMachinesTarifFournisseur?.[fontaines.infos.dureeLocation] ?? null;
        const itemPrixInstal =
          itemMachinesTarifFournisseur?.fraisInstallation ?? null;
        const itemPrixMaintenance =
          itemMachinesTarifFournisseur?.paMaintenance ?? null;

        const itemPrixUnitaireConsoFiltres =
          itemMachinesTarifFournisseur?.paConsoFiltres ?? null;
        const itemPrixUnitaireConsoCO2 =
          itemMachinesTarifFournisseur?.paConsoCO2 ?? null;
        const itemPrixUnitaireConsoEauChaude =
          itemMachinesTarifFournisseur?.paConsoEauChaude ?? null;

        const itemModele = itemMachinesTarifFournisseur
          ? (fontainesModeles?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.fontaineId,
            )?.modele ?? null)
          : null;
        const itemMarque = itemMachinesTarifFournisseur
          ? (fontainesModeles?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.fontaineId,
            )?.marque ?? null)
          : null;
        const itemReconditionne = itemMachinesTarifFournisseur
          ? (itemMachinesTarifFournisseur.reconditionne ?? null)
          : null;
        newEspace.push({
          ...item,
          infos: {
            ...item.infos,
            marque: itemMarque,
            modele: itemModele,
            reconditionne: itemReconditionne,
          },
          prix: {
            prixLoc: itemPrixLoc,
            prixInstal: itemPrixInstal,
            prixMaintenance: itemPrixMaintenance,
            prixUnitaireConsoFiltres: itemPrixUnitaireConsoFiltres,
            prixUnitaireConsoCO2: itemPrixUnitaireConsoCO2,
            prixUnitaireConsoEauChaude: itemPrixUnitaireConsoEauChaude,
          },
        });
      });
      setFontaines((prev) => ({
        ...prev,
        infos: newFontainesInfos,
        espaces: newEspace,
      }));
    }
  };

  const handleAddEspace = () => {
    setFontaines((prev) => ({
      infos: {
        ...prev.infos,
        currentEspaceId:
          prev.espaces[prev.espaces.length - 1].infos.espaceId + 1,
      },
      nbEspaces: (prev.nbEspaces ?? 0) + 1,
      espaces: [
        ...prev.espaces,
        {
          infos: {
            espaceId: prev.espaces[prev.espaces.length - 1].infos.espaceId + 1,
            typeEau: ["Eau froide"] as TypesEauType[],
            poseSelected: null,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          quantites: {
            nbPersonnes:
              effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
                ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
                : effectif,
          },
          prix: {
            prixLoc: null,
            prixInstal: null,
            prixMaintenance: null,
            prixUnitaireConsoFiltres: null,
            prixUnitaireConsoCO2: null,
            prixUnitaireConsoEauChaude: null,
          },
        },
      ].sort((a, b) => a.infos.espaceId - b.infos.espaceId),
    }));
  };

  const handleAlert = () => {
    if (!espace.infos.poseSelected) {
      toast({
        description: t(
          "veuillez-dabord-selectionner-une-offre-ou-retirer-tous-les-espaces",
        ),
        duration: 3000,
        variant: "destructive",
        className: "left-0",
      });
      return;
    }
  };

  const handleClickNextEspace = () => {
    const indexOfCurrentEspace = fontainesEspacesIds.indexOf(
      espace.infos.espaceId,
    );
    setFontaines((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentEspaceId: fontainesEspacesIds[indexOfCurrentEspace + 1],
      },
    }));
  };

  const handleClickNext = () => {
    const searchParams = new URLSearchParams();
    if (prospect.effectif)
      searchParams.set("effectif", prospect.effectif.toString());
    if (prospect.surface)
      searchParams.set("surface", prospect.surface.toString());
    setDevisProgress({ currentStep: 4, completedSteps: [1, 2, 3] });
    router.push({
      pathname: "/devis/pilotage",
      query: Object.fromEntries(searchParams.entries()),
    });
  };

  return isTabletOrMobile ? (
    <FontaineMobileEspacePropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
      handleClickFirstEspaceProposition={handleClickFirstEspaceProposition}
      espace={espace}
      fontainesEspacesIds={fontainesEspacesIds}
      handleAddEspace={handleAddEspace}
    />
  ) : (
    <FontaineDesktopEspacePropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
      handleClickFirstEspaceProposition={handleClickFirstEspaceProposition}
      espace={espace}
      fontainesEspacesIds={fontainesEspacesIds}
      handleAddEspace={handleAddEspace}
      handleClickNext={handleClickNext}
      handleClickNextEspace={handleClickNextEspace}
      handleAlert={handleAlert}
    />
  );
};

export default FontaineEspacePropositions;
