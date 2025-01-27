"use client";

import { Button } from "@/components/ui/button";
import { RATIO_CHOCO, RATIO_LAIT } from "@/constants/constants";
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
import { toLimiteBoissonsParJParMachine } from "@/lib/roundLimitBoissonsParJParMachine";
import { CafeLotType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { gammes, GammeType } from "@/zod-schemas/gamme";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { useContext } from "react";
import NextServiceButton from "../../NextServiceButton";
import CafeLotPropositionCard from "./CafeLotPropositionCard";
import CafeLotPropositionFournisseurLogo from "./CafeLotPropositionFournisseurLogo";

type CafeLotPropositionsProps = {
  lot: CafeLotType;
  cafeMachines: SelectCafeMachinesType[];
  cafeQuantites: SelectCafeQuantitesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocoConsoTarifs: SelectChocoConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const CafeLotPropositions = ({
  lot,
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
  theConsoTarifs,
}: CafeLotPropositionsProps) => {
  const { client } = useContext(ClientContext);
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { the, setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);

  //Calcul des propositions
  const cafeLotsMachinesIds = cafe.lotsMachines.map((lot) => lot.infos.lotId);
  const effectif = client.effectif ?? 0;
  const nbPersonnes = lot.quantites.nbPersonnes || effectif;

  const cafeQuantite = cafeQuantites.find(
    ({ effectif }) => effectif === roundEffectif(nbPersonnes)
  );
  const nbMachines =
    (lot.quantites.nbMachines || cafeQuantite?.nbMachines) ?? 1;
  const nbTassesParJ = nbPersonnes * 2;
  const nbTassesParJParMachine = Math.round(nbTassesParJ / nbMachines);
  const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
    nbTassesParJParMachine
  );
  const machinesTarifs = cafeMachinesTarifs.filter(
    (tarif) =>
      tarif.limiteTassesJ === limiteTassesJParMachine &&
      tarif.type === lot.infos.typeBoissons &&
      tarif[cafe.infos.dureeLocation] !== null
  );
  const fournisseursCompatiblesIds = machinesTarifs?.map(
    ({ fournisseurId }) => fournisseurId
  );

  if (
    cafe.infos.fournisseurId &&
    cafeLotsMachinesIds[0] !== lot.infos.lotId &&
    !fournisseursCompatiblesIds.includes(cafe.infos.fournisseurId)
  ) {
    return (
      <div className="flex-1 flex items-center justify-center border rounded-xl">
        <p className="max-w-prose text-center text-base">
          Le fournisseur choisi précédemment ne propose pas d&apos;offre pour
          ces critères, veuillez changer le type de machine, le nombre de
          personnes ou la duree de location
        </p>
      </div>
    );
  }

  const fournisseursIds =
    cafe.infos.fournisseurId && cafeLotsMachinesIds[0] !== lot.infos.lotId
      ? [cafe.infos.fournisseurId] //1 seul fournisseur
      : machinesTarifs?.map(({ fournisseurId }) => fournisseurId); //tous les fournisseurs qui ont une offre pour ce typede boissons, cette duree de loc et cette limite de tasses par jour

  const nbTassesParAn = nbPersonnes * 400;

  const propositions = cafeConsoTarifs
    .filter(
      (tarif) =>
        tarif.effectif === roundEffectif(nbPersonnes) &&
        fournisseursIds.includes(tarif.fournisseurId)
    )
    .map((tarif) => {
      const {
        id,
        fournisseurId,
        nomFournisseur,
        slogan: sloganFournisseur,
        gamme,
      } = tarif;
      //Consommables
      //TODO : rajouter les agitateurs + sucre
      const prixUnitaireConsoCafe = tarif.prixUnitaire;
      const prixUnitaireConsoLait =
        laitConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundEffectif(nbPersonnes) &&
            tarif.fournisseurId === tarif.fournisseurId
        )?.prixUnitaire ?? null;
      const prixUnitaireConsoChocolat =
        chocoConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundEffectif(nbPersonnes) &&
            tarif.fournisseurId === tarif.fournisseurId
        )?.prixUnitaire ?? null;
      const prixAnnuelConsoCafe = prixUnitaireConsoCafe * nbTassesParAn;
      const prixAnnuelConsoLait =
        prixUnitaireConsoLait !== null
          ? prixUnitaireConsoLait * nbTassesParAn * RATIO_LAIT
          : null;
      const prixAnnuelConsoChocolat =
        prixUnitaireConsoChocolat !== null
          ? prixUnitaireConsoChocolat * nbTassesParAn * RATIO_CHOCO
          : null;
      const prixAnnuelConso =
        prixAnnuelConsoCafe +
        (lot.infos.typeBoissons !== "cafe" ? prixAnnuelConsoLait ?? 0 : 0) +
        (lot.infos.typeBoissons === "chocolat"
          ? prixAnnuelConsoChocolat ?? 0
          : 0);

      const machinesTarifFournisseur = machinesTarifs.find(
        (item) => item.fournisseurId === tarif.fournisseurId
      );
      //Machines
      const prixUnitaireLoc =
        machinesTarifFournisseur?.[cafe.infos.dureeLocation] ?? null;
      const prixUnitaireInstal =
        machinesTarifFournisseur?.prixInstallation ?? null;
      const prixUnitaireMaintenance =
        machinesTarifFournisseur?.paMaintenance ?? null;

      const prixAnnuel =
        prixUnitaireLoc !== null && prixUnitaireMaintenance !== null
          ? Math.round(
              prixAnnuelConso +
                nbMachines * (prixUnitaireLoc + prixUnitaireMaintenance)
            )
          : null;
      const prixInstallation =
        prixUnitaireInstal !== null ? prixUnitaireInstal * nbMachines : null;

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
        reconditionne,
        prixUnitaireLoc,
        prixUnitaireInstal,
        prixUnitaireMaintenance,
        prixUnitaireConsoCafe,
        prixUnitaireConsoLait,
        prixUnitaireConsoChocolat,
        prixAnnuel,
        prixInstallation,
        nbMachines,
        nbTassesParJ,
      };
    });
  const propositionsByFournisseurId = propositions
    .filter((proposition) => proposition.prixAnnuel)
    .reduce<
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
          reconditionne: boolean | null;
          prixUnitaireLoc: number | null;
          prixUnitaireInstal: number | null;
          prixUnitaireMaintenance: number | null;
          prixUnitaireConsoCafe: number;
          prixUnitaireConsoLait: number | null;
          prixUnitaireConsoChocolat: number | null;
          prixAnnuel: number | null;
          prixInstallation: number | null;
          nbMachines: number;
          nbTassesParJ: number;
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
    reconditionne: boolean | null;
    prixUnitaireLoc: number | null;
    prixUnitaireInstal: number | null;
    prixUnitaireMaintenance: number | null;
    prixUnitaireConsoCafe: number;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixAnnuel: number | null;
    prixInstallation: number | null;
    nbMachines: number;
    nbTassesParJ: number;
  }) => {
    const {
      fournisseurId,
      gamme,
      modele,
      marque,
      reconditionne,
      prixUnitaireLoc,
      prixUnitaireInstal,
      prixUnitaireMaintenance,
      prixUnitaireConsoCafe,
      prixUnitaireConsoLait,
      prixUnitaireConsoChocolat,
      prixAnnuel,
      prixInstallation,
      nbMachines,
    } = proposition;
    //Je décoche
    if (
      lot.infos.gammeCafeSelected === gamme &&
      cafe.infos.fournisseurId === fournisseurId
    ) {
      setCafe((prev) => ({
        ...prev,
        lotsMachines: prev.lotsMachines.map((item) =>
          item.infos.lotId === lot.infos.lotId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  gammeCafeSelected: null,
                  marque: null,
                  modele: null,
                  reconditionne: false,
                },
                quantites: {
                  ...item.quantites,
                  nbMachines: null,
                },
                prix: {
                  prixUnitaireLoc: null,
                  prixUnitaireInstal: null,
                  prixUnitaireMaintenance: null,
                  prixUnitaireConsoCafe: null,
                  prixUnitaireConsoLait: null,
                  prixUnitaireConsoChocolat: null,
                },
              }
            : item
        ),
      }));
      setTotalCafe((prev) => ({
        totalMachines: prev.totalMachines.map((item) =>
          item.lotId === lot.infos.lotId
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
        lotsMachines: prev.lotsMachines.map((item) =>
          item.infos.lotId === lot.infos.lotId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  gammeCafeSelected: gamme,
                  marque,
                  modele,
                  reconditionne,
                },
                quantites: {
                  ...item.quantites,
                  nbMachines,
                },
                prix: {
                  prixUnitaireLoc,
                  prixUnitaireInstal,
                  prixUnitaireMaintenance,
                  prixUnitaireConsoCafe,
                  prixUnitaireConsoLait,
                  prixUnitaireConsoChocolat,
                },
              }
            : item
        ),
      }));
      setTotalCafe((prev) => ({
        totalMachines: prev.totalMachines.map((item) =>
          item.lotId === lot.infos.lotId
            ? {
                ...item,
                total: prixAnnuel,
                totalInstallation: prixInstallation,
              }
            : item
        ),
      }));
    }
  };

  const handleClickFirstLotProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    reconditionne: boolean | null;
    prixUnitaireLoc: number | null;
    prixUnitaireInstal: number | null;
    prixUnitaireMaintenance: number | null;
    prixUnitaireConsoCafe: number;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixAnnuel: number | null;
    prixInstallation: number | null;
    nbMachines: number;
    nbTassesParJ: number;
  }) => {
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      gamme,
      modele: modeleProposition,
      marque: marqueProposition,
      reconditionne: reconditionneProposition,
      prixUnitaireLoc: prixUnitaireLocProposition,
      prixUnitaireInstal: prixUnitaireInstalProposition,
      prixUnitaireMaintenance: prixUnitaireMaintenanceProposition,
      prixUnitaireConsoCafe: prixUnitaireConsoCafeProposition,
      prixUnitaireConsoLait: prixUnitaireConsoLaitProposition,
      prixUnitaireConsoChocolat: prixUnitaireConsoChocolatProposition,
      prixAnnuel: prixAnnuelProposition,
      prixInstallation: prixInstallationProposition,
      nbMachines: nbMachinesProposition,
    } = proposition;
    //======================= JE DECOCHE ======================//
    if (
      lot.infos.gammeCafeSelected === gamme &&
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
        lotsMachines: prev.lotsMachines.map((item) => ({
          ...item,
          infos: {
            ...item.infos,
            gammeCafeSelected:
              item.infos.lotId === lot.infos.lotId
                ? null
                : item.infos.gammeCafeSelected,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          quantites: {
            ...item.quantites,
            nbMachines: null,
          },
          prix: {
            prixUnitaireLoc: null,
            prixUnitaireInstal: null,
            prixUnitaireMaintenance: null,
            prixUnitaireConsoCafe: null,
            prixUnitaireConsoLait: null,
            prixUnitaireConsoChocolat: null,
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
        totalMachines: prev.totalMachines.map((item) => ({
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
      //Pour chaque lot et le the si gammeCafeSelected je mets à jour les prix et le total
      const newCafeInfos = {
        ...cafe.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
      };
      const newLotMachines: CafeLotType[] = [];
      const newTotalMachines: {
        lotId: number;
        total: number | null;
        totalInstallation: number | null;
      }[] = [];
      cafe.lotsMachines.forEach((item) => {
        if (item.infos.lotId === lot.infos.lotId) {
          //1ER LOT
          newLotMachines.push({
            ...item,
            infos: {
              ...item.infos,
              gammeCafeSelected: gamme,
              marque: marqueProposition,
              modele: modeleProposition,
              reconditionne: reconditionneProposition,
            },
            quantites: {
              ...item.quantites,
              nbMachines: nbMachinesProposition,
            },
            prix: {
              prixUnitaireLoc: prixUnitaireLocProposition,
              prixUnitaireInstal: prixUnitaireInstalProposition,
              prixUnitaireMaintenance: prixUnitaireMaintenanceProposition,
              prixUnitaireConsoCafe: prixUnitaireConsoCafeProposition,
              prixUnitaireConsoLait: prixUnitaireConsoLaitProposition,
              prixUnitaireConsoChocolat: prixUnitaireConsoChocolatProposition,
            },
          });
          newTotalMachines.push({
            lotId: item.infos.lotId,
            total: prixAnnuelProposition,
            totalInstallation: prixInstallationProposition,
          });
          return;
        }
        //AUTRES LOTS
        if (!item.infos.gammeCafeSelected) {
          //pas de selection
          newLotMachines.push(item);
          newTotalMachines.push({
            lotId: item.infos.lotId,
            total: null,
            totalInstallation: null,
          });
          return;
        }
        //selection existante je recalcule tout
        const cafeQuantite = cafeQuantites.find(
          (quantite) => quantite.effectif === roundEffectif(nbPersonnes)
        );
        const nbMachines =
          (item.quantites.nbMachines || cafeQuantite?.nbMachines) ?? 1;
        const nbTassesParJ = nbPersonnes * 2;
        const nbTassesParAn = nbPersonnes * 400;
        const nbTassesParJParMachine = Math.round(nbTassesParJ / nbMachines);
        const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
          nbTassesParJParMachine
        );
        const machinesTarifFournisseur = cafeMachinesTarifs.find(
          (tarif) =>
            tarif.limiteTassesJ === limiteTassesJParMachine &&
            tarif.type === item.infos.typeBoissons &&
            tarif[cafe.infos.dureeLocation] !== null &&
            tarif.fournisseurId === fournisseurId
        );
        if (!machinesTarifFournisseur) {
          newLotMachines.push(item);
          newTotalMachines.push({
            lotId: item.infos.lotId,
            total: null,
            totalInstallation: null,
          });
          return;
        }
        const prixUnitaireLoc =
          machinesTarifFournisseur?.[cafe.infos.dureeLocation] ?? null;
        const prixUnitaireInstal =
          machinesTarifFournisseur?.prixInstallation ?? null;
        const prixUnitaireMaintenance =
          machinesTarifFournisseur?.paMaintenance ?? null;
        const prixUnitaireConsoCafe =
          cafeConsoTarifs.find(
            (tarif) =>
              tarif.effectif === roundEffectif(nbPersonnes) &&
              tarif.fournisseurId === fournisseurId &&
              tarif.gamme === item.infos.gammeCafeSelected
          )?.prixUnitaire ?? null;
        const prixUnitaireConsoLait =
          laitConsoTarifs.find(
            (tarif) =>
              tarif.effectif === roundEffectif(nbPersonnes) &&
              tarif.fournisseurId === fournisseurId
          )?.prixUnitaire ?? null;
        const prixUnitaireConsoChocolat =
          chocoConsoTarifs.find(
            (tarif) =>
              tarif.effectif === roundEffectif(nbPersonnes) &&
              tarif.fournisseurId === fournisseurId
          )?.prixUnitaire ?? null;
        const prixAnnuelConsoCafe =
          prixUnitaireConsoCafe !== null
            ? prixUnitaireConsoCafe * nbTassesParAn
            : null;
        const prixAnnuelConsoLait =
          prixUnitaireConsoLait !== null
            ? prixUnitaireConsoLait * nbTassesParAn * RATIO_LAIT
            : null;
        const prixAnnuelConsoChocolat =
          prixUnitaireConsoChocolat !== null
            ? prixUnitaireConsoChocolat * nbTassesParAn * RATIO_CHOCO
            : null;
        const prixAnnuelConso =
          (prixAnnuelConsoCafe ?? 0) +
          (lot.infos.typeBoissons !== "cafe" ? prixAnnuelConsoLait ?? 0 : 0) +
          (lot.infos.typeBoissons === "chocolat"
            ? prixAnnuelConsoChocolat ?? 0
            : 0);

        const total =
          prixUnitaireLoc !== null && prixUnitaireMaintenance !== null
            ? Math.round(
                prixAnnuelConso +
                  nbMachines * (prixUnitaireLoc + prixUnitaireMaintenance)
              )
            : null;
        const totalInstallation =
          prixUnitaireInstal !== null ? prixUnitaireInstal * nbMachines : null;
        const cafeMachine = cafeMachines.find(
          (item) => item.id === machinesTarifFournisseur.cafeMachineId
        );
        const modele = cafeMachine?.modele ?? null;
        const marque = cafeMachine?.marque ?? null;
        const reconditionne = machinesTarifFournisseur.reconditionne;
        newLotMachines.push({
          infos: {
            ...item.infos,
            marque,
            modele,
            reconditionne,
          },
          quantites: {
            ...item.quantites,
            nbMachines,
          },
          prix: {
            prixUnitaireLoc,
            prixUnitaireInstal,
            prixUnitaireMaintenance,
            prixUnitaireConsoCafe,
            prixUnitaireConsoLait,
            prixUnitaireConsoChocolat,
          },
        });
        newTotalMachines.push({
          lotId: item.infos.lotId,
          total,
          totalInstallation,
        });
      });
      setCafe((prev) => ({
        ...prev,
        infos: newCafeInfos,
        lotsMachines: newLotMachines,
      }));
      setTotalCafe({
        totalMachines: newTotalMachines,
      });
      if (the.infos.gammeSelected) {
        const nbPersonnesThe =
          the.quantites.nbPersonnes || Math.round(effectif * 0.15);
        const nbTassesParAn = nbPersonnesThe * 400;
        const theConsoTarifFournisseur = theConsoTarifs.find(
          (tarif) =>
            tarif.effectif === roundEffectif(nbPersonnesThe) &&
            tarif.fournisseurId === fournisseurId &&
            tarif.gamme === the.infos.gammeSelected
        );
        const prixUnitaireThe = theConsoTarifFournisseur?.prixUnitaire ?? null;
        const totalThe =
          prixUnitaireThe !== null ? nbTassesParAn * prixUnitaireThe : null;
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

  const handleAddLot = () => {
    setCafe((prev) => ({
      infos: {
        ...prev.infos,
        currentLotId:
          prev.lotsMachines[prev.lotsMachines.length - 1].infos.lotId + 1,
      },
      nbLotsMachines: (prev.nbLotsMachines ?? 0) + 1,
      lotsMachines: [
        ...prev.lotsMachines,
        {
          infos: {
            lotId:
              prev.lotsMachines[prev.lotsMachines.length - 1].infos.lotId + 1,
            typeBoissons: "cafe" as TypesBoissonsType,
            gammeCafeSelected: null,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          quantites: {
            nbPersonnes: effectif,
            nbMachines: null,
          },
          prix: {
            prixUnitaireLoc: null,
            prixUnitaireInstal: null,
            prixUnitaireMaintenance: null,
            prixUnitaireConsoCafe: null,
            prixUnitaireConsoLait: null,
            prixUnitaireConsoChocolat: null,
          },
        },
      ].sort((a, b) => a.infos.lotId - b.infos.lotId),
    }));
    setTotalCafe((prev) => ({
      totalMachines: [
        ...prev.totalMachines,
        {
          lotId: prev.totalMachines[prev.totalMachines.length - 1].lotId + 1,
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
  const handleClickNextLot = () => {
    const machinesIds = cafeLotsMachinesIds;
    const indexOfCurrentMachine = machinesIds.indexOf(lot.infos.lotId);

    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentLotId: machinesIds[indexOfCurrentMachine + 1],
      },
    }));
  };

  const handleAlert = () => {
    if (!lot.infos.gammeCafeSelected) {
      toast({
        description:
          "Veuillez d'abord sélectionner une offre ou retirer tous les lots",
        duration: 3000,
        variant: "destructive",
        className: "left-0",
      });
      return;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-auto">
      {isNaN(nbPersonnes) || nbPersonnes < 1 || nbPersonnes > 300 ? (
        <div className="flex-1 flex justify-center items-center border rounded-xl">
          <p className="text-center text-base">
            Veuillez renseigner un nombre de personnes entier compris entre 1 et
            300
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col border rounded-xl overflow-auto">
          {formattedPropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <CafeLotPropositionFournisseurLogo {...propositions[0]} />
              {propositions.map((proposition) => (
                <CafeLotPropositionCard
                  key={proposition.id}
                  proposition={proposition}
                  handleClickProposition={handleClickProposition}
                  handleClickFirstLotProposition={
                    handleClickFirstLotProposition
                  }
                  lot={lot}
                  cafeLotsMachinesIds={cafeLotsMachinesIds}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      <p className="italic text-xs text-end px-2">
        *Le nombre de machines est imposé par le nombre de personnes
      </p>
      {cafeLotsMachinesIds.slice(-1)[0] === lot.infos.lotId ? (
        <div className="flex justify-end gap-4 items-center">
          {lot.infos.gammeCafeSelected ? (
            <Button variant="outline" size="lg" onClick={handleAddLot}>
              Ajouter une/des machine(s)
            </Button>
          ) : null}
          <NextServiceButton handleClickNext={handleClickNext} />
        </div>
      ) : (
        <div className="ml-auto" onClick={handleAlert}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClickNextLot}
            disabled={!lot.infos.gammeCafeSelected}
          >
            Machine(s) suivante(s) ↓
          </Button>
        </div>
      )}
    </div>
  );
};

export default CafeLotPropositions;
