import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { TypesEauType } from "@/constants/typesEau";
import { typesPoseArray, TypesPoseType } from "@/constants/typesPose";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { FontainesContext } from "@/context/FontainesProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { roundNbPersonnesFontaine } from "@/lib/utils/roundNbPersonnesFontaine";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
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
  const { client } = useContext(ClientContext);
  const { setDevisProgress } = useContext(DevisProgressContext);
  const { fontaines, setFontaines } = useContext(FontainesContext);
  const { setTotalFontaines } = useContext(TotalFontainesContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const router = useRouter();
  //Calcul des propositions
  const fontainesEspacesIds = fontaines.espaces.map(
    (espace) => espace.infos.espaceId
  );
  const effectif = client.effectif ?? 0;
  const nbPersonnes =
    espace.quantites.nbPersonnes ||
    (effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      : effectif);
  const tarifs = fontainesTarifs.filter(
    (tarif) =>
      tarif.nbPersonnes === roundNbPersonnesFontaine(nbPersonnes) &&
      tarif.type === getTypeFontaine(espace.infos.typeEau)
  );
  const fournisseursCompatiblesIds = [
    ...new Set(
      tarifs
        ?.filter((tarif) => tarif[fontaines.infos.dureeLocation] !== null)
        .map(({ fournisseurId }) => fournisseurId)
    ),
  ];

  if (
    fontaines.infos.fournisseurId &&
    fontainesEspacesIds[0] !== espace.infos.espaceId &&
    !fournisseursCompatiblesIds.includes(fontaines.infos.fournisseurId)
  ) {
    return (
      <div className="flex-1 flex items-center justify-center border rounded-xl">
        <p className="max-w-prose text-center text-base">
          {tFontaines(
            "le-fournisseur-choisi-precedemment-ne-propose-pas-doffre-pour-ces-criteres-veuillez-changer-le-type-deau-ou-le-nombre-de-personnes"
          )}
        </p>
      </div>
    );
  }

  const fournisseursIds =
    fontaines.infos.fournisseurId &&
    fontainesEspacesIds[0] !== espace.infos.espaceId
      ? [fontaines.infos.fournisseurId] //1 seul fournisseur
      : tarifs?.map(({ fournisseurId }) => fournisseurId); //tous les fournisseurs

  const propositions = tarifs
    .filter(({ fournisseurId }) => fournisseursIds.includes(fournisseurId))
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
      const imageUrl =
        fontainesModeles.find((modele) => modele.id === tarif.fontaineId)
          ?.imageUrl ?? null;

      return {
        id: tarif.id,
        fournisseurId: tarif.fournisseurId,
        nomFournisseur: tarif.nomFournisseur,
        sloganFournisseur: tarif.sloganFournisseur,
        logoUrl: tarif.logoUrl,
        locationUrl: tarif.locationUrl,
        anneeCreation: tarif.anneeCreation,
        ca: tarif.ca,
        effectifFournisseur: tarif.effectifFournisseur,
        nbClients: tarif.nbClients,
        noteGoogle: tarif.noteGoogle,
        nbAvis: tarif.nbAvis,
        modele,
        marque,
        imageUrl,
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
        modele: string | null;
        marque: string | null;
        imageUrl: string | null;
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
    const { fournisseurId } = item;
    if (!acc[fournisseurId]) {
      acc[fournisseurId] = [];
    }
    // Add the item to the appropriate array
    acc[fournisseurId].push(item);
    acc[fournisseurId].sort(
      (a, b) =>
        typesPoseArray.indexOf(a.typePose) - typesPoseArray.indexOf(b.typePose)
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
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
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
      fournisseurId,
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
      totalAnnuel,
      totalInstallation,
    } = proposition;
    //Je décoche
    if (
      espace.infos.poseSelected === typePose &&
      fontaines.infos.fournisseurId === fournisseurId
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
            : item
        ),
      }));
      setTotalFontaines((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) =>
          item.espaceId === espace.infos.espaceId
            ? {
                ...item,
                total: null,
                totalInstallation: null,
              }
            : item
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
            : item
        ),
      }));
      setTotalFontaines((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) =>
          item.espaceId === espace.infos.espaceId
            ? {
                ...item,
                total: totalAnnuel,
                totalInstallation,
              }
            : item
        ),
      }));
    }
  };

  const handleClickFirstEspaceProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
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
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      logoUrl,
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
      totalAnnuel,
      totalInstallation,
    } = proposition;
    //======================= JE DECOCHE ======================//
    if (
      espace.infos.poseSelected === typePose &&
      fontaines.infos.fournisseurId === fournisseurId
    ) {
      setFontaines((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
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
      setTotalFontaines((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) => ({
          ...item,
          total: null,
          totalInstallation: null,
        })),
      }));
    } else {
      //======================== JE COCHE ======================//
      //Pour chaque espace et le the si gammeCafeSelected je mets à jour les prix et le total
      const newFontainesInfos = {
        ...fontaines.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        logoUrl,
      };
      const newEspace: FontaineEspaceType[] = [];
      const newTotalEspace: {
        espaceId: number;
        total: number | null;
        totalInstallation: number | null;
      }[] = [];
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
          newTotalEspace.push({
            espaceId: item.infos.espaceId,
            total: totalAnnuel,
            totalInstallation: totalInstallation,
          });
          return;
        }
        //AUTRES LOTS
        if (!item.infos.poseSelected) {
          //pas de selection
          newEspace.push(item);
          newTotalEspace.push({
            espaceId: item.infos.espaceId,
            total: null,
            totalInstallation: null,
          });
          return;
        }
        //selection existante je recalcule tout
        const itemNbPersonnes =
          item.quantites.nbPersonnes ||
          (effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
            ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
            : effectif);
        const itemMachinesTarifFournisseur = fontainesTarifs.find(
          (tarif) =>
            tarif.nbPersonnes === roundNbPersonnesFontaine(itemNbPersonnes) &&
            tarif.type === getTypeFontaine(item.infos.typeEau) &&
            tarif.typePose === item.infos.poseSelected &&
            tarif[fontaines.infos.dureeLocation] !== null &&
            tarif.fournisseurId === fournisseurId
        );
        if (!itemMachinesTarifFournisseur) {
          newEspace.push(item);
          newTotalEspace.push({
            espaceId: item.infos.espaceId,
            total: null,
            totalInstallation: null,
          });
          return;
        }

        const itemPrixLoc =
          itemMachinesTarifFournisseur?.[fontaines.infos.dureeLocation] ?? null;
        const itemPrixInstal =
          itemMachinesTarifFournisseur?.fraisInstallation ?? null;
        const itemTotalInstallation =
          itemPrixInstal !== null ? itemPrixInstal : null;
        const itemPrixMaintenance =
          itemMachinesTarifFournisseur?.paMaintenance ?? null;

        const itemPrixUnitaireConsoFiltres =
          itemMachinesTarifFournisseur?.paConsoFiltres ?? null;
        const itemPrixUnitaireConsoCO2 =
          itemMachinesTarifFournisseur?.paConsoCO2 ?? null;
        const itemPrixUnitaireConsoEauChaude =
          itemMachinesTarifFournisseur?.paConsoEauChaude ?? null;

        const itemTotalLoc =
          itemPrixLoc !== null && itemPrixMaintenance !== null
            ? itemPrixLoc + itemPrixMaintenance
            : null;
        const itemTotalConso =
          ((itemPrixUnitaireConsoFiltres ?? 0) +
            (itemPrixUnitaireConsoCO2 ?? 0) +
            (itemPrixUnitaireConsoEauChaude ?? 0)) *
          itemNbPersonnes;

        const itemTotalAnnuel =
          itemTotalLoc !== null ? itemTotalLoc + itemTotalConso : null;
        const itemModele = itemMachinesTarifFournisseur
          ? (fontainesModeles?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.fontaineId
            )?.modele ?? null)
          : null;
        const itemMarque = itemMachinesTarifFournisseur
          ? (fontainesModeles?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.fontaineId
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
        newTotalEspace.push({
          espaceId: item.infos.espaceId,
          total: itemTotalAnnuel,
          totalInstallation: itemTotalInstallation,
        });
      });
      setFontaines((prev) => ({
        ...prev,
        infos: newFontainesInfos,
        espaces: newEspace,
      }));
      setTotalFontaines({
        totalEspaces: newTotalEspace,
      });
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
    setTotalFontaines((prev) => ({
      totalEspaces: [
        ...prev.totalEspaces,
        {
          espaceId:
            prev.totalEspaces[prev.totalEspaces.length - 1].espaceId + 1,
          total: 0,
          totalInstallation: 0,
        },
      ],
    }));
  };

  const handleAlert = () => {
    if (!espace.infos.poseSelected) {
      toast({
        description: t(
          "veuillez-dabord-selectionner-une-offre-ou-retirer-tous-les-espaces"
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
      espace.infos.espaceId
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
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (client.surface) searchParams.set("surface", client.surface.toString());
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
