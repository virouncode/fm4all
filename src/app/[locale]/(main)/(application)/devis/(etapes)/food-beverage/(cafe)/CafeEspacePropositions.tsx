"use client";

import {
  MAX_NB_PERSONNES_PAR_ESPACE,
  RATIO_CHOCO,
  RATIO_LAIT,
  RATIO_SUCRE,
} from "@/constants/constants";
import { TypesBoissonsType } from "@/constants/typesBoissons";
import { toast } from "@/hooks/use-toast";
import { roundEffectif } from "@/lib/utils/roundEffectif";
import { roundNbPersonnesCafeConso } from "@/lib/utils/roundNbPersonnesCafeConso";
import { roundNbPersonnesCafeMachines } from "@/lib/utils/roundNbPersonnesCafeMachines";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useFoodBeverageStore } from "@/stores/devis/foodBeverageStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useTheStore } from "@/stores/devis/theStore";
import { CafeEspaceType } from "@/zod-schemas/cafe.schema";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs.schema";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine.schema";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs.schema";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs.schema";
import { gammes, GammeType } from "@/zod-schemas/gamme.schema";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs.schema";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs.schema";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs.schema";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import CafeDesktopEspacePropositions from "./(desktop)/CafeDesktopEspacePropositions";
import CafeMobileEspacePropositions from "./(mobile)/CafeMobileEspacePropositions";

type CafeEspacePropositionsProps = {
  espace: CafeEspaceType;
  cafeMachines: SelectCafeMachinesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocolatConsoTarifs: SelectChocolatConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
  sucreConsoTarifs: SelectSucreConsoTarifsType[];
};

