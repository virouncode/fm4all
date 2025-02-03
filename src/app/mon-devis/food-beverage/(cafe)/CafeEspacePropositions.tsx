"use client";

import { RATIO_CHOCO, RATIO_LAIT, RATIO_SUCRE } from "@/constants/constants";
import { TypesBoissonsType } from "@/constants/typesBoissons";
import { TypesSnacksFruitsType } from "@/constants/typesSnacksFruits";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { toast } from "@/hooks/use-toast";
import { roundEffectif } from "@/lib/roundEffectif";
import { roundNbPersonnesCafeConso } from "@/lib/roundNbPersonnesCafeConso";
import { roundNbPersonnesCafeMachines } from "@/lib/roundNbPersonnesCafeMachines";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs";
import { gammes, GammeType } from "@/zod-schemas/gamme";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { useContext } from "react";
import NextServiceButton from "../../NextServiceButton";
import AddEspaceButton from "./AddEspaceButton";
import CafeEspacePropositionCard from "./CafeEspacePropositionCard";
import CafeEspacePropositionFournisseurLogo from "./CafeEspacePropositionFournisseurLogo";
import NextEspaceButton from "./NextEspaceButton";

export const MAX_NB_PERSONNES_PAR_ESPACE = 150;

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
  const { client } = useContext(ClientContext);
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { the, setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);

  //Calcul des propositions
  const cafeEspacesIds = cafe.espaces.map((espace) => espace.infos.espaceId);
  const effectif = client.effectif ?? 0;
  const nbPersonnes =
    espace.quantites.nbPersonnes ||
    (effectif > MAX_NB_PERSONNES_PAR_ESPACE
      ? MAX_NB_PERSONNES_PAR_ESPACE
      : effectif);
  const nbTassesParJ = nbPersonnes * 2;

  const machinesTarifs = cafeMachinesTarifs.filter(
    (tarif) =>
      tarif.nbPersonnes === roundNbPersonnesCafeMachines(nbPersonnes) &&
      tarif.type === espace.infos.typeBoissons
  ); //1 ligne par fournisseur

  const fournisseursCompatiblesIds = machinesTarifs
    ?.filter((tarif) => tarif[cafe.infos.dureeLocation] !== null)
    .map(({ fournisseurId }) => fournisseurId);

  if (
    cafe.infos.fournisseurId &&
    cafeEspacesIds[0] !== espace.infos.espaceId &&
    !fournisseursCompatiblesIds.includes(cafe.infos.fournisseurId)
  ) {
    return (
      <div className="flex-1 flex items-center justify-center border rounded-xl">
        <p className="max-w-prose text-center text-base">
          Le fournisseur choisi précédemment ne propose pas d&apos;offre pour
          ces critères, veuillez changer le type de boissons ou le nombre de
          personnes.
        </p>
      </div>
    );
  }

  const fournisseursIds =
    cafe.infos.fournisseurId && cafeEspacesIds[0] !== espace.infos.espaceId
      ? [cafe.infos.fournisseurId] //1 seul fournisseur
      : machinesTarifs?.map(({ fournisseurId }) => fournisseurId); //tous les fournisseurs

  const nbTassesParAn = nbPersonnes * 400;

  const nbPersonnesTotal = cafe.espaces.reduce(
    (acc, curr) =>
      acc +
      (cafeEspacesIds[0] === curr.infos.espaceId ||
      curr.infos.gammeCafeSelected !== null
        ? curr.quantites.nbPersonnes ||
          (effectif > MAX_NB_PERSONNES_PAR_ESPACE
            ? MAX_NB_PERSONNES_PAR_ESPACE
            : effectif)
        : 0),
    0
  );

  const propositions = cafeConsoTarifs
    .filter(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(nbPersonnesTotal) &&
        fournisseursIds.includes(tarif.fournisseurId)
    )
    .map((tarif) => {
      const {
        id,
        infos,
        fournisseurId,
        nomFournisseur,
        slogan: sloganFournisseur,
        gamme,
        prixUnitaire,
      } = tarif;
      //MACHINES
      const machinesTarifFournisseur = machinesTarifs.find(
        (item) => item.fournisseurId === fournisseurId
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
          tarif.effectif === roundNbPersonnesCafeConso(nbPersonnesTotal) &&
          tarif.fournisseurId === fournisseurId
      );
      const typeLait =
        espace.infos.typeBoissons !== "cafe"
          ? machinesTarifFournisseur?.typeLait ?? null
          : null;
      const prixUnitaireConsoLait =
        typeLait === "dosettes"
          ? consoLaitTarifFournisseur?.prixUnitaireDosette ?? null
          : typeLait === "frais"
          ? consoLaitTarifFournisseur?.prixUnitaireFrais ?? null
          : typeLait === "poudre"
          ? consoLaitTarifFournisseur?.prixUnitairePoudre ?? null
          : null;
      //CHOCOLAT
      const consoChocolatTarifFournisseur = chocolatConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(nbPersonnesTotal) &&
          tarif.fournisseurId === fournisseurId
      );
      const typeChocolat =
        espace.infos.typeBoissons === "chocolat"
          ? machinesTarifFournisseur?.typeChocolat ?? null
          : null;
      const prixUnitaireConsoChocolat =
        typeChocolat === "sachets"
          ? consoChocolatTarifFournisseur?.prixUnitaireSachet ?? null
          : typeChocolat === "poudre"
          ? consoChocolatTarifFournisseur?.prixUnitairePoudre ?? null
          : null;
      //SUCRE
      const consoSucreTarifFournisseur = sucreConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(nbPersonnesTotal) &&
          tarif.fournisseurId === fournisseurId
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

      const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
      //Modele
      const modele = machinesTarifFournisseur
        ? cafeMachines?.find(
            ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
          )?.modele ?? null
        : null;
      const marque = machinesTarifFournisseur
        ? cafeMachines?.find(
            ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
          )?.marque ?? null
        : null;
      const reconditionne = machinesTarifFournisseur
        ? machinesTarifFournisseur.reconditionne ?? null
        : null;
      return {
        id,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        gamme,
        modele,
        marque,
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
      number,
      {
        id: number;
        fournisseurId: number;
        nomFournisseur: string;
        sloganFournisseur: string | null;
        gamme: GammeType;
        modele: string | null;
        marque: string | null;
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

  const formattedPropositions = Object.values(propositionsByFournisseurId);

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: GammeType;
    modele: string | null;
    marque: string | null;
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
      fournisseurId,
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
      cafe.infos.fournisseurId === fournisseurId
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
            : item
        ),
      }));
      setTotalCafe((prev) => ({
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
            : item
        ),
      }));
      setTotalCafe((prev) => ({
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
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
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
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
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
      cafe.infos.fournisseurId === fournisseurId
    ) {
      setCafe((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
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
      setTotalCafe((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) => ({
          ...item,
          total: null,
          totalInstallation: null,
        })),
      }));
      setTotalThe({
        totalService: null,
      });
      //Voir si snacks fruits a des frais de livraison
      if (snacksFruits.infos.gammeSelected) {
        const prixPanierSnacksFruits = snacksFruits.infos.choix.reduce(
          (acc, cur: TypesSnacksFruitsType) => {
            if (cur === "fruits")
              return (
                acc +
                (snacksFruits.quantites.fruitsKgParSemaine ?? 0) *
                  (snacksFruits.prix.prixKgFruits ?? 0)
              );
            else if (cur === "snacks")
              return (
                acc +
                (snacksFruits.quantites.snacksPortionsParSemaine ?? 0) *
                  (snacksFruits.prix.prixUnitaireSnacks ?? 0)
              );
            else if (cur === "boissons")
              return (
                acc +
                (snacksFruits.quantites.boissonsConsosParSemaine ?? 0) *
                  (snacksFruits.prix.prixUnitaireBoissons ?? 0)
              );
            return acc;
          },
          0
        );
        const prixLivraisonPanier =
          prixPanierSnacksFruits >= (snacksFruits.prix.seuilFranco ?? 0)
            ? 0
            : snacksFruits.prix.prixUnitaireLivraison;
        const totalLivraison =
          prixLivraisonPanier !== null
            ? Math.round(52 * prixLivraisonPanier)
            : null;
        setTotalSnacksFruits((prev) => ({
          ...prev,
          totalLivraison,
        }));
      }
    } else {
      //======================== JE COCHE ======================//
      //Pour chaque espace et le the si gammeCafeSelected je mets à jour les prix et le total
      const newCafeInfos = {
        ...cafe.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
      };
      const newEspace: CafeEspaceType[] = [];
      const newTotalEspace: {
        espaceId: number;
        total: number | null;
        totalInstallation: number | null;
      }[] = [];
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
          newTotalEspace.push({
            espaceId: item.infos.espaceId,
            total: totalAnnuel,
            totalInstallation: totalInstallation,
          });
          return;
        }
        //AUTRES LOTS
        if (!item.infos.gammeCafeSelected) {
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
          (effectif > MAX_NB_PERSONNES_PAR_ESPACE
            ? MAX_NB_PERSONNES_PAR_ESPACE
            : effectif);
        const itemNbTassesParAn = itemNbPersonnes * 400;

        const itemMachinesTarifFournisseur = cafeMachinesTarifs.find(
          (tarif) =>
            tarif.nbPersonnes ===
              roundNbPersonnesCafeMachines(itemNbPersonnes) &&
            tarif.type === item.infos.typeBoissons &&
            tarif[cafe.infos.dureeLocation] !== null &&
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
        const itemNbMachines = itemMachinesTarifFournisseur?.nbMachines ?? null;
        const itemPrixLoc =
          itemMachinesTarifFournisseur?.[cafe.infos.dureeLocation] ?? null;
        const itemPrixInstal =
          itemMachinesTarifFournisseur?.fraisInstallation ?? null;
        const itemTotalInstallation =
          itemPrixInstal !== null ? itemPrixInstal : null;
        const itemPrixMaintenance =
          itemMachinesTarifFournisseur?.paMaintenance ?? null;
        const itemNbPassagesParAn =
          itemMachinesTarifFournisseur?.nbPassages ?? null;
        const itemPrixUnitaireConsoCafe =
          cafeConsoTarifs.find(
            (tarif) =>
              tarif.effectif === roundNbPersonnesCafeConso(nbPersonnesTotal) &&
              tarif.fournisseurId === fournisseurId &&
              tarif.gamme === item.infos.gammeCafeSelected
          )?.prixUnitaire ?? null;
        const itemConsoLaitTarifFournisseur = laitConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundNbPersonnesCafeConso(nbPersonnesTotal) &&
            tarif.fournisseurId === fournisseurId
        );
        const itemTypeLait =
          espace.infos.typeBoissons !== "cafe"
            ? itemMachinesTarifFournisseur?.typeLait
            : null;
        const itemPrixUnitaireConsoLait =
          itemTypeLait === "dosettes"
            ? itemConsoLaitTarifFournisseur?.prixUnitaireDosette ?? null
            : itemTypeLait === "frais"
            ? itemConsoLaitTarifFournisseur?.prixUnitaireFrais ?? null
            : itemTypeLait === "poudre"
            ? itemConsoLaitTarifFournisseur?.prixUnitairePoudre ?? null
            : null;

        const itemConsoChocolatTarifFournisseur = chocolatConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundNbPersonnesCafeConso(nbPersonnesTotal) &&
            tarif.fournisseurId === fournisseurId
        );
        const itemTypeChocolat =
          espace.infos.typeBoissons === "chocolat"
            ? itemMachinesTarifFournisseur?.typeChocolat
            : null;
        const itemPrixUnitaireConsoChocolat =
          itemTypeChocolat === "sachets"
            ? itemConsoChocolatTarifFournisseur?.prixUnitaireSachet ?? null
            : itemTypeChocolat === "poudre"
            ? itemConsoChocolatTarifFournisseur?.prixUnitairePoudre ?? null
            : null;
        const itemConsoSucreTarifFournisseur = sucreConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundNbPersonnesCafeConso(nbPersonnesTotal) &&
            tarif.fournisseurId === fournisseurId
        );
        const itemPrixUnitaireConsoSucre =
          itemConsoSucreTarifFournisseur?.prixUnitaire ?? null;

        const itemTotalLoc =
          itemPrixLoc !== null && itemPrixMaintenance !== null
            ? itemPrixLoc + itemPrixMaintenance
            : null;
        const itemTotalConso =
          (itemPrixUnitaireConsoCafe ?? 0) * itemNbTassesParAn +
          (itemPrixUnitaireConsoSucre ?? 0) * itemNbTassesParAn * RATIO_SUCRE +
          (espace.infos.typeBoissons !== "cafe"
            ? (itemPrixUnitaireConsoLait ?? 0) * itemNbTassesParAn * RATIO_LAIT
            : 0) +
          (espace.infos.typeBoissons === "chocolat"
            ? (itemPrixUnitaireConsoChocolat ?? 0) *
              itemNbTassesParAn *
              RATIO_CHOCO
            : 0);
        const itemTotalAnnuel =
          itemTotalLoc !== null ? itemTotalLoc + itemTotalConso : null;
        const itemModele = itemMachinesTarifFournisseur
          ? cafeMachines?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.cafeMachineId
            )?.modele ?? null
          : null;
        const itemMarque = itemMachinesTarifFournisseur
          ? cafeMachines?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.cafeMachineId
            )?.marque ?? null
          : null;
        const itemReconditionne = itemMachinesTarifFournisseur
          ? itemMachinesTarifFournisseur.reconditionne ?? null
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
        newTotalEspace.push({
          espaceId: item.infos.espaceId,
          total: itemTotalAnnuel,
          totalInstallation: itemTotalInstallation,
        });
      });
      setCafe((prev) => ({
        ...prev,
        infos: newCafeInfos,
        espaces: newEspace,
      }));
      setTotalCafe({
        totalEspaces: newTotalEspace,
      });
      if (the.infos.gammeSelected) {
        const nbPersonnesThe =
          the.quantites.nbPersonnes || Math.round(effectif * 0.15);
        const nbTassesThesParAn = nbPersonnesThe * 400;
        const theConsoTarifFournisseur = theConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundEffectif(nbPersonnesThe) &&
            tarif.fournisseurId === fournisseurId &&
            tarif.gamme === the.infos.gammeSelected
        );
        const prixUnitaireThe = theConsoTarifFournisseur?.prixUnitaire ?? null;
        const totalThe =
          prixUnitaireThe !== null ? nbTassesThesParAn * prixUnitaireThe : null;
        setThe((prev) => ({
          ...prev,
          prix: {
            prixUnitaire: prixUnitaireThe,
          },
        }));
        setTotalThe({
          totalService: totalThe,
        });
      } else {
        setTotalThe({
          totalService: null,
        });
      }
      //Voir si snacks fruits a des frais de livraison
      if (snacksFruits.infos.gammeSelected) {
        const prixPanierSnacksFruits = snacksFruits.infos.choix.reduce(
          (acc, cur: TypesSnacksFruitsType) => {
            if (cur === "fruits")
              return (
                acc +
                (snacksFruits.quantites.fruitsKgParSemaine ?? 0) *
                  (snacksFruits.prix.prixKgFruits ?? 0)
              );
            else if (cur === "snacks")
              return (
                acc +
                (snacksFruits.quantites.snacksPortionsParSemaine ?? 0) *
                  (snacksFruits.prix.prixUnitaireSnacks ?? 0)
              );
            else if (cur === "boissons")
              return (
                acc +
                (snacksFruits.quantites.boissonsConsosParSemaine ?? 0) *
                  (snacksFruits.prix.prixUnitaireBoissons ?? 0)
              );
            return acc;
          },
          0
        );
        const isSameFournisseur =
          snacksFruits.infos.fournisseurId === fournisseurId;
        const prixLivraisonPanier =
          prixPanierSnacksFruits >= (snacksFruits.prix.seuilFranco ?? 0)
            ? 0
            : isSameFournisseur
            ? snacksFruits.prix.prixUnitaireLivraisonSiCafe
            : snacksFruits.prix.prixUnitaireLivraison;
        const totalLivraison =
          prixLivraisonPanier !== null
            ? Math.round(52 * prixLivraisonPanier)
            : null;
        setTotalSnacksFruits((prev) => ({
          ...prev,
          totalLivraison,
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
    setTotalCafe((prev) => ({
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
  const handleClickNext = () => {
    if (!cafe.infos.fournisseurId) {
      //pour skiper le the si pas de cafe
      setFoodBeverage((prev) => ({
        ...prev,
        currentFoodBeverageId: prev.currentFoodBeverageId + 2,
      }));
      return;
    }
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
        description:
          "Veuillez d'abord sélectionner une offre ou retirer tous les espaces",
        duration: 3000,
        variant: "destructive",
        className: "left-0",
      });
      return;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-auto">
      <div className="flex-1 flex flex-col border rounded-xl overflow-auto">
        {formattedPropositions.map((propositions) => (
          <div
            className="flex border-b flex-1"
            key={propositions[0].fournisseurId}
          >
            <CafeEspacePropositionFournisseurLogo {...propositions[0]} />
            {propositions.map((proposition) => (
              <CafeEspacePropositionCard
                key={proposition.id}
                proposition={proposition}
                handleClickProposition={handleClickProposition}
                handleClickFirstEspaceProposition={
                  handleClickFirstEspaceProposition
                }
                espace={espace}
                cafeEspacesIds={cafeEspacesIds}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {cafeEspacesIds.slice(-1)[0] === espace.infos.espaceId ? (
          <div className="flex justify-end gap-4 items-center">
            {espace.infos.gammeCafeSelected ? (
              <AddEspaceButton handleAddEspace={handleAddEspace} />
            ) : null}
            <NextServiceButton handleClickNext={handleClickNext} />
          </div>
        ) : (
          <div className="ml-auto" onClick={handleAlert}>
            <NextEspaceButton
              disabled={espace.infos.gammeCafeSelected ? false : true}
              handleClickNextEspace={handleClickNextEspace}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeEspacePropositions;