const CafeEspacePropositions = ({
  espace,
  cafeMachines,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocolatConsoTarifs,
  theConsoTarifs,
  sucreConsoTarifs,
}: CafeEspacePropositionsProps) => {
  const tCafe = useTranslations("DevisPage.foodBeverage.cafe");
  const t = useTranslations("DevisPage");
  const prospect = useProspectStore((s) => s.prospect);
  const setFoodBeverage = useFoodBeverageStore((s) => s.setFoodBeverage);
  const { cafe, setCafe } = useCafeStore(
    useShallow((s) => ({
      cafe: s.cafe,
      setCafe: s.setCafe,
    })),
  );
  const { the, setThe } = useTheStore(
    useShallow((s) => ({
      the: s.the,
      setThe: s.setThe,
    })),
  );
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  //Calcul des propositions
  const cafeEspacesIds = cafe.espaces.map((espace) => espace.infos.espaceId);
  const effectif = prospect.effectif ?? 0;
  const nbPersonnes =
    espace.quantites.nbPersonnes ??
    (effectif > MAX_NB_PERSONNES_PAR_ESPACE
      ? MAX_NB_PERSONNES_PAR_ESPACE
      : effectif);
  const nbTassesParJ = nbPersonnes * 2;

  const machinesTarifs = cafeMachinesTarifs.filter(
    (tarif) =>
      tarif.nbPersonnes === roundNbPersonnesCafeMachines(nbPersonnes) &&
      tarif.type === espace.infos.typeBoissons,
  ); //1 ligne par fournisseur

  const fournisseursCompatiblesIds = machinesTarifs
    ?.filter((tarif) => tarif[cafe.infos.dureeLocation] !== null)
    .map(({ entrepriseId }) => entrepriseId);

  if (
    cafe.infos.entrepriseId &&
    cafeEspacesIds[0] !== espace.infos.espaceId &&
    !fournisseursCompatiblesIds.includes(cafe.infos.entrepriseId)
  ) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border">
        <p className="max-w-prose text-center text-base">
          {tCafe(
            "le-fournisseur-choisi-precedemment-ne-propose-pas-doffre-pour-ces-criteres-veuillez-changer-le-type-de-boissons-ou-le-nombre-de-personnes",
          )}
        </p>
      </div>
    );
  }

  const fournisseursIds =
    cafe.infos.entrepriseId && cafeEspacesIds[0] !== espace.infos.espaceId
      ? [cafe.infos.entrepriseId] //1 seul fournisseur
      : machinesTarifs?.map(({ entrepriseId }) => entrepriseId); //tous les fournisseurs

  const nbTassesParAn = nbPersonnes * 400;

  // const nbPersonnesTotal = cafe.espaces.reduce(
  //   (acc, curr) =>
  //     acc +
  //     (curr.infos.gammeCafeSelected !== null
  //       ? curr.quantites.nbPersonnes ??
  //         (effectif > MAX_NB_PERSONNES_PAR_ESPACE
  //           ? MAX_NB_PERSONNES_PAR_ESPACE
  //           : effectif)
  //       : 0),
  //   0
  // );

  const propositions = cafeConsoTarifs
    .filter(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
        fournisseursIds.includes(tarif.entrepriseId),
    )
    .map((tarif) => {
      const {
        id,
        infos,
        entrepriseId,
        nomPrestataire,
        slogan: sloganPrestataire,
        logoStorageKey,
        anneeCreation,
        ca,
        effectifFournisseur,
        nbClients,
        noteGoogle,
        nbAvis,
        gamme,
        prixUnitaire,
      } = tarif;
      //MACHINES
      const machinesTarifFournisseur = machinesTarifs.find(
        (item) => item.entrepriseId === entrepriseId,
      );

      const nbMachines = machinesTarifFournisseur?.nbMachines ?? null;
      const prixLoc =
        machinesTarifFournisseur?.[cafe.infos.dureeLocation] ?? null;
      const prixInstal = machinesTarifFournisseur?.fraisInstallation ?? null;
      const prixMaintenance = machinesTarifFournisseur?.paMaintenance ?? null;
      const nbPassagesParAn = machinesTarifFournisseur?.nbPassages ?? null;
      const totalLoc =
        prixLoc !== null && prixMaintenance !== null
          ? prixLoc + prixMaintenance
          : null;
      const totalInstallation = prixInstal !== null ? prixInstal : null;
      //CAFE
      const prixUnitaireConsoCafe = prixUnitaire;

      //LAIT
      const consoLaitTarifFournisseur = laitConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
          tarif.entrepriseId === entrepriseId,
      );
      const typeLait =
        espace.infos.typeBoissons !== "cafe"
          ? (machinesTarifFournisseur?.typeLait ?? null)
          : null;
      const prixUnitaireConsoLait =
        typeLait === "dosettes"
          ? (consoLaitTarifFournisseur?.prixUnitaireDosette ?? null)
          : typeLait === "frais"
            ? (consoLaitTarifFournisseur?.prixUnitaireFrais ?? null)
            : typeLait === "poudre"
              ? (consoLaitTarifFournisseur?.prixUnitairePoudre ?? null)
              : null;
      //CHOCOLAT
      const consoChocolatTarifFournisseur = chocolatConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
          tarif.entrepriseId === entrepriseId,
      );
      const typeChocolat =
        espace.infos.typeBoissons === "chocolat"
          ? (machinesTarifFournisseur?.typeChocolat ?? null)
          : null;
      const prixUnitaireConsoChocolat =
        typeChocolat === "sachets"
          ? (consoChocolatTarifFournisseur?.prixUnitaireSachet ?? null)
          : typeChocolat === "poudre"
            ? (consoChocolatTarifFournisseur?.prixUnitairePoudre ?? null)
            : null;
      //SUCRE
      const consoSucreTarifFournisseur = sucreConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
          tarif.entrepriseId === entrepriseId,
      );
      const prixUnitaireConsoSucre =
        consoSucreTarifFournisseur?.prixUnitaire ?? null;

      const totalConso =
        (prixUnitaireConsoCafe ?? 0) * nbTassesParAn +
        (prixUnitaireConsoSucre ?? 0) * nbTassesParAn * RATIO_SUCRE +
        (espace.infos.typeBoissons !== "cafe"
          ? (prixUnitaireConsoLait ?? 0) * nbTassesParAn * RATIO_LAIT
          : 0) +
        (espace.infos.typeBoissons === "chocolat"
          ? (prixUnitaireConsoChocolat ?? 0) * nbTassesParAn * RATIO_CHOCO
          : 0);

      const totalAnnuel =
        nbPersonnes && totalLoc !== null ? totalLoc + totalConso : null;
      //Modele
      const modele = machinesTarifFournisseur
        ? (cafeMachines?.find(
            ({ id }) => id === machinesTarifFournisseur?.cafeMachineId,
          )?.modele ?? null)
        : null;
      const marque = machinesTarifFournisseur
        ? (cafeMachines?.find(
            ({ id }) => id === machinesTarifFournisseur?.cafeMachineId,
          )?.marque ?? null)
        : null;
      const imageUrl = null;
      const reconditionne = machinesTarifFournisseur
        ? (machinesTarifFournisseur.reconditionne ?? null)
        : null;
      return {
        id,
        entrepriseId,
        nomPrestataire,
        sloganPrestataire,
        logoStorageKey,
        anneeCreation,
        ca,
        effectifFournisseur,
        nbClients,
        noteGoogle,
        nbAvis,
        gamme,
        modele,
        marque,
        imageUrl,
        infos,
        reconditionne,
        typeLait,
        typeChocolat,
        nbMachines,
        nbTassesParJ,
        nbPassagesParAn,
        prixLoc,
        prixInstal,
        prixMaintenance,
        prixUnitaireConsoCafe,
        prixUnitaireConsoLait,
        prixUnitaireConsoChocolat,
        prixUnitaireConsoSucre,
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
        effectifFournisseur: string | null;
        nbClients: number | null;
        noteGoogle: string | null;
        nbAvis: number | null;
        gamme: GammeType;
        modele: string | null;
        marque: string | null;
        imageUrl: null;
        infos: string | null;
        reconditionne: boolean | null;
        typeLait: "dosettes" | "frais" | "poudre" | null;
        typeChocolat: "sachets" | "poudre" | null;
        nbMachines: number | null;
        nbTassesParJ: number;
        nbPassagesParAn: number | null;
        prixLoc: number | null;
        prixInstal: number | null;
        prixMaintenance: number | null;
        prixUnitaireConsoCafe: number | null;
        prixUnitaireConsoLait: number | null;
        prixUnitaireConsoChocolat: number | null;
        prixUnitaireConsoSucre: number | null;
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
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme),
    );
    return acc;
  }, {});

  const formattedPropositions = Object.values(propositionsByFournisseurId);

  const handleClickProposition = (proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    gamme: GammeType;
    modele: string | null;
    marque: string | null;
    imageUrl: null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "sachets" | "poudre" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => {
    const {
      entrepriseId,
      gamme,
      modele,
      marque,
      reconditionne,
      typeLait,
      typeChocolat,
      nbMachines,
      nbPassagesParAn,
      prixLoc,
      prixInstal,
      prixMaintenance,
      prixUnitaireConsoCafe,
      prixUnitaireConsoLait,
      prixUnitaireConsoChocolat,
      prixUnitaireConsoSucre,
      totalAnnuel,
      totalInstallation,
    } = proposition;
    //Je décoche
    if (
      espace.infos.gammeCafeSelected === gamme &&
      cafe.infos.entrepriseId === entrepriseId
    ) {
      setCafe((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  gammeCafeSelected: null,
                  marque: null,
                  modele: null,
                  reconditionne: false,
                  typeLait: null,
                  typeChocolat: null,
                },
                quantites: {
                  ...item.quantites,
                  nbMachines: null,
                  nbPassagesParAn: null,
                },
                prix: {
                  prixLoc: null,
                  prixInstal: null,
                  prixMaintenance: null,
                  prixUnitaireConsoCafe: null,
                  prixUnitaireConsoLait: null,
                  prixUnitaireConsoChocolat: null,
                  prixUnitaireConsoSucre: null,
                },
              }
            : item,
        ),
      }));
    } else {
      //Je coche
      setCafe((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  gammeCafeSelected: gamme,
                  marque,
                  modele,
                  reconditionne,
                  typeLait,
                  typeChocolat,
                },
                quantites: {
                  ...item.quantites,
                  nbMachines,
                  nbPassagesParAn,
                },
                prix: {
                  prixLoc,
                  prixInstal,
                  prixMaintenance,
                  prixUnitaireConsoCafe,
                  prixUnitaireConsoLait,
                  prixUnitaireConsoChocolat,
                  prixUnitaireConsoSucre,
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
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    imageUrl: null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "sachets" | "poudre" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => {
    const {
      entrepriseId,
      nomPrestataire,
      sloganPrestataire,
      logoStorageKey,
      gamme,
      modele,
      marque,
      reconditionne,
      typeLait,
      typeChocolat,
      nbMachines,
      nbPassagesParAn,
      prixLoc,
      prixInstal,
      prixMaintenance,
      prixUnitaireConsoCafe,
      prixUnitaireConsoLait,
      prixUnitaireConsoChocolat,
      prixUnitaireConsoSucre,
      totalAnnuel,
      totalInstallation,
    } = proposition;
    //======================= JE DECOCHE ======================//
    if (
      espace.infos.gammeCafeSelected === gamme &&
      cafe.infos.entrepriseId === entrepriseId
    ) {
      setCafe((prev) => ({
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
            gammeCafeSelected:
              item.infos.espaceId === espace.infos.espaceId
                ? null
                : item.infos.gammeCafeSelected,
            marque: null,
            modele: null,
            reconditionne: false,
            typeLait: null,
            typeChocolat: null,
          },
          quantites: {
            ...item.quantites,
            nbMachines: null,
            nbPassagesParAn: null,
          },
          prix: {
            prixLoc: null,
            prixInstal: null,
            prixMaintenance: null,
            prixUnitaireConsoCafe: null,
            prixUnitaireConsoLait: null,
            prixUnitaireConsoChocolat: null,
            prixUnitaireConsoSucre: null,
          },
        })),
      }));
      setThe((prev) => ({
        ...prev,
        prix: {
          prixUnitaire: null,
        },
      }));
    } else {
      //======================== JE COCHE ======================//
      //Pour chaque espace et le the si gammeCafeSelected je mets à jour les prix et le total

      if (entrepriseId !== cafe.infos.entrepriseId) {
        toast({
          title: t("fournisseur-selectionne"),
          description: tCafe(
            "vous-avez-choisi-nomfournisseur-pour-le-cafe-ce-prestataire-assurera-la-prestation-thes-varies",
            { nomPrestataire },
          ),
        });
      }
      const newCafeInfos = {
        ...cafe.infos,
        entrepriseId,
        nomPrestataire,
        sloganPrestataire,
        logoStorageKey,
      };
      const newEspace: CafeEspaceType[] = [];
      cafe.espaces.forEach((item) => {
        if (item.infos.espaceId === espace.infos.espaceId) {
          //1ER LOT
          newEspace.push({
            ...item,
            infos: {
              ...item.infos,
              gammeCafeSelected: gamme,
              marque,
              modele,
              reconditionne,
              typeLait,
              typeChocolat,
            },
            quantites: {
              ...item.quantites,
              nbPassagesParAn,
              nbMachines,
            },
            prix: {
              prixLoc,
              prixInstal,
              prixMaintenance,
              prixUnitaireConsoCafe,
              prixUnitaireConsoLait,
              prixUnitaireConsoChocolat,
              prixUnitaireConsoSucre,
            },
          });
          return;
        }
        //AUTRES LOTS
        if (!item.infos.gammeCafeSelected) {
          //pas de selection
          newEspace.push(item);
          return;
        }
        //selection existante je recalcule tout
        const itemNbPersonnes =
          item.quantites.nbPersonnes ??
          (effectif > MAX_NB_PERSONNES_PAR_ESPACE
            ? MAX_NB_PERSONNES_PAR_ESPACE
            : effectif);
        const itemMachinesTarifFournisseur = cafeMachinesTarifs.find(
          (tarif) =>
            tarif.nbPersonnes ===
              roundNbPersonnesCafeMachines(itemNbPersonnes) &&
            tarif.type === item.infos.typeBoissons &&
            tarif[cafe.infos.dureeLocation] !== null &&
            tarif.entrepriseId === entrepriseId,
        );
        if (!itemMachinesTarifFournisseur) {
          newEspace.push(item);
          return;
        }
        const itemNbMachines = itemMachinesTarifFournisseur?.nbMachines ?? null;
        const itemPrixLoc =
          itemMachinesTarifFournisseur?.[cafe.infos.dureeLocation] ?? null;
        const itemPrixInstal =
          itemMachinesTarifFournisseur?.fraisInstallation ?? null;
        const itemPrixMaintenance =
          itemMachinesTarifFournisseur?.paMaintenance ?? null;
        const itemNbPassagesParAn =
          itemMachinesTarifFournisseur?.nbPassages ?? null;
        const itemPrixUnitaireConsoCafe =
          cafeConsoTarifs.find(
            (tarif) =>
              tarif.effectif === roundNbPersonnesCafeConso(itemNbPersonnes) &&
              tarif.entrepriseId === entrepriseId &&
              tarif.gamme === item.infos.gammeCafeSelected,
          )?.prixUnitaire ?? null;
        const itemConsoLaitTarifFournisseur = laitConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundNbPersonnesCafeConso(itemNbPersonnes) &&
            tarif.entrepriseId === entrepriseId,
        );
        const itemTypeLait =
          item.infos.typeBoissons !== "cafe"
            ? itemMachinesTarifFournisseur?.typeLait
            : null;
        const itemPrixUnitaireConsoLait =
          itemTypeLait === "dosettes"
            ? (itemConsoLaitTarifFournisseur?.prixUnitaireDosette ?? null)
            : itemTypeLait === "frais"
              ? (itemConsoLaitTarifFournisseur?.prixUnitaireFrais ?? null)
              : itemTypeLait === "poudre"
                ? (itemConsoLaitTarifFournisseur?.prixUnitairePoudre ?? null)
                : null;

        const itemConsoChocolatTarifFournisseur = chocolatConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundNbPersonnesCafeConso(itemNbPersonnes) &&
            tarif.entrepriseId === entrepriseId,
        );
        const itemTypeChocolat =
          item.infos.typeBoissons === "chocolat"
            ? itemMachinesTarifFournisseur?.typeChocolat
            : null;
        const itemPrixUnitaireConsoChocolat =
          itemTypeChocolat === "sachets"
            ? (itemConsoChocolatTarifFournisseur?.prixUnitaireSachet ?? null)
            : itemTypeChocolat === "poudre"
              ? (itemConsoChocolatTarifFournisseur?.prixUnitairePoudre ?? null)
              : null;
        const itemConsoSucreTarifFournisseur = sucreConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundNbPersonnesCafeConso(itemNbPersonnes) &&
            tarif.entrepriseId === entrepriseId,
        );
        const itemPrixUnitaireConsoSucre =
          itemConsoSucreTarifFournisseur?.prixUnitaire ?? null;

        const itemModele = itemMachinesTarifFournisseur
          ? (cafeMachines?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.cafeMachineId,
            )?.modele ?? null)
          : null;
        const itemMarque = itemMachinesTarifFournisseur
          ? (cafeMachines?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.cafeMachineId,
            )?.marque ?? null)
          : null;
        const itemReconditionne = itemMachinesTarifFournisseur
          ? (itemMachinesTarifFournisseur.reconditionne ?? null)
          : null;
        newEspace.push({
          infos: {
            ...item.infos,
            marque: itemMarque,
            modele: itemModele,
            reconditionne: itemReconditionne,
            typeLait: itemTypeLait,
            typeChocolat: itemTypeChocolat,
          },
          quantites: {
            ...item.quantites,
            nbMachines: itemNbMachines,
            nbPassagesParAn: itemNbPassagesParAn,
          },
          prix: {
            prixLoc: itemPrixLoc,
            prixInstal: itemPrixInstal,
            prixMaintenance: itemPrixMaintenance,
            prixUnitaireConsoCafe: itemPrixUnitaireConsoCafe,
            prixUnitaireConsoLait: itemPrixUnitaireConsoLait,
            prixUnitaireConsoChocolat: itemPrixUnitaireConsoChocolat,
            prixUnitaireConsoSucre: itemPrixUnitaireConsoSucre,
          },
        });
      });
      setCafe((prev) => ({
        ...prev,
        infos: newCafeInfos,
        espaces: newEspace,
      }));
      if (the.infos.gammeSelected) {
        const nbPersonnesThe =
          the.quantites.nbPersonnes || Math.round(effectif * 0.15);
        const theConsoTarifFournisseur = theConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundEffectif(nbPersonnesThe) &&
            tarif.entrepriseId === entrepriseId &&
            tarif.gamme === the.infos.gammeSelected,
        );
        const prixUnitaireThe = theConsoTarifFournisseur?.prixUnitaire ?? null;
        setThe((prev) => ({
          ...prev,
          prix: {
            prixUnitaire: prixUnitaireThe,
          },
        }));
      }
    }
  };

  const handleAddEspace = () => {
    setCafe((prev) => ({
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
            typeBoissons: "cafe" as TypesBoissonsType,
            gammeCafeSelected: null,
            marque: null,
            modele: null,
            reconditionne: false,
            typeLait: null,
            typeChocolat: null,
          },
          quantites: {
            nbPersonnes:
              effectif > MAX_NB_PERSONNES_PAR_ESPACE
                ? MAX_NB_PERSONNES_PAR_ESPACE
                : effectif,
            nbMachines: null,
            nbPassagesParAn: null,
          },
          prix: {
            prixLoc: null,
            prixInstal: null,
            prixMaintenance: null,
            prixUnitaireConsoCafe: null,
            prixUnitaireConsoLait: null,
            prixUnitaireConsoChocolat: null,
            prixUnitaireConsoSucre: null,
          },
        },
      ].sort((a, b) => a.infos.espaceId - b.infos.espaceId),
    }));
  };
  const handleClickNext = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };
  const handleClickNextEspace = () => {
    const indexOfCurrentEspace = cafeEspacesIds.indexOf(espace.infos.espaceId);

    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentEspaceId: cafeEspacesIds[indexOfCurrentEspace + 1],
      },
    }));
  };

  const handleAlert = () => {
    if (!espace.infos.gammeCafeSelected) {
      toast({
        description: tCafe(
          "veuillez-dabord-selectionner-une-offre-ou-retirer-tous-les-espaces",
        ),
        duration: 3000,
        variant: "destructive",
        className: "left-0",
      });
      return;
    }
  };

  return isTabletOrMobile ? (
    <CafeMobileEspacePropositions
      formattedPropositions={formattedPropositions}
      handleClickFirstEspaceProposition={handleClickFirstEspaceProposition}
      handleClickProposition={handleClickProposition}
      handleAddEspace={handleAddEspace}
      cafeEspacesIds={cafeEspacesIds}
      espace={espace}
    />
  ) : (
    <CafeDesktopEspacePropositions
      formattedPropositions={formattedPropositions}
      handleClickFirstEspaceProposition={handleClickFirstEspaceProposition}
      handleClickProposition={handleClickProposition}
      handleAddEspace={handleAddEspace}
      handleClickNext={handleClickNext}
      handleClickNextEspace={handleClickNextEspace}
      handleAlert={handleAlert}
      cafeEspacesIds={cafeEspacesIds}
      espace={espace}
    />
  );
};

export default CafeEspacePropositions;
